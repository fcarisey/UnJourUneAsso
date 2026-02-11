<?php

namespace App\Controller\Api;

use App\Entity\Address;
use App\Entity\User;
use App\Repository\AddressRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
final class AddressApiController extends BaseApiController
{
    protected string $title = "Adresse";

    #[Route("/addresses", name: "address_list", methods: ['GET'])]
    public function list(AddressRepository $addressRepository): Response{
        return $this->jsonResponse([
            'success' => true,
            'message' => 'Liste des adresses.',
            'events' => $addressRepository->findAll(),
        ]);
    }

    #[Route("/address/default", name: "address_default", methods: ['GET'])]
    public function default(Security $security): Response{
        $user = $security->getUser();
        if (!$user instanceof User) {
            return $this->jsonResponse([
                'success' => false,
                'message' => "Une erreur est survenue lors de la récupèration des adresses.",
            ]);
        }

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Adresse par défaut.',
            'data' => $user->getDefaultAddress(),
        ]);
    }

    #[Route("/address", name: "address_create", methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): Response{
        $data = json_decode($request->getContent(), true);

        $address = new Address();
        $address->setDesignation($data['designation'] ?? '');
        $address->setAddress($data['address'] ?? '');
        $address->setCity($data['city'] ?? '');
        $address->setZip($data['zip'] ?? '');
        $address->setCountry($data['country'] ?? '');

        $em->persist($address);
        $em->flush();

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Adresse créée.',
            'address' => $address,
        ]);
    }

    #[Route("/address/{id}", name: "address_show", methods: ['GET'])]
    public function show(Address $address): Response{
        return $this->jsonResponse([
            'success' => true,
            'message' => 'Adresse récupérée.',
            'address' => $address,
        ]);
    }

    #[Route("/address/{id}", name: "address_update", methods: ['PUT'])]
    public function update(Request $request, EntityManagerInterface $em, Address $address): Response{
        $data = json_decode($request->getContent(), true);

        if (isset($data['designation'])) {
            $address->setDesignation($data['designation']);
        }
        if (isset($data['address'])) {
            $address->setAddress($data['address']);
        }
        if (isset($data['city'])) {
            $address->setCity($data['city']);
        }
        if (isset($data['zip'])) {
            $address->setZip($data['zip']);
        }
        if (isset($data['country'])) {
            $address->setCountry($data['country']);
        }

        $em->flush();

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Adresse mise à jour.',
            'address' => $address,
        ]);
    }

    #[Route("/address/{id}", name: "address_delete", methods: ['DELETE'])]
    public function delete(EntityManagerInterface $em, Address $address): Response{
        // Vérifier si l'adresse est utilisée par des événements
        if ($address->getEvents()->count() > 0) {
            return $this->jsonResponse([
                'success' => false,
                'message' => "Cette adresse est utilisée par des événements et ne peut pas être supprimée.",
            ], Response::HTTP_BAD_REQUEST);
        }

        $em->remove($address);
        $em->flush();

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Adresse supprimée.',
        ]);
    }
}
