<?php

namespace App\DataFixtures;

use App\Entity\Association;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AssociationFixture extends Fixture
{

    /**
     * @inheritDoc
     */
    public function load(ObjectManager $manager): void
    {
        // TODO: Implement load() method.
        $association = new Association();
        $association->setName('Association 1');
        $association->setDescription('Association 1 description');
        $association->setEmail("fcarisey6@gmail.com");

        $manager->persist($association);
        $manager->flush();
    }
}
