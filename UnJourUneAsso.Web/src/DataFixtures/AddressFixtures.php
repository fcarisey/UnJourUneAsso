<?php

namespace App\DataFixtures;

use App\Entity\Address;
use App\Repository\TenantsRepository;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class AddressFixtures extends Fixture implements DependentFixtureInterface
{
    private TenantsRepository $tenantRepository;

    public function __construct(TenantsRepository $tenantRepository){
        $this->tenantRepository = $tenantRepository;
    }

    /**
     * @inheritDoc
     */
    public function load(ObjectManager $manager): void
    {
        // TODO: Implement load() method.
        $tenant = $this->tenantRepository->findOneBy(['name' => 'DEV']);
        $address = new Address()
            ->setDesignation('Domicile')
            ->setZip('39100')
            ->setCity('Dole')
            ->setCountry('France')
            ->setAddress('245, Avenue du Maréchal Juin')
            ->setTenant($tenant);
        $manager->persist($address);

        $tenant = $this->tenantRepository->findOneBy(['name' => 'CL1']);
        $address = new Address()
            ->setDesignation('Domicile')
            ->setZip('39500')
            ->setCity('Tavaux')
            ->setCountry('France')
            ->setAddress('6, Avenue Victor Hugo')
            ->setTenant($tenant);
        $manager->persist($address);

        $manager->flush();
    }

    public function getDependencies() : array{
        return [
            TenantFixtures::class
        ];
    }
}
