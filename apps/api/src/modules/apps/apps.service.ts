import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import type { IAppsService } from './interfaces/apps-service.interface.js';
import { App } from './entities/app.entity.js';
import { CreateAppDto } from './dto/create-app.dto.js';
import { UpdateAppDto } from './dto/update-app.dto.js';
import type { NullableType } from '../../common/types/nullable.type.js';
import { createSlug } from '../../common/utils/slug.util.js';

@Injectable()
export class AppsService implements IAppsService {
    constructor(
        @InjectRepository(App) private readonly appsRepository: Repository<App>,
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
            relations: { framework: true },
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

        const existingApp = await this.appsRepository.findOneBy({ slug });
        if (existingApp) throw new ConflictException('App already exists');

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

        const updated = this.appsRepository.merge(app, {
            ...updateAppDto,
            ...(updateAppDto.name && { slug: createSlug(updateAppDto.name) }),
            ...(updateAppDto.frameworkId && {
                framework: { id: updateAppDto.frameworkId },
            }),
        });

        return this.saveApp(updated);
    }

    async deleteApp(id: string): Promise<void> {
        await this.appsRepository.delete(id);
    }
}
