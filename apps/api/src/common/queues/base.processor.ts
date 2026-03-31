import { hrtime } from 'node:process';
import { WorkerHost } from '@nestjs/bullmq';
import type { Job, MinimalJob } from 'bullmq';
import { ClsService } from 'nestjs-cls';
import { AppLoggerService } from '../../modules/logger/logger.service.js';
import type { BaseJobData } from '../../modules/ingestion/types/job-data.type.js';

function startTimer(): () => number {
    const start = hrtime.bigint();
    return () => Number((hrtime.bigint() - start) / 1_000_000n);
}

export abstract class BaseProcessor<
    T extends BaseJobData = BaseJobData,
    R = unknown,
    N extends string = string,
> extends WorkerHost {
    protected abstract readonly logger: AppLoggerService;
    protected abstract readonly cls: ClsService;

    async process(job: Job<T, R, N>): Promise<R> {
        const timer = startTimer();

        return this.cls.runWith(this.cls.get(), async () => {
            this.seedClsStore(job);

            const meta = this.jobMeta(job);
            this.logger.info('Job started', meta);

            try {
                const result = (await this.processJob(job)) as R;

                this.logger.info('Job completed', {
                    ...meta,
                    duration: timer(),
                });

                return result;
            } catch (error) {
                const attempt = job.attemptsMade + 1;
                const maxAttempts = job.opts.attempts ?? 1;

                this.logger.error('Job failed', {
                    ...meta,
                    error:
                        error instanceof Error
                            ? error.stack
                            : JSON.stringify(error),
                    attempt,
                    maxAttempts,
                    willRetry: attempt < maxAttempts,
                    duration: timer(),
                });

                throw error;
            }
        });
    }

    protected abstract processJob(job: Job<T, R, N>): Promise<R>;

    protected startTimer(): () => number {
        return startTimer();
    }

    protected jobMeta(
        job: MinimalJob,
    ): Record<string, string | number | undefined> {
        return {
            jobId: job.id,
            jobName: job.name,
            queue: job.queueName,
            attempt: job.attemptsMade + 1,
        };
    }

    private seedClsStore(job: MinimalJob<BaseJobData>): void {
        const traceId = job.data?.traceId ?? `job-${job.queueName}-${job.id}`;

        this.cls.set('traceId', traceId);
        this.cls.set('jobId', job.id);
        this.cls.set('jobName', job.name);
        this.cls.set('queue', job.queueName);

        if (job.data?.appId) this.cls.set('appId', job.data.appId);
    }
}
