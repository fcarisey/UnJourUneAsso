<?php

namespace App\Controller;

use App\Entity\Association;
use App\Entity\Event;
use App\Entity\Invitation;
use App\Repository\EventRepository;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
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
     * @throws Exception
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

    /**
     * @throws Exception
     */
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

    #[Route('/event/{id}/invitations', name: 'event_invitations', methods: ['GET'])]
    public function getInvitations(Event $event): Response{
        return new Response(json_encode([
            'success' => true,
            'invitations' => $event->getInvitations()->toArray()
        ]));
    }

    #[Route('/associations/available', name: 'associations_available', methods: ['GET'])]
    public function getAvailableAssociations(EntityManagerInterface $em): Response{
        $associations = $em->getRepository(\App\Entity\Association::class)->findAll();

        return new Response(json_encode([
            'success' => true,
            'associations' => $associations
        ]));
    }

    #[Route('/event/{id}/invitation/add', name: 'event_invitation_add', methods: ['POST'])]
    public function addInvitation(Request $request, Event $event, EntityManagerInterface $em, MailerInterface $mailer): Response{
        $data = json_decode($request->getContent(), true);
        $associationId = $data['associationId'] ?? null;
        $email = $data['email'] ?? '';

        // Cas 1: Association existante sélectionnée
        if ($associationId) {
            $association = $em->getRepository(Association::class)->find($associationId);

            if (!$association) {
                return new Response(json_encode([
                    'success' => false,
                    'message' => 'Association introuvable'
                ]), 404);
            }

            $email = (new Email())
                ->from("test@exemple.fr")
                ->to("you@exemple.com")
                ->subject("Vous avez été invité à l'évènement " . $event->getName())
                ->text("Lien d'invitation blablabla ...");

            try {
                $mailer->send($email);
            } catch (TransportExceptionInterface $e) {
                return new Response(json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]));
            }
        }
        // Cas 2: Création via email
        else if (!empty($email)) {
            // Chercher ou créer l'association par email
            $association = $em->getRepository(Association::class)->findOneBy(['name' => $email]);

            if (!$association) {
                $association = new Association();
                $association->setName($email);
                $association->setEmail($email);
                $association->setDescription('Créé automatiquement via invitation');
                $em->persist($association);
            }
        } else {
            return new Response(json_encode([
                'success' => false,
                'message' => 'Association ou email requis'
            ]), 400);
        }

        // Vérifier si l'invitation existe déjà
        $existingInvitation = $em->getRepository(Invitation::class)
            ->findOneBy(['event' => $event, 'association' => $association]);

        if ($existingInvitation) {
            return new Response(json_encode([
                'success' => false,
                'message' => 'Cette association est déjà invitée'
            ]), 400);
        }

        // Créer l'invitation
        $invitation = new Invitation();
        $invitation->setEvent($event);
        $invitation->setAssociation($association);
        $invitation->setEtat(null); // En attente

        $em->persist($invitation);
        $em->flush();

        return new Response(json_encode([
            'success' => true,
            'message' => 'Invitation envoyée',
            'invitation' => $invitation
        ]));
    }

    #[Route('/event/invitation/{id}/delete', name: 'event_invitation_delete', methods: ['DELETE'])]
    public function deleteInvitation(EntityManagerInterface $em, \App\Entity\Invitation $invitation): Response{
        $em->remove($invitation);
        $em->flush();

        return new Response(json_encode([
            'success' => true,
            'message' => 'Invitation supprimée'
        ]));
    }

    #[Route('/test_mail', name: 'test-mail', methods: ['GET'])]
    public function testMail(MailerInterface $mailer): Response{
        $email = (new Email())
            ->from("test@exemple.com")
            ->to("destinataire@exemple.com")
            ->subject("Mail de test via Mailpit")
            ->html("Test message");

        try {
            $mailer->send($email);
        } catch (TransportExceptionInterface $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
        }

        return new Response(json_encode([
            'success' => true,
        ]));
    }
}
