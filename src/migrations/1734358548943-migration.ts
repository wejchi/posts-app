import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1734358548943 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE OR REPLACE FUNCTION notify_outbox()
                            RETURNS TRIGGER AS $$
                            BEGIN
                                PERFORM pg_notify('outbox_channel', NEW.id::TEXT);
                                RETURN NEW;
                            END;
                            $$ LANGUAGE plpgsql;

                            CREATE TRIGGER trigger_outbox_notify
                            AFTER INSERT ON post_event
                            FOR EACH ROW
                            EXECUTE FUNCTION notify_outbox();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
