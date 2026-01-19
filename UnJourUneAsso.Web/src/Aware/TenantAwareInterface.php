<?php

namespace App\Aware;

use App\Entity\Tenants;

interface TenantAwareInterface
{
    public function getTenant(): ?Tenants;

    public function setTenant(Tenants $tenant): static;
}
