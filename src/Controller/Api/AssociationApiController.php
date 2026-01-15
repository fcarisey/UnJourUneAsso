<?php

namespace App\Controller\Api;

use App\Entity\Association;
use App\Repository\AssociationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\Pagination\Paginator;
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

    #[Route('/associations/paginate/{page}/{limit}', name: 'association_list_paginated', methods: ['GET'])]
    public function getPaginatedAssociations(string $page, string $limit, AssociationRepository $associationRepository): Response{

        try{
            $page = (int) $page;
            $limit = (int) $limit;

            $qb = $associationRepository->createQueryBuilder('a');

            $qb->setFirstResult(($page - 1) * $limit)
                ->setMaxResults($limit);

            $paginator = new Paginator($qb, false);

            $count = $paginator->count();
            $max_pages = ceil($count / $limit);

            return $this->jsonResponse([
                'success' => true,
                'message' => 'Liste des associations disponibles.',
                'data' => [
                    'associations' => (array) $paginator->getIterator(),
                    'pagination' => [
                        'max_pages' => $max_pages,
                    ]
                ]
            ]);
        } catch (\Exception) {
            return $this->jsonResponse([
                'success' => false,
                'message' => "Une erreur est survenue lors de la pagination des associations.",
            ]);
        }
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

    #[Route('/associations/search/{search}/{page}/{limit}', name: 'association_search', methods: ['GET'])]
    public function search(string $search, string $page, string $limit, AssociationRepository $associationRepository): Response{
        if (empty($search)) {
            return $this->jsonResponse([
                'success' => false,
                'message' => "La valeur de recherche ne peut pas être vide !"
            ]);
        }

        try {

            $page = (int) $page;
            $limit = (int) $limit;

            $search = explode(" ", $search);

            $qb = $associationRepository->createQueryBuilder('a');

            $qb->setFirstResult(($page - 1) * $limit)
                ->setMaxResults($limit);

            $orX = $qb->expr()->orX();

            foreach ($search as $i => $searchItem) {
                $orX->add(
                    $qb->expr()->like('LOWER(a.name)', ":searchItem$i")
                );

                $qb->setParameter("searchItem$i", '%'.mb_strtolower($searchItem).'%');
            }

            $qb->andWhere($orX);

            $paginator = new Paginator($qb, false);

            $count = $paginator->count();
            $max_pages = ceil($count / $limit);

            return $this->jsonResponse([
                'success' => true,
                'message' => 'Liste des associations disponibles.',
                'data' => [
                    'associations' => (array) $paginator->getIterator(),
                    'pagination' => [
                        'max_pages' => $max_pages,
                    ],
                    'searched' => $search
                ]
            ]);
        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'message' => "Une erreur est survenue lors de la pagination des associations.",
            ]);
        }
    }
}
