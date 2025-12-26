<?php

namespace App\EventListener;

use App\Context\TenantContext;
use App\Repository\TenantsRepository;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\CssSelector\Exception\InternalErrorException;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

readonly class TenantRequestListener
{
    public function __construct(
        private TenantContext     $tenantContext,
        private TenantsRepository $tenantsRepository,
        private EntityManagerInterface $entityManager
    ) {}

    /**
     */
    public function onKernelRequest(RequestEvent $event): void{
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $host = $request->getHost();

        $subdomain = explode('.', $host)[0];

        $tenant = $this->tenantsRepository->findOneBy([
            'subdomain' => $subdomain,
            'status' => 1
        ]);

        if (!$tenant) {
            throw new NotFoundHttpException("Tenant not found: $subdomain");
        }

        $this->tenantContext->setTenant($tenant);

        $conn = $this->entityManager->getConnection();

        if ($conn->isConnected()) {
            try {
                $conn->executeStatement('SELECT set_config(?, ?, ?)', [
                    'app.current_tenant',
                    (string) $tenant->getId(),
                    'false'
                ]);
            } catch (Exception $e) {
                error_log($e->getMessage());
                throw new NotFoundHttpException($e->getMessage());
            }
        }
    }
}
