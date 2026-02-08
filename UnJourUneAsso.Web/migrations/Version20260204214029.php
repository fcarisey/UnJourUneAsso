<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260204214029 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE address (id UUID NOT NULL, tenant_id UUID NOT NULL, designation VARCHAR(255) NOT NULL, address VARCHAR(300) NOT NULL, city VARCHAR(255) NOT NULL, zip VARCHAR(10) NOT NULL, country VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_D4E6F819033212A ON address (tenant_id)');
        $this->addSql('COMMENT ON COLUMN address.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN address.tenant_id IS \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE address ADD CONSTRAINT FK_D4E6F819033212A FOREIGN KEY (tenant_id) REFERENCES tenants (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE "user" ADD default_address_id UUID DEFAULT NULL');
        $this->addSql('COMMENT ON COLUMN "user".default_address_id IS \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE "user" ADD CONSTRAINT FK_8D93D649BD94FB16 FOREIGN KEY (default_address_id) REFERENCES address (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_8D93D649BD94FB16 ON "user" (default_address_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE "user" DROP CONSTRAINT FK_8D93D649BD94FB16');
        $this->addSql('ALTER TABLE address DROP CONSTRAINT FK_D4E6F819033212A');
        $this->addSql('DROP TABLE address');
        $this->addSql('DROP INDEX IDX_8D93D649BD94FB16');
        $this->addSql('ALTER TABLE "user" DROP default_address_id');
    }
}
