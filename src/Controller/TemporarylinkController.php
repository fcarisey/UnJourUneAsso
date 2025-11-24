<?php

namespace App\Controller;

use App\Repository\InvitationRepository;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Exception\ORMException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class TemporarylinkController extends BaseController
{
    protected string $title = "Lien d'invitation";

    #[Route('/invitation/{hash}', name: 'app_temporarylink')]
    public function index(string $hash, InvitationRepository $invitationRepository): Response
    {
        if (empty($hash)) {
            return new Response("Ce lien d'invitation n'existe pas !", Response::HTTP_NOT_FOUND);
        }

        $invitation = $invitationRepository->findOneBy([
            'link' => $hash,
        ]);

        if (!$invitation) {
            return new Response("Ce lien d'invitation n'existe pas !", Response::HTTP_NOT_FOUND);
        }

        return $this->render('temporarylink/index.html.twig', [
            'invitation' => $invitation,
            'association' => $invitation->getAssociation(),
            'event' => $invitation->getEvent(),
            'hash' => $hash,
        ]);
    }

    #[Route('/invitation/{hash}/{response}', name: 'app_temporarylink_response')]
    public function invitationResponse(string $hash, string $response, InvitationRepository $invitationRepository, EntityManagerInterface $em): Response{
        if (empty($hash)) {
            return new Response(json_encode([
                'success' => false,
                'message' => "Ce lien d'invitation n'existe pas !",
            ]));
        }

        $invitation = $invitationRepository->findOneBy([
            'link' => $hash,
        ]);

        if (!$invitation) {
            return new Response(json_encode([
                'success' => false,
                'message' => "Ce lien d'invitation n'existe pas ou a éxpiré. !",
            ]));
        }

        if (empty($response)){
            return new Response(json_encode([
                'success' => false,
                'message' => "La réponse n'est pas reconnue !",
            ]));
        }

        if ($response === "accept"){
            $invitation->setEtat(true);
        }else if ($response === "decline"){
            $invitation->setEtat(false);
        }else {
            return new Response(json_encode([
                'success' => false,
                'message' => "La réponse n'est pas reconnue !"
            ]));
        }

        try{
            $em->persist($invitation);
            $em->flush();
        }catch (ORMException $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
        }

        return new Response(json_encode([
            'success' => true,
            'message' => "Votre réponse a bien été prise en compte !"
        ]));
    }
}
