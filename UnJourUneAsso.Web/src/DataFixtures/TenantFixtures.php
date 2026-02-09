<?php

namespace App\DataFixtures;

use App\Entity\Tenants;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class TenantFixtures extends Fixture
{

    /**
     * @inheritDoc
     */
    public function load(ObjectManager $manager): void
    {
        $tenant = new Tenants();
        $tenant->setName('DEV');
        $tenant->setStatus(true);
        $tenant->setCreatedAt(new \DateTimeImmutable());
        $tenant->setSubdomain('dev');

        $manager->persist($tenant);

        $tenant = new Tenants();
        $tenant->setName('CL1');
        $tenant->setStatus(true);
        $tenant->setCreatedAt(new \DateTimeImmutable());
        $tenant->setSubdomain('cl1');

        $manager->persist($tenant);
        $manager->flush();
    }
}
