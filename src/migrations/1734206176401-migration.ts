import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostEvent1734206176401 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."post_event_type_enum" AS ENUM('POST_CREATED', 'POST_UPDATED', 'POST_REMOVED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."post_event_type_enum" NOT NULL, "data" json NOT NULL, "timestamp" TIMESTAMP NOT NULL, "sent" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_035a1509baa4c2fb485bbe6bffa" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "post_event"`);
    await queryRunner.query(`DROP TYPE "public"."post_event_type_enum"`);
  }
}
