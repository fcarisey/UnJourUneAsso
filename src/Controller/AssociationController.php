<?php

namespace App\Controller;

use App\Entity\Association;
use App\Repository\AssociationRepository;
use App\Repository\EventRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AssociationController extends BaseController
{
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

    #[Route('/associations/{id}', name: 'app_association')]
    public function show(Association $association): Response{
        return new Response(json_encode($association));
    }
}

