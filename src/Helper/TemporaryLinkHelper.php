<?php

namespace App\Helper;

use Random\RandomException;
use Symfony\Component\Uid\Uuid;

final class TemporaryLinkHelper{
    public static function createLink() : string {
        try {
            return bin2hex(random_bytes(16));
        } catch (RandomException $e) {
            // TODO: Exception report
            error_log($e->getMessage());
            return Uuid::v4();
        }
    }
}

