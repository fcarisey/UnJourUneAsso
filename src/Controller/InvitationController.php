<?php

namespace App\Controller;

use App\Context\TenantContext;
use App\Entity\Association;
use App\Entity\Event;
use App\Entity\Invitation;
use App\Helper\TemporaryLinkHelper;
use App\Repository\InvitationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\Transport\TransportInterface;
use Symfony\Component\Routing\Attribute\Route;

final class InvitationController extends AbstractController
{
    #[Route('/invitation', name: 'invitation_post', methods: ['POST'])]
    public function addInvitation(Request $request, EntityManagerInterface $em, TransportInterface $transport, InvitationRepository $invitationRepository, TenantContext $tenantContext): Response{
        $data = json_decode($request->getContent(), true);
        $eventId = $data['event_id'] ?? null;
        $associationId = $data['association_id'] ?? null;
        $email = $data['email'] ?? '';

        // Event
        if (!$eventId){
            return new Response(json_encode([
                'success' => false,
                'message' => 'Identifiant d\'évènement invalide ou inexistant !'
            ]), headers: ['Content-Type' => 'application/json']);
        }

        $event =  $em->getRepository(Event::class)->find($eventId);

        if (!$event){
            return new Response(json_encode([
                'success' => false,
                'message' => "Événement $eventId non trouvé !"
            ]), headers: ['Content-Type' => 'application/json']);
        }

        // Association
        if (!$associationId && empty($email)){
            return new Response(json_encode([
                'success' => false,
                'message' => 'Identifiant d\'association invalide ou inexistant !'
            ]), headers: ['Content-Type' => 'application/json']);
        }

        $association = $em->getRepository(Association::class)->find($associationId ?? '');

        if (!$association) {

            // Try to find or create Association by email
            if (empty($email)){
                return new Response(json_encode([
                    'success' => false,
                    'message' => 'Association ou email requis'
                ]), headers: ['Content-Type' => 'application/json']);
            }

            $association = $em->getRepository(Association::class)->findOneBy(['email' => $email]);

            if (!$association) {
                $association = new Association();
                $association->setName($email);
                $association->setEmail($email);
                $association->setDescription('Créé automatiquement via invitation');
                $em->persist($association);
            }
        }

        // Vérifier si l'invitation existe déjà
        $existingInvitation = $em->getRepository(Invitation::class)
            ->findOneBy(['event' => $event, 'association' => $association]);

        if ($existingInvitation) {
            return new Response(json_encode([
                'success' => false,
                'message' => 'Cette association est déjà invitée'
            ]), headers: ['Content-Type' => 'application/json']);
        }

        // Créer l'invitation
        $invitation = new Invitation();
        $invitation->setEvent($event);
        $invitation->setAssociation($association);
        $invitation->setEtat(null); // En attente
        $invitation->setLink(TemporaryLinkHelper::CreateLink($email . $association->getName() . $event->getName()));

        try {
            EmailController::sendEventInvitationMail($transport, $event, $association, $association->getEmail(), $invitation->getLink(), $tenantContext);

            $em->persist($invitation);
            $em->flush();

            $invitation = $invitationRepository->findOneBy([
                'association' => $association,
                'event' => $event
            ]);

            return new Response(json_encode([
                'success' => true,
                'message' => 'Invitation envoyée',
                'invitation' => $invitation
            ]), headers: ['Content-Type' => 'application/json']);

        } catch (TransportExceptionInterface $e) {
            error_log($e->getMessage());

            return new Response(json_encode([
                'success' => false,
                'message' => 'l\'invitation n\'a pas pu être envoyer',
                'invitation' => $invitation
            ]), headers: ['Content-Type' => 'application/json']);
        }
    }

    #[Route('/invitation/{id}', name: 'invitation_delete', methods: ['DELETE'])]
    public function deleteInvitation(EntityManagerInterface $em, ?Invitation $invitation): Response{
        if (!$invitation) {
            return new Response(json_encode([
                'success' => false,
                'message' => 'Invitation non existante'
            ]), headers: ['Content-Type' => 'application/json']);
        }

        $em->remove($invitation);
        $em->flush();

        return new Response(json_encode([
            'success' => true,
            'message' => 'Invitation supprimée'
        ]), headers: ['Content-Type' => 'application/json']);
    }
}
