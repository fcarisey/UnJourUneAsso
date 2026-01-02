<?php

namespace App\Controller;

use App\Entity\Association;
use App\Entity\Event;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\Transport\TransportInterface;
use Symfony\Component\Mime\Email;

abstract class EmailController
{
    private static string $from = "unjouruneasso@gmail.com";

    /**
     * @throws TransportExceptionInterface
     */
    public static function send(TransportInterface $transport, string $email, string $subject, string $html) : void{
        $email = new Email()
            ->from(static::$from)
            ->to($email)
            ->subject($subject)
            ->html($html);

        $transport->send($email);
    }

    /**
     * @throws TransportExceptionInterface
     */
    public static function sendEventInvitationMail(TransportInterface $transport, Event $event, Association $association, string $email, string $temporaryLink, $tenantContext): void{
        $email = new TemplatedEmail()
            ->from(static::$from)
            ->to($email)
            ->subject("Invitation {$event->getName()}")
            ->htmlTemplate('email/invitation.html.twig')
            ->context([
                'event' => $event,
                'association' => $association,
                'link' => $temporaryLink,
                'tenant' => $tenantContext->getTenant()
            ]);

        $transport->send($email);
    }
}
