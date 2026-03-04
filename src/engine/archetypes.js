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
    4: 3, 5: 3, 6: 4, 7: 5, 8: 6, 9: 6, 10: 7,
};

export const CONNECTION_TEMPLATES = {
    librarian: [
        '{name} viene spesso a consultare i miei libri... e a sussurrare segreti tra gli scaffali.',
        'Ho trovato il nome di {name} scritto a margine di un vecchio diario. Curioso, no?',
        '{name} mi ha chiesto di cercare un tomo proibito. Non ho mai dimenticato quello sguardo.',
        '{name} passa ore nella mia biblioteca. A volte mi chiedo cosa stia davvero cercando.',
    ],
    merchant: [
        '{name} è uno dei miei clienti più assidui. Paga sempre in contanti, mai domande.',
        'Faccio affari con {name} da tempo. Conosco i suoi debiti e i suoi segreti.',
        '{name} mi ha chiesto di procurare qualcosa di... insolito. Il denaro parla.',
        "Ho visto {name} al mercato nero. Non mi ha visto — o finge di non avermi visto.",
    ],
    herbalist: [
        "{name} viene a comprare le mie erbe. Ultimamente chiede rimedi per l'insonnia.",
        'Dal mio giardino ho visto {name} passare a notte fonda. Dove andava?',
        '{name} mi ha chiesto un preparato strano. Non ho fatto domande, ma ci penso ancora.',
        'Curo {name} da tempo. Conosco il suo corpo e i suoi segreti meglio di chiunque altro.',
    ],
    astronomer: [
        'Dalla mia torre ho visto {name} camminare sotto le stelle. Non era solo.',
        '{name} mi ha chiesto di leggere il suo oroscopo. Le stelle non mentono mai.',
        'Le notti sono lunghe quassù. E ho visto {name} fare cose che gli altri non sanno.',
        "{name} è salito in torre a chiedermi consiglio. Aveva paura di qualcosa — o di qualcuno.",
    ],
    blacksmith: [
        "{name} mi ha commissionato un'arma. Diceva per difesa. Ma da cosa?",
        "Lavoro il ferro per {name} da anni. Conosco la forza delle sue mani e delle sue bugie.",
        "{name} è passato dalla mia fucina a un'ora sospetta. Il fuoco rivela molto dei volti.",
        '{name} ha forgiato qualcosa per me. Non posso dire cosa, ma non era un attrezzo da lavoro.',
    ],
    innkeeper: [
        "{name} beve alla mia locanda ogni sera. L'alcol scioglie la lingua...",
        'Ho sentito {name} parlare troppo dopo il terzo bicchiere. Cose che non dovrei sapere.',
        '{name} si ferma sempre al mio bancone. Mi racconta tutto — forse troppo.',
        '{name} alla mia locanda passa spesso. E sempre con aria preoccupata.',
    ],
    weaver: [
        '{name} mi porta i suoi vestiti da rammendare. Sulle stoffe rimangono tracce...',
        "Mentre tessevo ho sentito {name} parlare con qualcuno nell'ombra. Non ho visto chi.",
        '{name} mi ha chiesto un mantello scuro. Per nascondersi dalla pioggia, ha detto.',
        'I fili che intrecccio e i pettegolezzi che raccolgo — {name} compare in entrambi.',
    ],
    hunter: [
        "Ho incrociato {name} nel bosco. A quell'ora, nessuno esce per funghi.",
        'Le tracce non mentono. Ho seguito quelle di {name} fino a un posto strano.',
        '{name} ha le stesse abitudini di una preda che si nasconde. Lo osservo da tempo.',
        'Nel bosco ho trovato qualcosa che appartiene a {name}. Non doveva essere lì.',
    ],
    healer: [
        'Ho curato le ferite di {name}. Alcune non erano ferite accidentali.',
        '{name} viene da me di notte, quando nessuno lo vede. Ha qualcosa da nascondere.',
        'Conosco il battito del cuore di {name}. Ultimamente è più veloce del solito.',
        '{name} mi ha chiesto un rimedio per le mani tremanti. Non è il freddo a farlo tremare.',
    ],
    elder: [
        "Conosco {name} fin da quando era bambino. Qualcosa in quegli occhi è cambiato.",
        "{name} mi ha chiesto consiglio. Ma non credo abbia seguito il mio avvertimento.",
        'Ho visto generazioni passare. {name} mi ricorda qualcuno che ho conosciuto — e temuto.',
        '{name} viene a trovarmi spesso. Forse cerca la mia approvazione, o forse il mio silenzio.',
    ],
};
