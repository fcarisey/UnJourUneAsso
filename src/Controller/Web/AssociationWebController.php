<?php

namespace App\Controller\Web;

use App\Repository\AssociationRepository;
use App\Repository\EventRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class AssociationWebController extends BaseWebController
{
    protected string $title = "Association";

    #[Route('/associations', name: 'association_list_view', methods: ['GET'])]
    public function index(AssociationRepository $associationRepository, EventRepository $eventRepository): Response
    {
        $associations = $associationRepository->findAll();
        $events = $eventRepository->findAll();

        return $this->render('association/index.html.twig', [
            'associations' => $associations,
            'events' => $events,
        ]);
    }
}
