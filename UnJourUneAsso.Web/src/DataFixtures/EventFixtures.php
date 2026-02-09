<?php

namespace App\DataFixtures;

use App\Entity\Event;
use App\Repository\TenantsRepository;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class EventFixtures extends Fixture implements DependentFixtureInterface
{
    private TenantsRepository $tenantsRepository;

    public function __construct(TenantsRepository $tenantsRepository){
        $this->tenantsRepository = $tenantsRepository;
    }

    /**
     * @inheritDoc
     */
    public function load(ObjectManager $manager): void
    {
        // TODO: Implement load() method.
        $event = new Event();

        $event->setName("Association 1");
        $event->setStartAt(new \DateTimeImmutable());
        $event->setEndAt(new \DateTimeImmutable());
        $event->setDescription("Association 1 description");

        $tenant = $this->tenantsRepository->findOneBy(["name" => "CL1"]);

        $event->setTenant($tenant);
        $event->setColor("FF0000");

        $address = $tenant->getAddresses()->first();

        $event->setAddress($address);

        $manager->persist($event);
        $manager->flush();
    }

    public function getDependencies(): array{
        return [
            TenantFixtures::class,
            AddressFixtures::class,
        ];
    }
}
