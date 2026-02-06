<?php

namespace App\Controller\Web;

use App\Entity\Address;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class AddressController extends AbstractController
{
    #[Route('/web/address', name: 'app_web_address')]
    public function index(Request $request, EntityManagerInterface $entityManager): Response
    {
        $address = new Address()
            ->setAddress("245, Avenue du Maréchal Juin")
            ->setCity("Dole")
            ->setCountry("France")
            ->setZip("39100")
            ->setDesignation("Domicile");

        $entityManager->persist($address);
        $entityManager->flush();

        $route = $request->headers->get('referer', "/planning");
        return $this->redirect($route);
    }
}
