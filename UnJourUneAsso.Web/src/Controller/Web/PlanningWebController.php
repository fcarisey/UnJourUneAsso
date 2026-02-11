<?php

namespace App\Controller\Web;

use App\Repository\EventRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class PlanningWebController extends BaseWebController
{
    protected string $title = "Planning";

    #[Route('/planning', name: 'planning_index', methods: ['GET'])]
    public function index(EventRepository $eventRepository): Response
    {
        $events = $eventRepository->findAll();

        return $this->render('planning/index.html.twig', [
            'events' => $events,
        ]);
    }
}
