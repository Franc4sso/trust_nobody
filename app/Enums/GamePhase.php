<?php

namespace App\Enums;

enum GamePhase: string
{
    case Setup = 'setup';
    case RoleReveal = 'role_reveal';
    case N1Intro = 'n1_intro';
    case N1Vote = 'n1_vote';
    case Night = 'night';
    case Morning = 'morning';
    case Day = 'day';
    case Vote = 'vote';
    case MediumReveal = 'medium_reveal';
    case GameOver = 'game_over';
}
