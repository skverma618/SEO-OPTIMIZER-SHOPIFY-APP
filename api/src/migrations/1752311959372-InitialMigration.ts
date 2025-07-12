import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1752311959372 implements MigrationInterface {
    name = 'InitialMigration1752311959372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shops" ("shopDomain" character varying NOT NULL, "accessToken" character varying NOT NULL, "scope" character varying NOT NULL, "email" character varying, "shopName" character varying, "planName" character varying, "isActive" boolean NOT NULL DEFAULT true, "installedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_95c0ebe39c90b4abae362113686" PRIMARY KEY ("shopDomain"))`);
        await queryRunner.query(`CREATE TABLE "scan_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "shopDomain" character varying NOT NULL, "scanResults" json NOT NULL, "totalProducts" integer NOT NULL, "productsWithIssues" integer NOT NULL, "scanType" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_47b822b75a58472954c502b33d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "scan_history" ADD CONSTRAINT "FK_a11adeef8a4bf45b886e653c386" FOREIGN KEY ("shopDomain") REFERENCES "shops"("shopDomain") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scan_history" DROP CONSTRAINT "FK_a11adeef8a4bf45b886e653c386"`);
        await queryRunner.query(`DROP TABLE "scan_history"`);
        await queryRunner.query(`DROP TABLE "shops"`);
    }

}
