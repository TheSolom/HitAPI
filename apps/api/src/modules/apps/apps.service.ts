import {
    Inject,
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { stringToInt } from '@hitapi/shared/utils';
import type { NullableType, Period } from '@hitapi/types';
import type { IAppsService } from './interfaces/apps-service.interface.js';
import { App } from './entities/app.entity.js';
import { Repositories } from '../../common/constants/repositories.constant.js';
import type { IRequestLogsRepository } from '../request-logs/interfaces/request-logs-repository.interface.js';
import { CreateAppDto } from './dto/create-app.dto.js';
import { UpdateAppDto } from './dto/update-app.dto.js';
import { AppMetricsResponseDto } from './dto/app-metrics-response.dto.js';
import { createSlug } from '../../common/utils/slug.util.js';
import { calculateRate } from '../../common/utils/rates.util.js';

@Injectable()
export class AppsService implements IAppsService {
    constructor(
        @InjectRepository(App) private readonly appsRepository: Repository<App>,
        @Inject(Repositories.REQUEST_LOGS)
        private readonly requestLogsRepository: IRequestLogsRepository,
    ) {}

    private async saveApp(app: App): Promise<App> {
        return this.appsRepository.save(app);
    }

    async findAllByTeam(teamId: string): Promise<App[]> {
        return this.appsRepository.find({
            where: { team: { id: teamId } },
            order: { createdAt: 'DESC' },
            relations: { framework: true },
        });
    }

    async findById(id: string): Promise<NullableType<App>> {
        return this.appsRepository.findOne({
            where: { id },
            relations: { framework: true, team: true },
        });
    }

    async findByClientId(clientId: string): Promise<NullableType<App>> {
        return this.appsRepository.findOne({
            where: { clientId },
            relations: { framework: true },
        });
    }

    async createApp(createAppDto: CreateAppDto): Promise<App> {
        const DEFAULT_TARGET_RESPONSE_TIME_MS = 500;
        const slug = createSlug(createAppDto.name);

        const existingApp = await this.appsRepository.findOne({
            where: { slug, team: { id: createAppDto.teamId } },
        });
        if (existingApp) {
            throw new ConflictException('App already exists in this team');
        }

        return this.saveApp(
            this.appsRepository.create({
                name: createAppDto.name,
                slug,
                clientId: randomUUID(),
                targetResponseTimeMs:
                    createAppDto.targetResponseTimeMs ??
                    DEFAULT_TARGET_RESPONSE_TIME_MS,
                framework: { id: createAppDto.frameworkId },
                team: { id: createAppDto.teamId },
            }),
        );
    }

    async updateApp(id: string, updateAppDto: UpdateAppDto): Promise<App> {
        const app = await this.findById(id);
        if (!app) throw new NotFoundException('App not found');

        if (updateAppDto.name) {
            const newSlug = createSlug(updateAppDto.name);
            if (newSlug !== app.slug) {
                const existingApp = await this.appsRepository.findOne({
                    where: { slug: newSlug, team: { id: app.team.id } },
                });
                if (existingApp && existingApp.id !== id) {
                    throw new ConflictException(
                        'App already exists in this team',
                    );
                }

                app.slug = newSlug;
            }
            app.name = updateAppDto.name;
        }
        if (updateAppDto.targetResponseTimeMs !== undefined) {
            app.targetResponseTimeMs = updateAppDto.targetResponseTimeMs;
        }
        if (updateAppDto.frameworkId !== undefined) {
            app.framework = {
                id: updateAppDto.frameworkId,
            } as App['framework'];
        }

        return this.saveApp(app);
    }

    async deleteApp(id: string): Promise<void> {
        await this.appsRepository.delete(id);
    }

    async getAppMetrics(
        appId: string,
        period: Period,
    ): Promise<AppMetricsResponseDto> {
        const app = await this.findById(appId);
        if (!app) throw new NotFoundException('App not found');

        const raw = await this.requestLogsRepository.getAppMetrics(
            appId,
            period,
            app.targetResponseTimeMs,
        );

        const requestCount = stringToInt(raw.requestCount);
        const errorCount = stringToInt(raw.errorCount);
        const satisfiedCount = stringToInt(raw.satisfiedCount);
        const toleratingCount = stringToInt(raw.toleratingCount);
        const consumerCount = stringToInt(raw.consumerCount);

        const errorRate = calculateRate(errorCount, requestCount, 2);
        const apdexScore =
            requestCount > 0
                ? Math.round(
                      ((satisfiedCount + toleratingCount / 2) / requestCount) *
                          100,
                  ) / 100
                : 1;

        return {
            requestCount,
            errorRate,
            apdexScore,
            consumerCount,
        };
    }
}
