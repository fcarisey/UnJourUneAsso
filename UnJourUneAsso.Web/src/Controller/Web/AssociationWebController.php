<?php

namespace App\Controller\Web;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class AssociationWebController extends BaseWebController
{
    protected string $title = "Association";

    #[Route('/associations', name: 'association_index', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('association/index.html.twig');
    }
}
