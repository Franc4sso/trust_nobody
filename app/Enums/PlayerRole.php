<?php

namespace App\Enums;

enum PlayerRole: string
{
    case SerialKiller = 'serial_killer';
    case Guardian = 'guardian';
    case Medium = 'medium';
    case Analyst = 'analyst';
    case Citizen = 'citizen';
}
