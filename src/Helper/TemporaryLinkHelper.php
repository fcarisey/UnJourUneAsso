<?php

namespace App\Helper;

abstract class TemporaryLinkHelper{
    public static function CreateLink(string $hashFrom) : string {
        return md5($hashFrom);
    }
}

