<?php

namespace App\Controller;

use App\Entity\Event;
use App\Repository\EventRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class EventController extends BaseController
{
    protected string $title = "évènement";

    #[Route("/event/list", name: "event_list")]
    public function list(EventRepository $eventRepository): Response{
        return new Response(json_encode([
            'events' => $eventRepository->findAll()
        ]));
    }

    /**
     * @throws \Exception
     */
    #[Route('/event/create', name: 'event_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): Response{
        $data = $request->getContent();
        $data = json_decode($data, JSON_OBJECT_AS_ARRAY);

        $event = new Event();
        $event->setName($data['title']);
        $event->setDescription($data['description']);
        $event->setStartAt(new \DateTimeImmutable($data['startDateTime']));
        $event->setEndAt(new \DateTimeImmutable($data['endDateTime']));

        $em->persist($event);
        $em->flush();

        return new Response(json_encode([
            'success' => true,
            'message' => 'Event created successfully',
            'event_id' => $event->getId()
        ]));
    }

    #[Route('/event/delete/{id}', name: 'event_delete', methods: ['DELETE'])]
    public function delete(Request $request, EntityManagerInterface $em, Event $event): Response{
        $em->remove($event);
        $em->flush();

        return new Response(json_encode([
            'success' => true,
            'message' => 'Event deleted successfully'
        ]));
    }
}
