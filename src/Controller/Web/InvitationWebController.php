<?php

namespace App\Controller\Web;

use App\Repository\InvitationRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class InvitationWebController extends BaseWebController
{
    #[Route('/invitation/{hash}', name: 'invitation_link', methods: ['GET'])]
    public function index(string $hash, InvitationRepository $invitationRepository): Response
    {
        if (empty($hash)) {
            return new Response('L\'invitation n\'existe pas');
        }

        $invitation = $invitationRepository->findOneBy([
            'link' => $hash,
        ]);

        if (!$invitation) {
            return new Response('L\'invitation n\'existe pas');
        }

        return $this->render('temporary-link/index.html.twig', [
            'invitation' => $invitation,
            'association' => $invitation->getAssociation(),
            'event' => $invitation->getEvent(),
            'hash' => $hash,
        ]);
    }
}
