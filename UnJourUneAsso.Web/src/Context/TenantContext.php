<?php

namespace App\Context;

use App\Entity\Tenants;

class TenantContext
{
    private ?Tenants $tenants;

    public function __construct(?Tenants $tenants) {
        $this->tenants = $tenants;
    }

    public function getTenant(): Tenants {
        if ($this->tenants === null) {
            throw new \LogicException('Tenant context has not been set.');
        }

        return $this->tenants;
    }

    public function setTenant(Tenants $tenant): void{
        $this->tenants = $tenant;
    }

    public function hasTenant(): bool{
        return $this->tenants !== null;
    }
}
