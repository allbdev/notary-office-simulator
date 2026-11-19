/**
 * English (default locale). Written, not translated: the joke has to land without knowing what a
 * cartório is. Keys match pt-BR.ts exactly (a test checks keys, {slots} and variant counts).
 */
const en = {
  meta: {
    title: "Cartório Simulator",
    description:
      "You only need one stamp. A free daily game about getting one document stamped at a Brazilian notary office before lunch.",
  },
  common: {
    window: "Window {n}",
    windowShort: "W{n}",
    then: "then",
    and: "and",
    languageToggle: "Português",
    languageLabel: "Mudar para português",
  },
  header: {
    clock: "cartório clock",
    yourTime: "your time",
    ticket: "your ticket",
    challenge: "challenge",
    challengeValue: "nº {number} · {date} · {goal}",
    noTicket: "—",
  },
  landing: {
    kicker: "daily challenge",
    title: "You only need one stamp.",
    subtitle: "Today you'll get it. Probably.",
    body: "Every day, a new bureaucracy, the same for everyone. Work out the order of the windows, fill in what they tell you, and get out before lunch.",
    take: "Take a ticket",
    resume: "Back to the line",
    seeResult: "See today's result",
    how: "How it works",
    small: "3 to 5 minutes · no sign-up · free · open source",
    office: "NOTARY · 3RD OFFICE",
    yourTicket: "YOUR TICKET",
    number: "Nº {number}",
    dateLine: "CHALLENGE OF {date}",
    todayLine: "TODAY: {goal}",
    countLine: "{docs} documents · 5 windows",
    lunchLine: "1 goes to lunch",
    wait: "PLEASE WAIT TO BE CALLED.",
    orNot: "OR DON'T.",
    streak: "Streak: {n} days",
    streakOne: "Streak: 1 day",
  },
  hall: {
    backToLine: "Back to my line",
    label: "The hall",
    open: "Open · line of {n}",
    openEmpty: "Open · no line",
    lunch: "Lunch · back in {time}",
    coffee: "Coffee · back in {time}",
    closesIn: "Closes in {time}",
    closed: "Closed for the day",
    systemDown: "System down",
    outOfInk: "Out of ink · {time}",
    you: "You: {ticket} · {n} ahead",
    youNext: "You: {ticket} · you're next",
    panel: "Panel: calling {ticket}",
    panelLabel: "TICKET",
    panelWindow: "WINDOW",
    boothClosed: "CLOSED",
    boothAway: "BACK SOON",
    take: "Take a ticket for {window}: {role}",
    lastMessage: "last message",
    welcome: "“Signatures is window 3. Take a ticket and wait to be called.”",
    paperOnly: "Paperwork doesn't need the system. Fill in what you can.",
  },
  folder: {
    title: "your folder · what's missing",
    brought: "you brought",
    more: "Window 3 tells you one thing at a time. There may be more.",
    hint: "Each window only tells you the next step. The rest you find out.",
    fill: "Fill in",
    view: "Look",
    toFill: "to fill in",
    filled: "filled in",
    deliveredTo: "at {window}",
    penLabel: "Pen on your desk",
    blue: "blue",
    black: "black",
    open: "Folder",
    close: "Close folder",
    idCard: "ID card",
    idName: "Name",
    idCpf: "CPF (tax number)",
    idRg: "RG (ID number)",
    idBirth: "Born",
    idMother: "Mother",
    idAddress: "Address",
    idCep: "CEP (postcode)",
    idSignature: "Signature",
  },
  window: {
    openForm: "Look at the form",
    goTo: "Go to {window}",
    attendant: "attendant · {window}",
    hand: "Hand in what I have",
    back: "Back to the hall",
    called: "{ticket}, {window}!",
    youHave: "you're carrying",
    nothing: "Nothing useful yet.",
    missing: "still missing",
  },
  queue: {
    lookHall: "Look around the hall",
    inLine: "in line at {window}",
    ahead: "{n} people ahead of you.",
    aheadOne: "1 person ahead of you.",
    next: "You're next.",
    explain:
      "The cartório clock runs 30 times faster than yours: about {seconds} seconds per ticket.",
    paused: "This window isn't calling anyone right now.",
    wait: "Wait",
    leave: "Leave the line (lose your place)",
    meanwhile: "Fill in forms while you wait: open your folder.",
  },
  form: {
    office: "NOTARY PUBLIC · 3RD OFFICE",
    via: "copy 2 of 3",
    viaNote: "(copy 1 does not exist)",
    counter: "field {i} of {n}",
    prev: "Previous field",
    next: "Next field",
    rules: "today's rules at this window",
    tip: "The rule changes with every form. Read the label: autopilot goes to the back of the line.",
    tear: "Tear up and start over",
    close: "Put it back in the folder",
    stampSpace: "SPACE RESERVED FOR THE STAMP",
    fineprint:
      "Corrections void this form and, as a precaution, the previous one. Fill in block letters, legible or illegible, as long as they're block.",
    penWritten: "Written in {pen} pen.",
    penMismatch: "Your desk pen is {pen}. This form was started in the other one.",
    goesTo: "Hand it in at {window}.",
    goesToFinal: "Hand it in at {window} with everything else.",
    tick: "Tick",
    printed: "typed by the cartório",
  },
  sentBack: {
    title: "sent back by {window}",
    count: "send-backs today",
    lost: "time so far",
    ok: "Take a deep breath",
  },
  event: {
    systemDown: "SYSTEM DOWN",
    backIn: "BACK IN {time} · THE CLOCK DOESN'T STOP",
    drawn: "unforeseen · drawn by today's seed",
    explain:
      "No window serves until the system is back. Paperwork doesn't depend on the system: you can fill in forms meanwhile.",
    outOfInk: "{window} is out of stamp ink. Back in {time}.",
  },
  result: {
    declaration: "DECLARATION",
    continue: "See the result",
    done: "challenge nº {number} · done",
    failed: "challenge nº {number} · not today",
    title: "Signature notarised.",
    failedTitle: "The cartório closed.",
    failedBody: "It happens. It happens to everyone. Come back tomorrow, with a new bureaucracy.",
    time: "time",
    forms: "forms",
    sendBacks: "send-backs",
    path: "your path through the windows",
    legend: "green: sorted · amber: told something · red: sent back",
    copy: "Copy result",
    copied: "Copied. Paste it wherever bureaucracy is appreciated.",
    copyFailed: "Couldn't copy. Select the text above.",
    ideal: "See the ideal path",
    hideIdeal: "Hide the ideal path",
    idealTitle: "a route the solver found",
    idealTime: "{time} for a robot that never misreads a label",
    tomorrow: "Tomorrow there's another one. Today's doesn't open again.",
    signedBy: "declarant's signature",
    share: "Cartório Simulator nº {number}",
    shareStats: "{time} · {forms} forms · {back} send-backs",
    shareFailed: "Didn't make it · {forms} forms · {back} send-backs",
  },
  how: {
    title: "How it works",
    p1: "You arrive with your ID and one document. You need one stamp from window 3.",
    p2: "Window 3 never says everything you need at once. Each visit, it tells you one more thing and hands you the form for it.",
    p3: "Take a ticket at a window and wait to be called. While you wait, fill in your forms. Every form has one trap: read each label.",
    p4: "Windows go to lunch, close early and have manias. The cartório clock runs 30 times faster than yours. Your score is your real time.",
    p5: "When you have everything, window 3 stamps it. Paste your result. Tomorrow, a new chain, the same for everyone.",
    close: "Got it",
  },
  windows: {
    "1": {
      role: "Filing",
      takes: "Takes a filled-in form, gives back a filing stamp.",
      mania: "Only accepts blue pen.",
      rules: [
        "An empty field comes back. A field that's too right also raises suspicion.",
        "Blue pen. Always blue.",
        "The final stamp isn't here.",
      ],
    },
    "2": {
      role: "Copies",
      takes: "Copies anything, including copies.",
      mania: "The machine jams on every fourth copy.",
      rules: [
        "Copies are copied as they are, mistakes included.",
        "If the machine jams, take another ticket.",
        "Originals are not given back twice.",
      ],
    },
    "3": {
      role: "Signatures",
      takes: "The final stamp. Checks everything.",
      mania: "Never tells you everything that's missing at once.",
      rules: [
        "One requirement per visit. It's the rule.",
        "Everything at once, on the last visit.",
        "Forms handed in here are checked here.",
      ],
    },
    "4": {
      role: "Certification",
      takes: "Certifies copies. The “true copy” stamp.",
      mania: "Goes to lunch. The time changes every day.",
      rules: ["We certify copies, not originals.", "Lunch is lunch.", "No ink, no stamp."],
    },
    "5": {
      role: "Cashier",
      takes: "Takes the fee, gives back the paid DARF.",
      mania: "Closes early and has no change.",
      rules: [
        "Amounts are written the way the form asks, not the way you'd like.",
        "We close when we close.",
        "No change. Not even for the exact amount.",
      ],
    },
  },
  goals: {
    signature: {
      title: "Get the signature on a declaration notarised",
      short: "Notarise a signature",
      goalDoc: "Signed declaration",
      stamp: "SIGNATURE NOTARISED",
      stampSub: "BY RESEMBLANCE",
      done: "Signature notarised.",
      body: "I declare, for all due purposes, that the purposes are due, and that I came to this office of my own free obligation, carrying every document required and two that nobody asked for.",
    },
    residence: {
      title: "Prove you live where you live",
      short: "Proof of address",
      goalDoc: "Electricity bill in the neighbour's name",
      stamp: "RESIDENCE CONFIRMED",
      stampSub: "AS FAR AS WE KNOW",
      done: "Residence confirmed.",
      body: "I declare that I live at the address I live at, and that, when I'm not home, I still live there, only further away.",
    },
    attorney: {
      title: "Draw up a power of attorney so the neighbour can collect a parcel",
      short: "Power of attorney",
      goalDoc: "Note from the neighbour",
      stamp: "POWER GRANTED",
      stampSub: "FOR ONE (1) PARCEL",
      done: "Power of attorney drawn up.",
      body: "I grant my neighbour full, general and unrestricted powers to collect one (1) parcel, small, cardboard, which may or may not be a blender.",
    },
    alive: {
      title: "Prove that you are alive",
      short: "Proof of life",
      goalDoc: "You, in person",
      stamp: "ALIVE",
      stampSub: "AS OF TODAY",
      done: "Life confirmed.",
      body: "I declare that I am alive, as attested by my presence, my queue ticket and the visible signs of impatience recorded by the staff.",
    },
    nothing: {
      title: "Get a certificate saying you owe nothing to anyone",
      short: "Clean record",
      goalDoc: "List of people you owe (empty)",
      stamp: "NOTHING ON RECORD",
      stampSub: "SO FAR",
      done: "Nothing on record.",
      body: "I declare that I owe nothing to anyone, except the time spent at this office, which no one will ever pay back.",
    },
    parking: {
      title: "Register the deed of a motorbike parking space",
      short: "Register a deed",
      goalDoc: "Purchase contract for the space",
      stamp: "REGISTERED",
      stampSub: "SPACE 47-B, BASEMENT",
      done: "Deed registered.",
      body: "I declare that I own one (1) motorbike parking space, 1.10 m by 2.00 m, and that I do not own a motorbike, which is a separate procedure.",
    },
  },
  stamps: {
    w1: "FILED",
    w2: "COPY",
    w4: "TRUE COPY",
    w5: "PAID",
    refused: "SENT BACK",
    jam: "JAMMED",
    sub: "NOTARY · 3RD OFFICE",
  },
  docs: {
    id: "ID card and CPF",
    protocol: "{doc}, with filing stamp",
    copy: "copy of {doc}",
    auth: "certified copy of {doc}",
    paid: "{doc}, stamped PAID",
  },
  forms: {
    f27b: {
      title: "FORM 27-B",
      subtitle: "Application to apply",
      trap: "Fill in by the box numbers, not top to bottom.",
      fields: {
        reversed: {
          label: "Full name, backwards",
          refusal: "Your name backwards. Letter by letter. From the end.",
        },
        name: {
          label: "Full name, no abbreviations",
          refusal: "The name on your ID, in full. All three parts.",
        },
        cpfEven: {
          label: "CPF (even digits only)",
          refusal: "Only the even digits of your CPF. The odd ones stay home.",
        },
      },
    },
    darf: {
      title: "DARF 0,37",
      subtitle: "Processing fee for processing",
      trap: "The amount must be written without its comma.",
      fields: {
        amount: {
          label: "Amount (no comma, no point)",
          refusal: "No comma. No point. We said so. In capitals, nearly.",
        },
        code: {
          label: "Revenue code (make one up)",
          refusal: "Make up a code. Any code. But make one up.",
        },
        cpf: { label: "Taxpayer's CPF, digits only", refusal: "Your CPF, just the digits. Yours." },
      },
    },
    gru: {
      title: "GRU 1,99",
      subtitle: "Collection slip for collecting",
      trap: "The amount must be written without its comma.",
      fields: {
        name: { label: "Payer's full name", refusal: "Your full name. As on your ID." },
        amount: {
          label: "Amount (digits only, no punctuation)",
          refusal: "Digits only. That comma cost you a trip.",
        },
        reason: {
          label: "Reason for payment (“because” is not a reason)",
          refusal: "“Because” is not a reason. At least two words, none of them “because”.",
        },
      },
    },
    annexU: {
      title: "ANNEX Ú",
      subtitle: "Declaration that there are no annexes",
      trap: "It is itself an annex.",
      fields: {
        which: {
          label: "Tick what applies",
          refusal: "This form is an annex. So there is this annex. Tick accordingly.",
        },
        pages: {
          label: "Pages in this annex",
          refusal: "Count the pages of this annex. You're holding it.",
        },
      },
      options: {
        none: "There are no annexes",
        this: "There is this annex",
        both: "Both of the above",
      },
    },
    copyOfCopy: {
      title: "COPY OF THE COPY",
      subtitle: "Request for a certified copy of a plain copy",
      trap: "It's a copy of a copy, not of the original.",
      fields: {
        copies: {
          label: "Number of copies (odd, more than 2)",
          refusal: "Odd. More than two. Pick again.",
        },
        copyOf: {
          label: "The copy is a copy of what?",
          refusal: "Read the title of the form. It's a copy of a copy.",
        },
      },
    },
    protocolOfProtocol: {
      title: "FILING OF FILING",
      subtitle: "Receipt that the filing was filed",
      trap: "The time must match the wall clock when you hand it in.",
      fields: {
        previous: { label: "Previous filing nº", refusal: "Don't touch what the cartório typed." },
        repeat: {
          label: "Repeat the previous filing nº",
          refusal: "Copy the number above. Exactly. Letter B included.",
        },
        time: {
          label: "Time (the wall clock's, when you hand this in)",
          refusal:
            "That's not the time on the wall clock. Look up, write it again, hand it in quickly.",
        },
      },
    },
    signatureCard: {
      title: "SIGNATURE CARD",
      subtitle: "Autograph card",
      trap: "Three signatures, all different from each other.",
      fields: {
        sig1: { label: "Signature 1", refusal: "Signature 1 is blank. You'd remember signing it." },
        sig2: {
          label: "Signature 2 (different)",
          refusal: "Signature 2 has to be different from signature 1.",
        },
        sig3: {
          label: "Signature 3 (different from both)",
          refusal:
            "Three signatures. Three. Different from each other. Like a real person who signs things.",
        },
      },
    },
    residence: {
      title: "DECLARATION OF RESIDENCE",
      subtitle: "I declare that I live where I live",
      trap: "The CEP goes backwards.",
      fields: {
        address: {
          label: "Street and number (as on your ID)",
          refusal: "Your address as on your ID. Street and number.",
        },
        cepReversed: {
          label: "CEP, backwards",
          refusal: "The CEP backwards. From the last digit to the first.",
        },
      },
    },
    proofOfLife: {
      title: "PROOF OF LIFE",
      subtitle: "Certificate that the applicant is alive",
      trap: "Birth date with the year first.",
      fields: {
        name: { label: "Full name", refusal: "Your full name, please." },
        alive: {
          label: "Are you alive? (tick one)",
          refusal: "One box. The one that's true. You're standing here.",
        },
        birth: {
          label: "Date of birth, year first (digits)",
          refusal: "Year, then month, then day. In that order. Only digits.",
        },
      },
      options: { yes: "Yes", no: "No", rather: "Prefer not to say" },
    },
    powerOfAttorney: {
      title: "POWER OF ATTORNEY",
      subtitle: "I authorise myself to represent me",
      trap: "The attorney is you.",
      fields: {
        grantor: {
          label: "Grantor (who grants the power)",
          refusal: "The grantor is you. Full name.",
        },
        grantee: {
          label: "Attorney (who represents the grantor, see subtitle)",
          refusal: "Read the subtitle. You represent yourself. Your own full name.",
        },
      },
    },
    negativeCertificate: {
      title: "NEGATIVE CERTIFICATE OF CERTIFICATE",
      subtitle: "Certifies that there is no certificate",
      trap: "The certificate number must stay blank.",
      fields: {
        name: { label: "Applicant's full name", refusal: "Your full name, as on your ID." },
        number: {
          label: "Certificate nº (there isn't one)",
          refusal: "There's no certificate. So there's no number. So the box stays empty.",
        },
      },
    },
    filiation: {
      title: "PARENTAGE RECORD",
      subtitle: "Mother's name, mother of the applicant",
      trap: "The second line is in block capitals.",
      fields: {
        mother: { label: "Mother's full name", refusal: "Your mother's name. It's on your ID." },
        motherUpper: {
          label: "Mother's full name IN BLOCK CAPITALS",
          refusal: "BLOCK CAPITALS. ALL OF IT.",
        },
      },
    },
    threeCopies: {
      title: "APPLICATION IN 3 COPIES",
      subtitle: "Single copy · copy 2 of 3",
      trap: "The header says which copy this is.",
      fields: {
        name: { label: "Full name", refusal: "Your full name." },
        which: {
          label: "Which copy is this? (see the header)",
          refusal: "It says in the header which copy this is. It isn't 1. Copy 1 doesn't exist.",
        },
      },
    },
    awareness: {
      title: "ACKNOWLEDGEMENT",
      subtitle: "I declare I have read what I have not read",
      trap: "The box must stay unticked.",
      fields: {
        initials: {
          label: "Initial here (initials of your full name)",
          refusal: "Your initials. All three. Capital letters are fine.",
        },
        agree: {
          label: "Do NOT tick the box below if you have read this",
          refusal: "You read it, so you shouldn't have ticked. Now you have to read it again.",
        },
      },
      options: { agree: "I have read and agree" },
    },
    absence: {
      title: "JUSTIFICATION OF ABSENCE",
      subtitle: "Why you didn't come yesterday",
      trap: "No word may contain the letter A.",
      fields: {
        name: { label: "Full name", refusal: "Your full name." },
        reason: {
          label: "Reason (3+ words, none with the letter A)",
          refusal: "There's an A in there. We found it. Three words, no A.",
        },
      },
    },
    update: {
      title: "RECORD UPDATE",
      subtitle: "To update what hasn't changed",
      trap: "The CPF needs its dots and dash.",
      fields: {
        cpf: {
          label: "CPF (with dots and dash, as on your ID)",
          refusal: "With the dots. And the dash. As printed. Punctuation is a document too.",
        },
        changed: {
          label: "What has changed?",
          refusal: "Nothing has changed. That's the point of the update.",
        },
      },
    },
    majority: {
      title: "DECLARATION OF ADULTHOOD",
      subtitle: "Proof of age, in cartório years",
      trap: "It asks for your age at your next birthday.",
      fields: {
        name: { label: "Full name", refusal: "Your full name." },
        age: {
          label: "Age you'll be on your next birthday",
          refusal: "Your next birthday. Not this one. Count from your date of birth.",
        },
      },
    },
    autograph: {
      title: "AUTOGRAPH CARD",
      subtitle: "Sign exactly as on your ID",
      trap: "The signature must match the one on your ID.",
      fields: {
        rg: { label: "RG, digits only", refusal: "Your RG number. Digits only." },
        signature: {
          label: "Signature (exactly as on your ID)",
          refusal: "That's not the signature on your ID. Look at it and sign like that.",
        },
      },
    },
    contact: {
      title: "CONTACT SHEET",
      subtitle: "So we can contact you (we won't)",
      trap: "It asks how many fields the form has.",
      fields: {
        name: { label: "Full name", refusal: "Your full name." },
        date: {
          label: "Today's date, in digits",
          refusal: "Today's date. Digits. The date on the ticket.",
        },
        count: {
          label: "How many fields does this form have, counting this one?",
          refusal: "Count the boxes. This one counts.",
        },
      },
    },
    notApplicable: {
      title: "SELF-DECLARATION",
      subtitle: "Tick only what does NOT apply",
      trap: "Tick what does not apply.",
      fields: {
        which: {
          label: "Tick only what does NOT apply to you",
          refusal: "Only what does NOT apply. You ticked something true.",
        },
      },
      options: {
        me: "I am myself",
        notMe: "I am not myself",
        here: "I am at this cartório",
        elsewhere: "I am at another cartório",
      },
    },
    justification: {
      title: "STATEMENT OF REASONS",
      subtitle: "Why you need what you need",
      trap: "“Because I need it” is not accepted.",
      fields: {
        date: { label: "Today's date, written out in digits", refusal: "Today's date, in digits." },
        reason: {
          label: "Reason (at least 3 words; don't write “because I need it”)",
          refusal: "“Because I need it” is not a reason. It says so right there.",
        },
      },
    },
  },
  lines: {
    called: ["{ticket}, {window}. Next!", "Ticket {ticket}? {window}. Come on, come on."],
    reveal: [
      "Right. I need {doc}. That's {route}.",
      "For this one, {doc}. Start at {route}. And come back here.",
      "Ah, and {doc}. {route}. I'd have told you before, but it wasn't your turn.",
    ],
    revealForm: [
      "I need {doc}. Here's the form. Read it carefully: {route}.",
      "Here, take this form. I need {doc}: {route}.",
    ],
    revealFormOnly: [
      "I need this form filled in. Here. Bring it back to me with everything else.",
      "Take this form. Fill it in. Read every box. Bring it back here.",
    ],
    stillMissing: ["Still missing {doc}. I told you.", "Not yet. {doc} is missing. Next!"],
    final: ["All here. I'll stamp it. Done.", "Everything in order. Very unusual. Stamping."],
    done: ["Here: {docs}. Next!", "Done. {docs}. Don't lose it."],
    notHere: ["Not here, sir. Check your folder.", "That's not for this window. Next!"],
    needInput: [
      "For {doc} I need {input} first.",
      "I can't do {doc} without {input}. Come back with it.",
    ],
    needCopyNotOriginal: [
      "We certify copies. That's the original. Make a copy at window 2, then come back.",
      "This is the original. I need the copy. Of the copy, if possible. Window 2.",
    ],
    fieldOrder: [
      "You filled it in reading order. The boxes are numbered. Box 1 comes first, even when it's lower down.",
    ],
    bluePen: [
      "Black pen? Here? Blue. Always blue. Start that form again.",
      "Not in blue. Window 1 doesn't read black ink.",
    ],
    jam: [
      "The machine jammed. Fourth copy. It always is. Take another ticket.",
      "Jammed. It'll be fine on the next ticket. Probably.",
    ],
    closed: ["{window} has closed for the day.", "{window}: closed. Come back tomorrow, or never."],
    skipped: [
      "The panel skipped your ticket at {window}. You're at the back now.",
      "Skipped. The system did it. You're last in line at {window}.",
    ],
    cartorioClosed: ["The cartório closed. Everyone out."],
  },
};

export default en;
export type LocaleDict = typeof en;
