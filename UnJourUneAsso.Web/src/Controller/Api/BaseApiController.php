<?php

namespace App\Controller\Api;

use Symfony\Component\HttpFoundation\Response;

abstract class BaseApiController
{
    /**
     * @param array $data
     * @param int $status
     * @param array $headers
     *
     * @return Response
     */
    protected function jsonResponse(array $data, int $status = Response::HTTP_OK, array $headers = ['Content-Type' => 'application/json']): Response{
        return new Response(json_encode($data), $status, $headers);
    }
}
