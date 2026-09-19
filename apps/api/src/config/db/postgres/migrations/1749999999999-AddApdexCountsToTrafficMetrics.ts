import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApdexCountsToTrafficMetrics1749999999999 implements MigrationInterface {
    name = 'AddApdexCountsToTrafficMetrics1749999999999';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "traffic_metric"
             ADD COLUMN "apdexSatisfiedCount"  integer NOT NULL DEFAULT 0,
             ADD COLUMN "apdexToleratedCount"  integer NOT NULL DEFAULT 0,
             ADD COLUMN "apdexFrustratedCount" integer NOT NULL DEFAULT 0`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "traffic_metric"
             DROP COLUMN "apdexSatisfiedCount",
             DROP COLUMN "apdexToleratedCount",
             DROP COLUMN "apdexFrustratedCount"`,
        );
    }
}
