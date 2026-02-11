<?php

namespace App\Controller\Web;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

abstract class BaseWebController extends AbstractController
{
    protected string $title = "";

    /**
     * @param string $view
     * @param array $parameters
     * @param Response|null $response
     *
     * @return Response
     */
    protected function render(string $view, array $parameters = [], ?Response $response = null): Response
    {
        $parameters['title'] = $this->title;
        return parent::render($view, $parameters, $response);
    }
}
