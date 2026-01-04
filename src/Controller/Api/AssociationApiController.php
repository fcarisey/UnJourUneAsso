<?php

namespace App\Controller\Api;

use App\Entity\Association;
use App\Repository\AssociationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
final class AssociationApiController extends BaseApiController
{
    #[Route('/associations', name: 'association_list', methods: ['GET'])]
    public function getAvailableAssociations(AssociationRepository $associationRepository): Response{
        $associations = $associationRepository->findAll();

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Liste des associations disponibles.',
            'associations' => $associations
        ]);
    }

    #[Route('/association', name: 'association_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): Response{
        $data = $request->getContent();
        $data = json_decode($data, JSON_OBJECT_AS_ARRAY);

        $association = new Association();

        $association->setName($data['name']);
        $association->setEmail($data['email']);
        $association->setDescription($data['description']);

        $em->persist($association);
        $em->flush();

        return $this->jsonResponse([
            'success' => true,
            'message' => "Association {$association->getName()} créée.",
            'association_id' => $association->getId()
        ]);
    }

    #[Route('/association/{id}', name: 'association_show', methods: ['GET'])]
    public function show(Association $association): Response{
        return $this->jsonResponse([
            'success' => true,
            'message' => "Association {$association->getName()}",
            'association' => $association
        ]);
    }

    #[Route('/association/{id}', name: 'association_edit', methods: ['PATCH'])]
    public function edit(Request $request, Association $association, EntityManagerInterface $em): Response{
        $data = $request->getContent();
        $data = json_decode($data, JSON_OBJECT_AS_ARRAY);

        $association->setName($data['name']);
        $association->setEmail($data['email']);
        $association->setDescription($data['description']);

        $em->persist($association);
        $em->flush();

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Association éditée avec success.',
        ]);
    }

    #[Route('/association/{id}', name: 'association_delete', methods: ['DELETE'])]
    public function delete(Association $association, EntityManagerInterface $em): Response{
        $em->remove($association);
        $em->flush();

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Association deleted'
        ]);
    }
}
