<?php

namespace App\DataFixtures;

use App\Entity\Tenants;
use App\Entity\User;
use App\Repository\TenantsRepository;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\PasswordHasher\PasswordHasherInterface;

class UserFixtures extends Fixture implements DependentFixtureInterface
{
    private TenantsRepository $tenantsRepository;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(TenantsRepository $tenantsRepository, UserPasswordHasherInterface $passwordHasher){
        $this->tenantsRepository = $tenantsRepository;
        $this->passwordHasher = $passwordHasher;
    }

    /**
     * @inheritDoc
     */
    public function load(ObjectManager $manager): void
    {
        // TODO: Implement load() method.
        $user = new User();
        $user->setUsername('admin-dev');
        $user->setEmail('admin@dev.fr');
        $user->setPassword($this->passwordHasher->hashPassword($user, 'admin'));
        $user->setRoles(['ROLE_ADMIN', 'ROLE_USER']);
        $tenant = $this->tenantsRepository->findOneBy(['name' => 'DEV']);
        $user->setTenant($tenant);
        $manager->persist($user);


        $user = new User();
        $user->setUsername('admin-cl1');
        $user->setEmail('admin@cl1.fr');
        $user->setPassword($this->passwordHasher->hashPassword($user, 'admin'));
        $user->setRoles(['ROLE_ADMIN', 'ROLE_USER']);
        $tenant = $this->tenantsRepository->findOneBy(['name' => 'CL1']);
        $user->setTenant($tenant);
        $manager->persist($user);

        $manager->flush();
    }

    public function getDependencies(): array{
        return [
            TenantFixtures::class,
            AddressFixtures::class
        ];
    }
}
