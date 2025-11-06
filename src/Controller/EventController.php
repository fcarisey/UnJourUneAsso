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

    // HEX colors
    private const EVENT_COLORS = [
        '8B5CF6', // Violet vibrant (match votre thème)
        'EC4899', // Rose fuchsia
        'F59E0B', // Orange/Ambre
        '10B981', // Vert émeraude
        '3B82F6', // Bleu ciel
        'EF4444', // Rouge vif
        '14B8A6', // Turquoise/Teal
        'A855F7', // Violet clair
        'F97316', // Orange profond
        '06B6D4', // Cyan
        '84CC16', // Vert lime
        '6366F1', // Indigo
    ];

    #[Route("/events", name: "event_list")]
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
        $event->setColor(self::EVENT_COLORS[array_rand(self::EVENT_COLORS)]);

        $em->persist($event);
        $em->flush();

        return new Response(json_encode([
            'success' => true,
            'message' => 'Event created successfully',
            'event_id' => $event->getId(),
            'color' => '#' . $event->getColor()
        ]));
    }

    #[Route('/event/delete/{id}', name: 'event_delete', methods: ['DELETE'])]
    public function delete(EntityManagerInterface $em, Event $event): Response{
        $em->remove($event);
        $em->flush();

        return new Response(json_encode([
            'success' => true,
            'message' => 'Event deleted successfully'
        ]));
    }

    #[Route('/event/update/{id}', name: 'event_update', methods: ['PUT'])]
    public function update(Request $request, EntityManagerInterface $em, Event $event): Response{
        $data = $request->getContent();
        $data = json_decode($data, JSON_OBJECT_AS_ARRAY);

        $event->setName($data['title']);
        $event->setDescription($data['description']);
        $event->setStartAt(new \DateTimeImmutable($data['startDateTime']));
        $event->setEndAt(new \DateTimeImmutable($data['endDateTime']));

        $em->flush();

        return new Response(json_encode([
            'success' => true,
            'message' => 'Event updated successfully'
        ]));
    }
}
