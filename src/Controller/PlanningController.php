<?php

namespace App\Controller;

use App\Repository\EventRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class PlanningController extends BaseController
{
    protected string $title = "Planning";

    #[Route('/', name: 'app_planning')]
    public function index(EventRepository $eventRepository): Response
    {
        $events = $eventRepository->findAll();

        return $this->render('planning/index.html.twig', [
            'events' => $events,
        ]);
    }
}
