export const NPC_ARCHETYPES = [
    {
        name: 'Elara',
        personality: 'librarian',
        backstory: 'La bibliotecaria del villaggio, custode di antichi tomi e segreti sussurrati tra gli scaffali.',
    },
    {
        name: 'Bardo',
        personality: 'merchant',
        backstory: 'Il mercante ambulante che conosce ogni volto e ogni affare del villaggio.',
    },
    {
        name: 'Mirena',
        personality: 'herbalist',
        backstory: "L'erborista che vive ai margini del bosco, osserva tutto dalla sua finestra.",
    },
    {
        name: 'Stellan',
        personality: 'astronomer',
        backstory: "L'astronomo della torre, veglia nelle notti e vede ciò che altri non vedono.",
    },
    {
        name: 'Greta',
        personality: 'blacksmith',
        backstory: 'La fabbra dal braccio forte, rispettata e temuta. Nessuno osa mentirle in faccia.',
    },
    {
        name: 'Otho',
        personality: 'innkeeper',
        backstory: 'Il locandiere che ascolta le confessioni di tutti davanti a un boccale di birra.',
    },
    {
        name: 'Livia',
        personality: 'weaver',
        backstory: 'La tessitrice silenziosa che intreccia fili e pettegolezzi con la stessa maestria.',
    },
    {
        name: 'Corvo',
        personality: 'hunter',
        backstory: 'Il cacciatore solitario che segue tracce nel bosco e tracce di menzogna nel villaggio.',
    },
    {
        name: 'Serafina',
        personality: 'healer',
        backstory: 'La guaritrice del villaggio, ha curato le ferite di tutti e conosce i segreti di ciascuno.',
    },
    {
        name: 'Tiberio',
        personality: 'elder',
        backstory: "L'anziano saggio del consiglio, ha visto generazioni passare e sa leggere le persone.",
    },
];

// NPC count: ~75% of player count, min 3, max 7
export const NPC_COUNT = {
    4: 3, 5: 3, 6: 3, 7: 3, 8: 4, 9: 5, 10: 5,
};

export const CONNECTION_TEMPLATES = {
    librarian: [
        '{name} — nome scritto a margine di un fascicolo riservato.',
        '{name} cercava qualcosa tra i miei archivi. Non ho chiesto.',
        '{name} restituisce libri con le pagine piegate. So quali.',
        '{name} ha consultato carte che non doveva toccare.',
    ],
    merchant: [
        '{name} paga sempre cash. Mai un assegno.',
        '{name} mi ha ordinato merce fuori listino.',
        'Ho visto {name} al magazzino del porto, tardi.',
        '{name} — cliente abituale. Troppo abituale.',
    ],
    herbalist: [
        '{name} compra sonniferi ogni settimana.',
        'Ho visto {name} uscire dal vicolo sul retro, di notte.',
        '{name} mi ha chiesto qualcosa che non vendo. Due volte.',
        '{name} ha le mani che tremano quando passa da me.',
    ],
    astronomer: [
        '{name} in giro alle tre di notte. L\'ho visto dalla torre.',
        '{name} non era solo quando lo avvistai sul lungofiume.',
        'Le stelle su {name} non mentono. Qualcosa non torna.',
        '{name} mi ha chiesto di tacere su ciò che ho visto.',
    ],
    blacksmith: [
        '{name} mi ha commissionato qualcosa. Non era uno strumento.',
        'Conosco la stretta di mano di {name}. È quella di uno che mente.',
        '{name} alla fonderia a un\'ora strana. Ho fatto finta di niente.',
        '{name} ha ritirato l\'ordine di persona. In contanti, ovvio.',
    ],
    innkeeper: [
        '{name} al bancone ogni sera. Troppe storie non tornano.',
        'Ho sentito {name} al telefono, cabina sul retro. Voce bassa.',
        '{name} lascia sempre lo stesso tavolo d\'angolo. Sempre quello.',
        '{name} — terzo bicchiere e la bocca non si ferma più.',
    ],
    weaver: [
        '{name} mi ha portato un cappotto con una macchia strana.',
        'Ho sentito {name} nell\'androne. Non era solo.',
        '{name} vuole sempre che finisca in fretta. Senza ricevuta.',
        'Quello che {name} porta da rammendare racconta più di lui.',
    ],
    hunter: [
        '{name} nel bosco alle quattro. Non cacciava.',
        'Le impronte di {name} portano dove non dovrebbero.',
        'Ho ritrovato qualcosa di {name} sul sentiero del lago.',
        '{name} si muove come chi sa di essere seguito.',
    ],
    healer: [
        '{name} — ferite che non combaciano con la storia che racconta.',
        '{name} da me di notte. Vuole che nessuno sappia.',
        'Il polso di {name} accelera quando pronuncio certi nomi.',
        '{name} mi ha chiesto qualcosa che non si chiede a un medico.',
    ],
    elder: [
        '{name} — l\'ho visto cambiare. Non in meglio.',
        '{name} mi ha chiesto consiglio, poi ha fatto il contrario.',
        'Conosco {name} da vent\'anni. Quest\'anno qualcosa è diverso.',
        '{name} mi cerca troppo spesso. Vuole il mio silenzio.',
    ],
};
