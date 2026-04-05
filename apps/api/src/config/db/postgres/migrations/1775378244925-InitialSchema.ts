import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1775378244925 implements MigrationInterface {
    name = 'InitialSchema1775378244925';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."social_account_provider_enum" AS ENUM('Email', 'Google')`,
        );
        await queryRunner.query(
            `CREATE TABLE "social_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider" "public"."social_account_provider_enum" NOT NULL, "socialId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "SocialAccountProviderSocialId" UNIQUE ("provider", "socialId"), CONSTRAINT "PK_a69e41dd6fa725d17b040eda5e6" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."team_invite_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'revoked')`,
        );
        await queryRunner.query(
            `CREATE TABLE "team_invite" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenHash" character varying NOT NULL, "email" character varying NOT NULL, "status" "public"."team_invite_status_enum" NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "teamId" uuid NOT NULL, "inviterId" uuid NOT NULL, CONSTRAINT "TeamInviteEmail" UNIQUE ("teamId", "email"), CONSTRAINT "PK_deb3080b1edfad7d043d6db876e" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "framework" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_413064c9a2fb226f0d933712883" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "consumer_group" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "appId" uuid NOT NULL, CONSTRAINT "AppConsumerGroupName" UNIQUE ("appId", "name"), CONSTRAINT "PK_c2b2959be8d0210f3b38a4a86e0" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "consumers" ("id" SERIAL NOT NULL, "identifier" character varying NOT NULL, "name" character varying(255), "hidden" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "appId" uuid NOT NULL, "groupId" integer, CONSTRAINT "AppConsumerIdentifier" UNIQUE ("appId", "identifier"), CONSTRAINT "PK_9355367764efa60a8c2c27856d0" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "validation_error" ("id" BIGSERIAL NOT NULL, "msg" text NOT NULL, "type" character varying(255) NOT NULL, "loc" jsonb NOT NULL, "errorCount" integer NOT NULL DEFAULT '1', "endpointId" uuid NOT NULL, "consumerId" integer, CONSTRAINT "PK_de7ec9c2fb405b34eda316222d0" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_15617af75894152a0d8fa10ad5" ON "validation_error" ("endpointId", "type", "msg") `,
        );
        await queryRunner.query(
            `CREATE TABLE "server_error" ("id" BIGSERIAL NOT NULL, "msg" text NOT NULL, "type" character varying(255) NOT NULL, "traceback" text NOT NULL, "errorCount" integer NOT NULL DEFAULT '1', "endpointId" uuid NOT NULL, "consumerId" integer, CONSTRAINT "PK_c45e58b4454b8f0d63cb1a615fb" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_f2aca705d61e827181488fb22c" ON "server_error" ("endpointId", "type", "msg") `,
        );
        await queryRunner.query(
            `CREATE TABLE "endpoint" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "method" character varying NOT NULL, "path" character varying NOT NULL, "summary" character varying, "description" text, "targetResponseTimeMs" integer, "excluded" boolean NOT NULL DEFAULT false, "expectedStatusCodes" integer array NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "appId" uuid NOT NULL, CONSTRAINT "AppEndpointMethodPath" UNIQUE ("appId", "method", "path"), CONSTRAINT "PK_7785c5c2cf24e6ab3abb7a2e89f" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "app" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "clientId" character varying NOT NULL, "targetResponseTimeMs" integer NOT NULL DEFAULT '500', "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "frameworkId" integer NOT NULL, "teamId" uuid NOT NULL, CONSTRAINT "UQ_8993112cd607f65268a4f57da39" UNIQUE ("slug"), CONSTRAINT "UQ_94a75a2b2426d5d3b92c70cbdc5" UNIQUE ("clientId"), CONSTRAINT "PK_9478629fc093d229df09e560aea" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "team" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "demo" boolean NOT NULL DEFAULT false, "stealth" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_e459cfa57273996b76d24a0fa68" UNIQUE ("slug"), CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."team_member_role_enum" AS ENUM('owner', 'admin', 'member')`,
        );
        await queryRunner.query(
            `CREATE TABLE "team_member" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."team_member_role_enum" NOT NULL DEFAULT 'member', "joinedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "teamId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "TeamMember" UNIQUE ("teamId", "userId"), CONSTRAINT "PK_649680684d72a20d279641469c5" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "displayName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, "verified" boolean NOT NULL DEFAULT false, "admin" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "traffic_metric" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requestCount" integer NOT NULL, "requestSizeSum" bigint NOT NULL, "responseSizeSum" bigint NOT NULL, "responseTimeP50" integer NOT NULL, "responseTimeP75" integer NOT NULL, "responseTimeP95" integer NOT NULL, "timeWindow" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "endpointId" uuid NOT NULL, "consumerId" integer, CONSTRAINT "TrafficMetricEndpointConsumerTimeWindow" UNIQUE ("endpointId", "consumerId", "timeWindow"), CONSTRAINT "PK_fb29a9a150e2e18d02aeef823ec" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "resource" ("id" BIGSERIAL NOT NULL, "cpuPercent" numeric(5,2), "memoryRss" integer NOT NULL, "timeWindow" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "appId" uuid NOT NULL, CONSTRAINT "AppResourceTimeWindow" UNIQUE ("timeWindow", "appId"), CONSTRAINT "PK_e2894a5867e06ae2e8889f1173f" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "request_log" ("id" BIGSERIAL NOT NULL, "requestUuid" uuid NOT NULL, "method" character varying NOT NULL, "path" text NOT NULL, "url" text NOT NULL, "statusCode" integer NOT NULL, "statusText" character varying(50) NOT NULL, "responseTime" double precision NOT NULL, "requestSize" integer, "requestHeaders" jsonb NOT NULL DEFAULT '[]', "requestBody" bytea, "responseSize" integer, "responseHeaders" jsonb NOT NULL DEFAULT '[]', "responseBody" bytea, "clientIp" inet, "clientCountryCode" character varying(2), "exceptionType" character varying(255), "exceptionMessage" text, "traceId" character varying(255), "exceptionStacktrace" text, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "consumerId" integer, "appId" uuid NOT NULL, CONSTRAINT "UQ_c7e9a92edbe165f145a09341c8e" UNIQUE ("requestUuid"), CONSTRAINT "PK_ae393b42f50b0399df4c90160d6" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_3528e4b6aa4c1a66e86bb5bc5b" ON "request_log" ("appId", "timestamp") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_05d8c456261bbe60c12b542546" ON "request_log" ("consumerId") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_429eb8b02783e1366daf5053db" ON "request_log" ("method", "statusCode") `,
        );
        await queryRunner.query(
            `CREATE TABLE "application_log" ("id" BIGSERIAL NOT NULL, "message" text NOT NULL, "level" character varying(20) NOT NULL, "logger" character varying(255), "file" character varying(500), "line" integer, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "requestUuid" uuid NOT NULL, CONSTRAINT "PK_15822e1956d5b5278bb4e2ee4ea" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_0931caaec76595e4030d432229" ON "application_log" ("requestUuid", "level") `,
        );
        await queryRunner.query(
            `CREATE TABLE "error_metric" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clientErrorCount" integer NOT NULL, "serverErrorCount" integer NOT NULL, "timeWindow" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "appId" uuid NOT NULL, CONSTRAINT "PK_52757020ab6891cf95b7fead407" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenHash" character varying NOT NULL, "deviceInfo" character varying, "ipAddress" inet, "lastUsedAt" TIMESTAMP, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "social_account" ADD CONSTRAINT "FK_e8b7694e86fe9534778832f90c0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_invite" ADD CONSTRAINT "FK_dec64033827ee287d0863a1b180" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_invite" ADD CONSTRAINT "FK_312e8f5221992955c611192ff09" FOREIGN KEY ("inviterId") REFERENCES "team_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "consumer_group" ADD CONSTRAINT "FK_77953fa02a8b6b5e8f36b207133" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "consumers" ADD CONSTRAINT "FK_4c66b07b3981e8cbfabcaa2a18e" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "consumers" ADD CONSTRAINT "FK_40296f92e6e2197beb1719db8d9" FOREIGN KEY ("groupId") REFERENCES "consumer_group"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "validation_error" ADD CONSTRAINT "FK_c619b5aaa75c3352cc2fbe71aca" FOREIGN KEY ("endpointId") REFERENCES "endpoint"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "validation_error" ADD CONSTRAINT "FK_f55aa3efdc98e69bde48bcd358f" FOREIGN KEY ("consumerId") REFERENCES "consumers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "server_error" ADD CONSTRAINT "FK_2130e1aa237f0bde2262e42cc8b" FOREIGN KEY ("endpointId") REFERENCES "endpoint"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "server_error" ADD CONSTRAINT "FK_7e65ca736fd54041fa7bfabb195" FOREIGN KEY ("consumerId") REFERENCES "consumers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "endpoint" ADD CONSTRAINT "FK_63fc3dba613675e27028b634675" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "app" ADD CONSTRAINT "FK_afbf8ca702ff711527afdac0f7c" FOREIGN KEY ("frameworkId") REFERENCES "framework"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "app" ADD CONSTRAINT "FK_72ce3a88ec03cf06b181eaf77eb" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_member" ADD CONSTRAINT "FK_74da8f612921485e1005dc8e225" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_member" ADD CONSTRAINT "FK_d2be3e8fc9ab0f69673721c7fc3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "traffic_metric" ADD CONSTRAINT "FK_a80cf411161951cfdef9df947c5" FOREIGN KEY ("endpointId") REFERENCES "endpoint"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "traffic_metric" ADD CONSTRAINT "FK_88edf4d5a56fbd65ede995bcfed" FOREIGN KEY ("consumerId") REFERENCES "consumers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "resource" ADD CONSTRAINT "FK_e38722d488725850414cf7093ba" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "request_log" ADD CONSTRAINT "FK_05d8c456261bbe60c12b5425463" FOREIGN KEY ("consumerId") REFERENCES "consumers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "request_log" ADD CONSTRAINT "FK_042307e4f4dc4e6b62f1af07f94" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "application_log" ADD CONSTRAINT "FK_788c390a61d06165895394f6eac" FOREIGN KEY ("requestUuid") REFERENCES "request_log"("requestUuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "error_metric" ADD CONSTRAINT "FK_d748bc1b98383b2e9f4477d951e" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
        );
        await queryRunner.query(
            `ALTER TABLE "error_metric" DROP CONSTRAINT "FK_d748bc1b98383b2e9f4477d951e"`,
        );
        await queryRunner.query(
            `ALTER TABLE "application_log" DROP CONSTRAINT "FK_788c390a61d06165895394f6eac"`,
        );
        await queryRunner.query(
            `ALTER TABLE "request_log" DROP CONSTRAINT "FK_042307e4f4dc4e6b62f1af07f94"`,
        );
        await queryRunner.query(
            `ALTER TABLE "request_log" DROP CONSTRAINT "FK_05d8c456261bbe60c12b5425463"`,
        );
        await queryRunner.query(
            `ALTER TABLE "resource" DROP CONSTRAINT "FK_e38722d488725850414cf7093ba"`,
        );
        await queryRunner.query(
            `ALTER TABLE "traffic_metric" DROP CONSTRAINT "FK_88edf4d5a56fbd65ede995bcfed"`,
        );
        await queryRunner.query(
            `ALTER TABLE "traffic_metric" DROP CONSTRAINT "FK_a80cf411161951cfdef9df947c5"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_member" DROP CONSTRAINT "FK_d2be3e8fc9ab0f69673721c7fc3"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_member" DROP CONSTRAINT "FK_74da8f612921485e1005dc8e225"`,
        );
        await queryRunner.query(
            `ALTER TABLE "app" DROP CONSTRAINT "FK_72ce3a88ec03cf06b181eaf77eb"`,
        );
        await queryRunner.query(
            `ALTER TABLE "app" DROP CONSTRAINT "FK_afbf8ca702ff711527afdac0f7c"`,
        );
        await queryRunner.query(
            `ALTER TABLE "endpoint" DROP CONSTRAINT "FK_63fc3dba613675e27028b634675"`,
        );
        await queryRunner.query(
            `ALTER TABLE "server_error" DROP CONSTRAINT "FK_7e65ca736fd54041fa7bfabb195"`,
        );
        await queryRunner.query(
            `ALTER TABLE "server_error" DROP CONSTRAINT "FK_2130e1aa237f0bde2262e42cc8b"`,
        );
        await queryRunner.query(
            `ALTER TABLE "validation_error" DROP CONSTRAINT "FK_f55aa3efdc98e69bde48bcd358f"`,
        );
        await queryRunner.query(
            `ALTER TABLE "validation_error" DROP CONSTRAINT "FK_c619b5aaa75c3352cc2fbe71aca"`,
        );
        await queryRunner.query(
            `ALTER TABLE "consumers" DROP CONSTRAINT "FK_40296f92e6e2197beb1719db8d9"`,
        );
        await queryRunner.query(
            `ALTER TABLE "consumers" DROP CONSTRAINT "FK_4c66b07b3981e8cbfabcaa2a18e"`,
        );
        await queryRunner.query(
            `ALTER TABLE "consumer_group" DROP CONSTRAINT "FK_77953fa02a8b6b5e8f36b207133"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_invite" DROP CONSTRAINT "FK_312e8f5221992955c611192ff09"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_invite" DROP CONSTRAINT "FK_dec64033827ee287d0863a1b180"`,
        );
        await queryRunner.query(
            `ALTER TABLE "social_account" DROP CONSTRAINT "FK_e8b7694e86fe9534778832f90c0"`,
        );
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "error_metric"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_0931caaec76595e4030d432229"`,
        );
        await queryRunner.query(`DROP TABLE "application_log"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_429eb8b02783e1366daf5053db"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_05d8c456261bbe60c12b542546"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_3528e4b6aa4c1a66e86bb5bc5b"`,
        );
        await queryRunner.query(`DROP TABLE "request_log"`);
        await queryRunner.query(`DROP TABLE "resource"`);
        await queryRunner.query(`DROP TABLE "traffic_metric"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "team_member"`);
        await queryRunner.query(`DROP TYPE "public"."team_member_role_enum"`);
        await queryRunner.query(`DROP TABLE "team"`);
        await queryRunner.query(`DROP TABLE "app"`);
        await queryRunner.query(`DROP TABLE "endpoint"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_f2aca705d61e827181488fb22c"`,
        );
        await queryRunner.query(`DROP TABLE "server_error"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_15617af75894152a0d8fa10ad5"`,
        );
        await queryRunner.query(`DROP TABLE "validation_error"`);
        await queryRunner.query(`DROP TABLE "consumers"`);
        await queryRunner.query(`DROP TABLE "consumer_group"`);
        await queryRunner.query(`DROP TABLE "framework"`);
        await queryRunner.query(`DROP TABLE "team_invite"`);
        await queryRunner.query(`DROP TYPE "public"."team_invite_status_enum"`);
        await queryRunner.query(`DROP TABLE "social_account"`);
        await queryRunner.query(
            `DROP TYPE "public"."social_account_provider_enum"`,
        );
    }
}
