import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1734358538617 implements MigrationInterface {
  name = 'Migration1734358538617';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."post_state_enum" AS ENUM('DRAFT', 'PUBLISHED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "post" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "content" character varying NOT NULL, "state" "public"."post_state_enum" NOT NULL DEFAULT 'DRAFT', "hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UniquePostTitleConstraint" UNIQUE ("title"), CONSTRAINT "TitleLengthCheck" CHECK (LENGTH(title) BETWEEN 3 AND 100), CONSTRAINT "ContentLengthCheck" CHECK (LENGTH(content) >= 3), CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`,
    );
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
    await queryRunner.query(`DROP TABLE "post"`);
    await queryRunner.query(`DROP TYPE "public"."post_state_enum"`);
  }
}
