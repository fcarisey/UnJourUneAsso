<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260208125858 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE POLICY tenant_event_isolation ON event USING (tenant_id = current_setting(\'app.current_tenant\', true)::uuid)');
        $this->addSql('CREATE POLICY tenant_event_insert ON event FOR INSERT WITH CHECK (tenant_id = current_setting(\'app.current_tenant\', true)::uuid)');

        $this->addSql('CREATE POLICY tenant_invitation_isolation ON invitation USING (tenant_id = current_setting(\'app.current_tenant\', true)::uuid)');
        $this->addSql('CREATE POLICY tenant_invitation_insert ON invitation FOR INSERT WITH CHECK (tenant_id = current_setting(\'app.current_tenant\', true)::uuid)');

        $this->addSql('CREATE POLICY tenant_user_isolation ON "user" USING (tenant_id = current_setting(\'app.current_tenant\', true)::uuid)');

        $this->addSql('CREATE POLICY tenant_address_isolation ON address USING (tenant_id = current_setting(\'app.current_tenant\', true)::uuid)');
        $this->addSql('CREATE POLICY tenant_address_insert ON address FOR INSERT WITH CHECK (tenant_id = current_setting(\'app.current_tenant\', true)::uuid)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP POLICY tenant_event_isolation ON event');
        $this->addSql('DROP POLICY tenant_event_insert ON even');

        $this->addSql('DROP POLICY tenant_invitation_isolation ON invitation');
        $this->addSql('DROP POLICY tenant_invitation_insert ON invitation');

        $this->addSql('DROP POLICY tenant_user_isolation ON event');

        $this->addSql('DROP POLICY tenant_address_isolation ON address');
        $this->addSql('DROP POLICY tenant_address_insert ON address');
    }
}
