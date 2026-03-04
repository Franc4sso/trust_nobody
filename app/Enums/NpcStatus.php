<?php

namespace App\Enums;

enum NpcStatus: string
{
    case Alive = 'alive';
    case Dead = 'dead';
    case Threatened = 'threatened';
}
