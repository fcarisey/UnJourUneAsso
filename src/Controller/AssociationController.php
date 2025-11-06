<?php

namespace App\Controller;

use App\Entity\Association;
use App\Repository\AssociationRepository;
use App\Repository\EventRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class AssociationController extends BaseController
{
    protected string $title = "Association";

    #[Route('/associations', name: 'app_associations')]
    public function index(AssociationRepository $associationRepository, EventRepository $eventRepository): Response
    {
        $associations = $associationRepository->findAll();
        $events = $eventRepository->findAll();

        return $this->render('association/index.html.twig', [
            'associations' => $associations,
            'events' => $events,
        ]);
    }

    #[Route('/association/create', name: 'app_association_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): Response{
        $data = $request->getContent();
        $data = json_decode($data, JSON_OBJECT_AS_ARRAY);

        $association = new Association();

        $association->setName($data['name']);

        $em->persist($association);
        $em->flush();

        return new Response(json_encode([
            'success' => true,
            'message' => 'Association created',
            'association_id' => $association->getId()
        ]));
    }

    #[Route('/association/{id}', name: 'app_association')]
    public function show(Association $association): Response{
        return new Response(json_encode($association));
    }

    #[Route('/association/{id}/edit', name: 'app_association_edit', methods: ['PATCH'])]
    public function edit(Request $request, Association $association, EntityManagerInterface $em): Response{
        $data = $request->getContent();
        $data = json_decode($data, JSON_OBJECT_AS_ARRAY);

        $association->setName($data['name']);
        $association->setDescription($data['description']);

        $em->persist($association);
        $em->flush();

        return new Response(json_encode([
            'success' => true,
            'message' => 'Association edited',
            'association_id' => $association->getId()
        ]));
    }

    #[Route('/association/{id}/delete', name: 'app_association_delete', methods: ['DELETE'])]
    public function delete(Association $association, EntityManagerInterface $em): Response{
        $em->remove($association);
        $em->flush();

        return new Response(json_encode([
            'success' => true,
            'message' => 'Association deleted'
        ]));
    }
}
