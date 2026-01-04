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

final class InvitationController extends BaseController
{
    #[Route('/invitation', name: 'invitation_post', methods: ['POST'])]
    public function addInvitation(Request $request, EntityManagerInterface $em, TransportInterface $transport, InvitationRepository $invitationRepository, TenantContext $tenantContext): Response{
        $data = json_decode($request->getContent(), true);
        $eventId = $data['event_id'] ?? null;
        $associationId = $data['association_id'] ?? null;
        $email = $data['email'] ?? '';

        // Event
        if (!$eventId){
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Identifiant d\'évènement invalide ou inexistant !'
            ]);
        }

        $event =  $em->getRepository(Event::class)->find($eventId);

        if (!$event){
            return $this->jsonResponse([
                'success' => false,
                'message' => "Événement $eventId non trouvé !"
            ]);
        }

        // Association
        if (!$associationId && empty($email)){
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Identifiant d\'association invalide ou inexistant !'
            ]);
        }

        $association = $em->getRepository(Association::class)->find($associationId ?? '');

        if (!$association) {

            // Try to find or create Association by email
            if (empty($email)){
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Association ou email requis'
                ]);
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
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Cette association est déjà invitée'
            ]);
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

            return $this->jsonResponse([
                'success' => true,
                'message' => 'Invitation envoyée',
                'invitation' => $invitation
            ]);

        } catch (TransportExceptionInterface $e) {
            error_log($e->getMessage());

            return $this->jsonResponse([
                'success' => false,
                'message' => 'l\'invitation n\'a pas pu être envoyer',
                'invitation' => $invitation
            ]);
        }
    }

    #[Route('/invitation/{id}', name: 'invitation_delete', methods: ['DELETE'])]
    public function deleteInvitation(EntityManagerInterface $em, ?Invitation $invitation): Response{
        if (!$invitation) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Invitation non existante'
            ]);
        }

        $em->remove($invitation);
        $em->flush();

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Invitation supprimée'
        ]);
    }

    #[Route('/invitation/{hash}', name: 'invitation_link', methods: ['GET'])]
    public function index(string $hash, InvitationRepository $invitationRepository): Response
    {
        if (empty($hash)) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'L\'invitation n\'existe pas',
            ]);
        }

        $invitation = $invitationRepository->findOneBy([
            'link' => $hash,
        ]);

        if (!$invitation) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'L\'invitation n\'existe pas',
            ]);
        }

        return $this->render('temporary-link/index.html.twig', [
            'invitation' => $invitation,
            'association' => $invitation->getAssociation(),
            'event' => $invitation->getEvent(),
            'hash' => $hash,
        ]);
    }

    #[Route('/invitation/{hash}/{response}', name: 'invitation_link_response', methods: ['GET'])]
    public function invitationResponse(string $hash, string $response, InvitationRepository $invitationRepository, EntityManagerInterface $em): Response{
        if (empty($hash)) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'L\'invitation n\'existe pas',
            ]);
        }

        $invitation = $invitationRepository->findOneBy([
            'link' => $hash,
        ]);

        if (!$invitation) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'L\'invitation n\'existe pas',
            ]);
        }

        if (empty($response)){
            return $this->jsonResponse([
                'success' => false,
                'message' => 'La réponse ne peut pas être vide !',
            ]);
        }

        if ($response === "accept"){
            $invitation->setEtat(true);
        }else if ($response === "decline"){
            $invitation->setEtat(false);
        }else {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'La réponse n\'est pas reconnue !',
            ]);
        }

        try{
            $em->persist($invitation);
            $em->flush();
        }catch (\Exception $e) {
            // TODO: Exception report
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'enregistrement',
            ]);
        }

        return $this->jsonResponse([
            'success' => true,
            'message' => "Votre réponse a bien été prise en compte !"
        ]);
    }
}
