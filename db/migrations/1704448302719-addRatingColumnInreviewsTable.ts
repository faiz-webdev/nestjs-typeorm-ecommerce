import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRatingColumnInreviewsTable1704448302719 implements MigrationInterface {
    name = 'AddRatingColumnInreviewsTable1704448302719'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD \`ratings\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP COLUMN \`ratings\``);
    }

}
