<?php

namespace App\Enums;

enum HintType: string
{
    case Normal = 'normal';
    case Threatened = 'threatened';
    case AnalystBonus = 'analyst_bonus';
}
