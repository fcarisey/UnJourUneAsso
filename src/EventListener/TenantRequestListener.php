<?php

namespace App\EventListener;

use App\Context\TenantContext;
use App\Entity\Tenants;
use App\Repository\TenantsRepository;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Exception\ORMException;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

readonly class TenantRequestListener
{
    public function __construct(
        private TenantContext     $tenantContext,
        private TenantsRepository $tenantsRepository
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
    }
}
