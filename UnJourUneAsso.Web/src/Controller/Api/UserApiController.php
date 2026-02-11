<?php

namespace App\Controller\Api;

use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class UserApiController extends BaseApiController
{
    #[Route('/user/whois')]
    public function whois(Security $security) : Response{
        $security->getUser();

        return $this->jsonResponse([
            'success' => true,
            'data' => [
                'userId' => $security->getUser()->getId(),
            ]
        ]);
    }
}
