import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostsTable1734186231934 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."post_state_enum" AS ENUM('DRAFT', 'PUBLISHED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "post" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "content" character varying NOT NULL, "state" "public"."post_state_enum" NOT NULL DEFAULT 'DRAFT', "hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UniquePostTitleConstraint" UNIQUE ("title"), CONSTRAINT "CHK_65cbbed975c879072e38985827" CHECK (LENGTH(title) BETWEEN 3 AND 100), CONSTRAINT "CHK_f2ffa14054dd0cbc523c9176f0" CHECK (LENGTH(title) >= 3), CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "post"`);
    await queryRunner.query(`DROP TYPE "public"."post_state_enum"`);
  }
}
