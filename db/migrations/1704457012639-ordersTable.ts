import { MigrationInterface, QueryRunner } from "typeorm";

export class OrdersTable1704457012639 implements MigrationInterface {
    name = 'OrdersTable1704457012639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`shippings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`phone\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL DEFAULT '', \`address\` varchar(255) NOT NULL DEFAULT '', \`city\` varchar(255) NOT NULL DEFAULT '', \`postCode\` varchar(255) NOT NULL DEFAULT '', \`state\` varchar(255) NOT NULL DEFAULT '', \`country\` varchar(255) NOT NULL DEFAULT '', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`order\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`status\` enum ('processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'processing', \`shippedAt\` datetime NULL, \`deliveredAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedById\` int NULL, \`shippingAddressId\` int NULL, UNIQUE INDEX \`REL_cc4e4adab232e8c05026b2f345\` (\`shippingAddressId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders_products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`product_unit_price\` decimal(10,2) NOT NULL DEFAULT '0.00', \`product_quantity\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`orderId\` int NULL, \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP COLUMN \`ratings\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD \`ratings\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_1102b5a0c580f845993e2f766f6\` FOREIGN KEY (\`updatedById\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_cc4e4adab232e8c05026b2f345d\` FOREIGN KEY (\`shippingAddressId\`) REFERENCES \`shippings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders_products\` ADD CONSTRAINT \`FK_823bad3524a5d095453c43286bb\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders_products\` ADD CONSTRAINT \`FK_4eff63e89274f79195e25c5c115\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders_products\` DROP FOREIGN KEY \`FK_4eff63e89274f79195e25c5c115\``);
        await queryRunner.query(`ALTER TABLE \`orders_products\` DROP FOREIGN KEY \`FK_823bad3524a5d095453c43286bb\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_cc4e4adab232e8c05026b2f345d\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_1102b5a0c580f845993e2f766f6\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP COLUMN \`ratings\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD \`ratings\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`orders_products\``);
        await queryRunner.query(`DROP INDEX \`REL_cc4e4adab232e8c05026b2f345\` ON \`orders\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP TABLE \`shippings\``);
    }

}
