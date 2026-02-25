import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { QueryRunner } from 'typeorm';
import type { IRequestLogsService } from './interfaces/request-logs-service.interface.js';
import { Repositories } from '../../common/constants/repositories.constant.js';
import type {
    IRequestLogsRepository,
    PartialRequestLog,
} from './interfaces/request-logs-repository.interface.js';
import type { IApplicationLogsRepository } from './interfaces/application-logs-repository.interface.js';
import type { CreateRequestLogDto } from './dto/create-request-log.dto.js';
import type { GetRequestLogsOptionsDto } from './dto/get-request-logs-options.dto.js';
import type { RequestLogResponsePaginatedDto } from './dto/request-log-response.dto.js';
import type { GetRequestLogTimelineOptionsDto } from './dto/get-request-log-timeline-options.dto.js';
import type { RequestLogTimelineResponseDto } from './dto/request-log-timeline-response.dto.js';
import type { RequestLogDetailsResponseDto } from './dto/request-log-details-response.dto.js';
import { RequestLogMapper } from './mappers/request-log.mapper.js';
import { createCSV } from '../../common/utils/csv.util.js';
import { buildMetadata } from '../../common/helpers/metadata.helper.js';

@Injectable()
export class RequestLogsService implements IRequestLogsService {
    constructor(
        @Inject(Repositories.REQUEST_LOGS)
        private readonly requestLogsRepository: IRequestLogsRepository,
        @Inject(Repositories.APPLICATION_LOGS)
        private readonly applicationLogsRepository: IApplicationLogsRepository,
    ) {}

    private async fetchApplicationLogCounts(
        items: PartialRequestLog[],
    ): Promise<Map<string, Record<string, number>>> {
        const requestUuids = items.map((item) => item.requestUuid);
        const logCounts =
            await this.applicationLogsRepository.findLogCountsByRequestUuids(
                requestUuids,
            );

        return RequestLogMapper.buildLogCountMap(logCounts);
    }

    async createRequestLogs(
        requestLogsDto: CreateRequestLogDto[],
        queryRunner?: QueryRunner,
    ): Promise<void> {
        return this.requestLogsRepository.createRequestLogs(
            requestLogsDto,
            queryRunner,
        );
    }

    async getRequestLogs({
        order,
        offset,
        limit,
        ...filters
    }: GetRequestLogsOptionsDto): Promise<RequestLogResponsePaginatedDto> {
        const { items, totalItems } =
            await this.requestLogsRepository.findWithFilters(filters, {
                order,
                skip: (offset - 1) * limit,
                take: limit,
            });

        const logCountMap = await this.fetchApplicationLogCounts(items);

        return {
            data: RequestLogMapper.toRequestLogResponseDto(items, logCountMap),
            metadata: buildMetadata(offset, limit, totalItems),
        };
    }

    async getRequestLogsTimeline(
        getRequestLogTimelineOptionsDto: GetRequestLogTimelineOptionsDto,
    ): Promise<RequestLogTimelineResponseDto> {
        const items = await this.requestLogsRepository.findTimelineData(
            getRequestLogTimelineOptionsDto,
        );

        return {
            timeWindows: items.map((item) => item.timeWindow),
            itemCounts: items.map((item) => Number.parseInt(item.itemCount)),
        };
    }

    async exportRequestLogsCsv(
        getRequestLogsOptionsDto: GetRequestLogsOptionsDto,
    ): Promise<string> {
        const { data } = await this.getRequestLogs(getRequestLogsOptionsDto);

        const headers = [
            'requestUuid',
            'method',
            'path',
            'url',
            'statusCode',
            'statusText',
            'responseTime',
            'applicationLogsCountByLevel',
            'timestamp',
            'requestSize',
            'responseSize',
            'clientIp',
            'clientCountryCode',
            'clientCountryName',
            'consumerId',
            'consumerIdentifier',
            'consumerName',
        ];

        return createCSV(data, headers);
    }

    async getRequestLogDetails(
        requestUuid: string,
        appId: string,
        timestamp?: string,
    ): Promise<RequestLogDetailsResponseDto> {
        const log = await this.requestLogsRepository.findByRequestUuid(
            requestUuid,
            appId,
            timestamp,
        );

        if (!log) {
            throw new NotFoundException('Request log not found');
        }

        const logsCount =
            await this.applicationLogsRepository.countByRequestUuid(
                requestUuid,
            );

        const logsByLevel =
            await this.applicationLogsRepository.findLogCountsByLevel(
                requestUuid,
            );

        const logCountByLevel =
            RequestLogMapper.buildLogCountByLevel(logsByLevel);

        return RequestLogMapper.toRequestLogDetailsResponseDto(
            log,
            logsCount,
            logCountByLevel,
        );
    }
}
