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
    private static string $from = "unjouruneasso@exemple.com";

    public static function send(TransportInterface $transport, string $email, string $subject, string $html) : bool{
        $email = (new Email())
            ->from(static::$from)
            ->to($email)
            ->subject($subject)
            ->html($html);

        try{
            $transport->send($email);
        }catch (TransportExceptionInterface){
            return false;
        }

        return true;
    }

    public static function sendEventInvitationMail(TransportInterface $transport, Event $event, Association $association, string $email, string $temporaryLink): bool{
        $email = (new TemplatedEmail())
            ->from(static::$from)
            ->to($email)
            ->subject("Invitation {$event->getName()}")
            ->htmlTemplate('email/invitation.html.twig')
            ->context([
                'event' => $event,
                'association' => $association,
                'link' => $temporaryLink
            ]);

        try {
            $transport->send($email);
            return true;
        } catch (TransportExceptionInterface) {
            return false;
        }
    }
}
