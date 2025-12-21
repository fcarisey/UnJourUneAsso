<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251221125716 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE association (id UUID NOT NULL, name VARCHAR(300) NOT NULL, description TEXT DEFAULT NULL, email VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN association.id IS \'(DC2Type:uuid)\'');
        $this->addSql('CREATE TABLE event (id UUID NOT NULL, tenant_id UUID NOT NULL, name VARCHAR(300) NOT NULL, description TEXT DEFAULT NULL, start_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, end_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, color VARCHAR(6) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_3BAE0AA79033212A ON event (tenant_id)');
        $this->addSql('COMMENT ON COLUMN event.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN event.tenant_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN event.start_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN event.end_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE invitation (id UUID NOT NULL, association_id UUID NOT NULL, event_id UUID NOT NULL, tenant_id UUID NOT NULL, etat BOOLEAN DEFAULT NULL, link TEXT DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_F11D61A2EFB9C8A5 ON invitation (association_id)');
        $this->addSql('CREATE INDEX IDX_F11D61A271F7E88B ON invitation (event_id)');
        $this->addSql('CREATE INDEX IDX_F11D61A29033212A ON invitation (tenant_id)');
        $this->addSql('COMMENT ON COLUMN invitation.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN invitation.association_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN invitation.event_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN invitation.tenant_id IS \'(DC2Type:uuid)\'');
        $this->addSql('CREATE TABLE tenants (id UUID NOT NULL, name VARCHAR(255) NOT NULL, subdomain VARCHAR(255) NOT NULL, status BOOLEAN DEFAULT false NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN tenants.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN tenants.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE "user" (id UUID NOT NULL, tenant_id UUID NOT NULL, name VARCHAR(255) NOT NULL, email VARCHAR(300) NOT NULL, password VARCHAR(255) NOT NULL, salt VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_8D93D6499033212A ON "user" (tenant_id)');
        $this->addSql('COMMENT ON COLUMN "user".id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN "user".tenant_id IS \'(DC2Type:uuid)\'');
        $this->addSql('CREATE TABLE messenger_messages (id BIGSERIAL NOT NULL, body TEXT NOT NULL, headers TEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, available_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, delivered_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_75EA56E0FB7336F0 ON messenger_messages (queue_name)');
        $this->addSql('CREATE INDEX IDX_75EA56E0E3BD61CE ON messenger_messages (available_at)');
        $this->addSql('CREATE INDEX IDX_75EA56E016BA31DB ON messenger_messages (delivered_at)');
        $this->addSql('COMMENT ON COLUMN messenger_messages.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN messenger_messages.available_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN messenger_messages.delivered_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE OR REPLACE FUNCTION notify_messenger_messages() RETURNS TRIGGER AS $$
            BEGIN
                PERFORM pg_notify(\'messenger_messages\', NEW.queue_name::text);
                RETURN NEW;
            END;
        $$ LANGUAGE plpgsql;');
        $this->addSql('DROP TRIGGER IF EXISTS notify_trigger ON messenger_messages;');
        $this->addSql('CREATE TRIGGER notify_trigger AFTER INSERT OR UPDATE ON messenger_messages FOR EACH ROW EXECUTE PROCEDURE notify_messenger_messages();');
        $this->addSql('ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA79033212A FOREIGN KEY (tenant_id) REFERENCES tenants (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE invitation ADD CONSTRAINT FK_F11D61A2EFB9C8A5 FOREIGN KEY (association_id) REFERENCES association (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE invitation ADD CONSTRAINT FK_F11D61A271F7E88B FOREIGN KEY (event_id) REFERENCES event (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE invitation ADD CONSTRAINT FK_F11D61A29033212A FOREIGN KEY (tenant_id) REFERENCES tenants (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE "user" ADD CONSTRAINT FK_8D93D6499033212A FOREIGN KEY (tenant_id) REFERENCES tenants (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE event DROP CONSTRAINT FK_3BAE0AA79033212A');
        $this->addSql('ALTER TABLE invitation DROP CONSTRAINT FK_F11D61A2EFB9C8A5');
        $this->addSql('ALTER TABLE invitation DROP CONSTRAINT FK_F11D61A271F7E88B');
        $this->addSql('ALTER TABLE invitation DROP CONSTRAINT FK_F11D61A29033212A');
        $this->addSql('ALTER TABLE "user" DROP CONSTRAINT FK_8D93D6499033212A');
        $this->addSql('DROP TABLE association');
        $this->addSql('DROP TABLE event');
        $this->addSql('DROP TABLE invitation');
        $this->addSql('DROP TABLE tenants');
        $this->addSql('DROP TABLE "user"');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
