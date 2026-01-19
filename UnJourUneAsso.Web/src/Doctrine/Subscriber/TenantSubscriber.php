<?php

namespace App\Doctrine\Subscriber;

use App\Aware\TenantAwareInterface;
use App\Context\TenantContext;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\Events;

#[AsDoctrineListener(event: Events::onFlush)]
readonly class TenantSubscriber
{
    public function __construct(private TenantContext $tenantContext) {}

    public function onFlush(OnFlushEventArgs $args): void{

        $em = $args->getObjectManager();
        $uow = $em->getUnitOfWork();

        foreach ($uow->getScheduledEntityInsertions() as $entity) {
            if (!$entity instanceof TenantAwareInterface || $entity->getTenant() !== null) {
                continue;
            }

            $entity->setTenant($this->tenantContext->getTenant());

            $meta = $em->getClassMetadata(get_class($entity));
            $uow->recomputeSingleEntityChangeSet($meta, $entity);
        }
    }
}
