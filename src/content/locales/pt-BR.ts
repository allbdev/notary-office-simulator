import type { LocaleDict } from "./en";

/** Português do Brasil. Mesmas chaves, {slots} e número de variantes que en.ts (há um teste). */
const ptBR: LocaleDict = {
  meta: {
    title: "Cartório Simulator",
    description:
      "Você só precisa de um carimbo. Um jogo diário e gratuito sobre conseguir carimbar um documento no cartório antes do almoço.",
  },
  common: {
    window: "Guichê {n}",
    windowShort: "G{n}",
    then: "depois",
    and: "e",
    languageToggle: "English",
    languageLabel: "Switch to English",
  },
  header: {
    clock: "relógio do cartório",
    yourTime: "seu tempo",
    ticket: "sua senha",
    challenge: "desafio",
    challengeValue: "nº {number} · {goal}",
    noTicket: "—",
  },
  landing: {
    kicker: "desafio diário",
    title: "Você só precisa de um carimbo.",
    subtitle: "Hoje vai dar pra conseguir. Provavelmente.",
    body: "Todo dia, uma burocracia nova, igual pra todo mundo. Descubra a ordem dos guichês, preencha o que mandarem e saia antes do almoço.",
    take: "Retirar senha",
    resume: "Voltar pra fila",
    seeResult: "Ver o resultado de hoje",
    how: "Como funciona",
    small: "3 a 5 minutos · sem cadastro · grátis · código aberto",
    office: "TABELIONATO · 3º OFÍCIO",
    yourTicket: "SUA SENHA",
    number: "Nº {number}",
    dateLine: "DESAFIO DE {date}",
    todayLine: "HOJE: {goal}",
    countLine: "{docs} documentos · 5 guichês",
    lunchLine: "1 fecha pro almoço",
    wait: "AGUARDE SER CHAMADO.",
    orNot: "OU NÃO.",
    streak: "Sequência: {n} dias",
    streakOne: "Sequência: 1 dia",
  },
  hall: {
    backToLine: "Voltar pra minha fila",
    label: "O saguão",
    open: "Aberto · fila de {n}",
    openEmpty: "Aberto · sem fila",
    lunch: "Almoço · volta em {time}",
    coffee: "Cafezinho · volta em {time}",
    closesIn: "Fecha em {time}",
    closed: "Encerrado por hoje",
    systemDown: "Sistema fora do ar",
    outOfInk: "Sem tinta · {time}",
    you: "Você: {ticket} · {n} na frente",
    youNext: "Você: {ticket} · é o próximo",
    panel: "Painel: chamando {ticket}",
    panelLabel: "SENHA",
    panelWindow: "GUICHÊ",
    boothClosed: "FECHADO",
    boothAway: "VOLTO JÁ",
    take: "Retirar senha para o {window}: {role}",
    lastMessage: "último recado",
    welcome: "“Firmas é no guichê 3. Retire a senha e aguarde ser chamado.”",
    paperOnly: "Papel não depende de sistema. Adiante o que der.",
  },
  folder: {
    title: "sua pasta · o que falta",
    brought: "você trouxe",
    more: "O guichê 3 diz uma coisa por vez. Pode ter mais.",
    hint: "Cada guichê só diz o próximo passo. O resto você descobre.",
    fill: "Preencher",
    view: "Ver",
    toFill: "a preencher",
    filled: "preenchido",
    deliveredTo: "no {window}",
    penLabel: "Caneta na mesa",
    blue: "azul",
    black: "preta",
    open: "Pasta",
    close: "Fechar pasta",
    idCard: "Carteira de identidade",
    idName: "Nome",
    idCpf: "CPF",
    idRg: "RG",
    idBirth: "Nascimento",
    idMother: "Mãe",
    idAddress: "Endereço",
    idCep: "CEP",
    idSignature: "Assinatura",
  },
  window: {
    openForm: "Ver o formulário",
    goTo: "Ir ao {window}",
    attendant: "atendente · {window}",
    hand: "Entregar o que tenho",
    back: "Voltar ao saguão",
    called: "{ticket}, {window}!",
    youHave: "você está levando",
    nothing: "Nada que sirva ainda.",
    missing: "ainda falta",
  },
  queue: {
    lookHall: "Olhar o saguão",
    inLine: "na fila do {window}",
    ahead: "{n} pessoas na sua frente.",
    aheadOne: "1 pessoa na sua frente.",
    next: "Você é o próximo.",
    explain:
      "O relógio do cartório anda 30 vezes mais rápido que o seu: cerca de {seconds} segundos por senha.",
    paused: "Este guichê não está chamando ninguém agora.",
    wait: "Esperar",
    leave: "Sair da fila (perde a vez)",
    meanwhile: "Preencha os formulários enquanto espera: abra a pasta.",
  },
  form: {
    office: "TABELIONATO DE NOTAS · 3º OFÍCIO",
    via: "via 2 de 3",
    viaNote: "(a via 1 não existe)",
    counter: "campo {i} de {n}",
    prev: "Campo anterior",
    next: "Próximo campo",
    rules: "regras de hoje neste guichê",
    tip: "A regra muda a cada formulário. Leia o rótulo: quem preenche no automático volta pro fim da fila.",
    tear: "Rasgar e recomeçar",
    close: "Guardar na pasta",
    stampSpace: "ESPAÇO RESERVADO AO CARIMBO",
    fineprint:
      "Rasuras invalidam este formulário e, por precaução, o anterior. Preencher em letra de forma legível ou ilegível, desde que de forma.",
    penWritten: "Preenchido com caneta {pen}.",
    penMismatch: "A caneta na mesa é {pen}. Este formulário foi começado com a outra.",
    goesTo: "Entregar no {window}.",
    goesToFinal: "Entregar no {window} junto com o resto.",
    tick: "Marcar",
    printed: "datilografado pelo cartório",
  },
  sentBack: {
    title: "devolvido pelo {window}",
    count: "voltas hoje",
    lost: "tempo até agora",
    ok: "Respirar fundo",
  },
  event: {
    systemDown: "SISTEMA FORA DO AR",
    backIn: "VOLTA EM {time} · O RELÓGIO NÃO PARA",
    drawn: "imprevisto · sorteado pela semente do dia",
    explain:
      "Nenhum guichê atende até o sistema voltar. Dá pra adiantar o que é só papel: preencher formulário não depende de sistema.",
    outOfInk: "O {window} ficou sem tinta de carimbo. Volta em {time}.",
  },
  result: {
    declaration: "DECLARAÇÃO",
    continue: "Ver o resultado",
    done: "desafio nº {number} · concluído",
    failed: "desafio nº {number} · hoje não",
    title: "Firma reconhecida.",
    failedTitle: "O cartório fechou.",
    failedBody: "Acontece. Acontece com todo mundo. Volte amanhã, com uma burocracia nova.",
    time: "tempo",
    forms: "formulários",
    sendBacks: "voltas",
    path: "seu caminho pelos guichês",
    legend: "verde: resolveu · amarelo: ouviu um recado · vermelho: voltou",
    copy: "Copiar resultado",
    copied: "Copiado. Cole onde a burocracia for apreciada.",
    copyFailed: "Não deu pra copiar. Selecione o texto acima.",
    ideal: "Ver o caminho ideal",
    hideIdeal: "Esconder o caminho ideal",
    idealTitle: "um caminho que o robô encontrou",
    idealTime: "{time} para um robô que nunca lê um rótulo errado",
    tomorrow: "Amanhã tem outro. O de hoje não abre de novo.",
    signedBy: "assinatura do declarante",
    share: "Cartório Simulator nº {number}",
    shareStats: "{time} · {forms} formulários · {back} voltas",
    shareFailed: "Não deu · {forms} formulários · {back} voltas",
  },
  how: {
    title: "Como funciona",
    p1: "Você chega com o RG e um documento. Precisa de um carimbo do guichê 3.",
    p2: "O guichê 3 nunca diz tudo o que falta de uma vez. A cada visita, conta mais uma coisa e entrega o formulário dela.",
    p3: "Retire a senha num guichê e espere ser chamado. Enquanto espera, preencha os formulários. Todo formulário tem uma pegadinha: leia cada rótulo.",
    p4: "Os guichês almoçam, fecham mais cedo e têm manias. O relógio do cartório anda 30 vezes mais rápido que o seu. A sua pontuação é o seu tempo real.",
    p5: "Quando tiver tudo, o guichê 3 carimba. Cole o seu resultado. Amanhã, uma burocracia nova, igual pra todo mundo.",
    close: "Entendi",
  },
  windows: {
    "1": {
      role: "Protocolo",
      takes: "Recebe formulário preenchido, devolve protocolo.",
      mania: "Só aceita o que está em caneta azul.",
      rules: [
        "Campo vazio volta. Campo certo demais também levanta suspeita.",
        "Caneta azul. Sempre azul.",
        "O carimbo final não é aqui.",
      ],
    },
    "2": {
      role: "Cópias",
      takes: "Tira cópia de qualquer coisa, inclusive de cópia.",
      mania: "A máquina trava a cada quarta cópia.",
      rules: [
        "Cópia sai como está, com erro e tudo.",
        "Se a máquina travar, pegue outra senha.",
        "Original não se devolve duas vezes.",
      ],
    },
    "3": {
      role: "Firmas",
      takes: "O carimbo final. Confere tudo.",
      mania: "Nunca diz tudo o que falta de uma vez.",
      rules: [
        "Uma exigência por visita. É a regra.",
        "Tudo junto, na última visita.",
        "Formulário entregue aqui é conferido aqui.",
      ],
    },
    "4": {
      role: "Autenticação",
      takes: "Autentica cópias. Carimbo “confere”.",
      mania: "Almoça. O horário muda todo dia.",
      rules: ["Autenticamos cópia, não original.", "Almoço é almoço.", "Sem tinta, sem carimbo."],
    },
    "5": {
      role: "Caixa",
      takes: "Recebe a taxa, devolve o comprovante.",
      mania: "Fecha mais cedo e não tem troco.",
      rules: [
        "Valor se escreve como o formulário pede, não como o senhor gosta.",
        "Fecha quando fecha.",
        "Não tem troco. Nem pro valor exato.",
      ],
    },
  },
  goals: {
    signature: {
      title: "Reconhecer firma de uma declaração",
      short: "Reconhecer firma",
      goalDoc: "Declaração assinada",
      stamp: "FIRMA RECONHECIDA",
      stampSub: "POR SEMELHANÇA",
      done: "Firma reconhecida.",
      body: "Declaro, para os devidos fins, que os fins são devidos, e que compareci a este tabelionato de livre e espontânea obrigação, munido de todos os documentos exigidos e de mais dois que ninguém pediu.",
    },
    residence: {
      title: "Provar que você mora onde mora",
      short: "Comprovar residência",
      goalDoc: "Conta de luz no nome do vizinho",
      stamp: "RESIDÊNCIA COMPROVADA",
      stampSub: "ATÉ ONDE SABEMOS",
      done: "Residência comprovada.",
      body: "Declaro que resido no endereço onde resido e que, quando não estou em casa, continuo residindo lá, só que mais longe.",
    },
    attorney: {
      title: "Lavrar procuração pro vizinho buscar uma encomenda",
      short: "Lavrar procuração",
      goalDoc: "Bilhete do vizinho",
      stamp: "PROCURAÇÃO LAVRADA",
      stampSub: "PARA UMA (1) ENCOMENDA",
      done: "Procuração lavrada.",
      body: "Outorgo ao meu vizinho amplos, gerais e irrestritos poderes para retirar uma (1) encomenda, pequena, de papelão, que pode ou não ser um liquidificador.",
    },
    alive: {
      title: "Provar que você está vivo",
      short: "Prova de vida",
      goalDoc: "Você, em pessoa",
      stamp: "VIVO",
      stampSub: "NA DATA DE HOJE",
      done: "Vida comprovada.",
      body: "Declaro que estou vivo, conforme atestam minha presença, minha senha e os sinais visíveis de impaciência registrados pelos atendentes.",
    },
    nothing: {
      title: "Tirar certidão de que não deve nada a ninguém",
      short: "Nada consta",
      goalDoc: "Lista de quem você deve (vazia)",
      stamp: "NADA CONSTA",
      stampSub: "ATÉ O MOMENTO",
      done: "Nada consta.",
      body: "Declaro que nada devo a ninguém, exceto o tempo passado neste cartório, que ninguém nunca vai me devolver.",
    },
    parking: {
      title: "Registrar a escritura de uma vaga de moto",
      short: "Registrar escritura",
      goalDoc: "Contrato de compra da vaga",
      stamp: "REGISTRADO",
      stampSub: "VAGA 47-B, SUBSOLO",
      done: "Escritura registrada.",
      body: "Declaro ser proprietário de uma (1) vaga de moto, de 1,10 m por 2,00 m, e que não possuo moto, o que é outro procedimento.",
    },
  },
  stamps: {
    w1: "PROTOCOLADO",
    w2: "CÓPIA",
    w4: "CONFERE",
    w5: "PAGO",
    refused: "INDEFERIDO",
    jam: "TRAVOU",
    sub: "TABELIONATO · 3º OFÍCIO",
  },
  docs: {
    id: "RG e CPF",
    protocol: "{doc}, com carimbo de protocolo",
    copy: "cópia de {doc}",
    auth: "cópia autenticada de {doc}",
    paid: "{doc}, com carimbo de PAGO",
  },
  forms: {
    f27b: {
      title: "FORMULÁRIO 27-B",
      subtitle: "Requerimento para requerer",
      trap: "Preencha pela numeração dos campos, não de cima pra baixo.",
      fields: {
        reversed: {
          label: "Nome completo, de trás pra frente",
          refusal: "Seu nome ao contrário. Letra por letra. Do fim pro começo.",
        },
        name: {
          label: "Nome completo, sem abreviar",
          refusal: "O nome do RG, inteiro. As três partes.",
        },
        cpfEven: {
          label: "CPF (só os dígitos pares)",
          refusal: "Só os dígitos pares do CPF. Os ímpares ficam em casa.",
        },
      },
    },
    darf: {
      title: "DARF 0,37",
      subtitle: "Taxa de expediente do expediente",
      trap: "O valor tem que ser escrito sem a vírgula.",
      fields: {
        amount: {
          label: "Valor (não use vírgula nem ponto)",
          refusal: "Sem vírgula. Sem ponto. Está escrito. Quase em maiúsculas.",
        },
        code: {
          label: "Código da receita (invente, só números)",
          refusal: "Invente um código. Só números, pelo menos quatro. Criatividade tem regra.",
        },
        cpf: {
          label: "CPF do contribuinte, só números",
          refusal: "O seu CPF, só os números. O seu.",
        },
      },
    },
    gru: {
      title: "GRU 1,99",
      subtitle: "Guia de recolhimento do recolhimento",
      trap: "O valor tem que ser escrito sem a vírgula.",
      fields: {
        name: { label: "Nome completo do pagador", refusal: "Seu nome completo. Como no RG." },
        amount: {
          label: "Valor (só números, sem pontuação)",
          refusal: "Só números. Essa vírgula custou uma volta.",
        },
        reason: {
          label: "Motivo do pagamento (“porque sim” não é motivo)",
          refusal: "“Porque sim” não é motivo. Pelo menos duas palavras, sem “porque sim”.",
        },
      },
    },
    annexU: {
      title: "ANEXO Ú",
      subtitle: "Declaração de que não há anexos",
      trap: "Ele mesmo é um anexo.",
      fields: {
        which: {
          label: "Assinale o que se aplica",
          refusal: "Este formulário é um anexo. Então há este anexo. Assinale de acordo.",
        },
        pages: {
          label: "Páginas deste anexo",
          refusal: "Conte as páginas deste anexo. Está na sua mão.",
        },
      },
      options: { none: "Não há anexos", this: "Há este anexo", both: "Ambas as anteriores" },
    },
    copyOfCopy: {
      title: "CÓPIA DA CÓPIA",
      subtitle: "Requisição de cópia autenticada de cópia simples",
      trap: "É cópia de cópia, não do original.",
      fields: {
        copies: {
          label: "Nº de vias (ímpar, maior que 2)",
          refusal: "Ímpar. Maior que dois. Escolha de novo.",
        },
        copyOf: {
          label: "A cópia é cópia de quê?",
          refusal: "Leia o título do formulário. É cópia de cópia.",
        },
      },
    },
    protocolOfProtocol: {
      title: "PROTOCOLO DE PROTOCOLO",
      subtitle: "Comprovante de que o protocolo foi protocolado",
      trap: "A hora tem que ser a do relógio da parede na hora de entregar.",
      fields: {
        previous: {
          label: "Nº do protocolo anterior",
          refusal: "Não mexa no que o cartório datilografou.",
        },
        repeat: {
          label: "Repita o nº do protocolo anterior",
          refusal: "Copie o número de cima. Igualzinho. Com a letra B.",
        },
        time: {
          label: "Hora (a do relógio da parede, na entrega)",
          refusal:
            "Essa não é a hora do relógio da parede. Olhe pra cima, escreva de novo e entregue rápido.",
        },
      },
    },
    signatureCard: {
      title: "FICHA DE FIRMA",
      subtitle: "Cartão de autógrafo",
      trap: "Três assinaturas, todas diferentes entre si.",
      fields: {
        sig1: {
          label: "Assinatura 1",
          refusal: "A assinatura 1 está em branco. O senhor lembraria de ter assinado.",
        },
        sig2: {
          label: "Assinatura 2 (diferente)",
          refusal: "A assinatura 2 tem que ser diferente da 1.",
        },
        sig3: {
          label: "Assinatura 3 (diferente das duas)",
          refusal:
            "Três assinaturas. Três. Diferentes entre si. Como uma pessoa de verdade que assina coisas.",
        },
      },
    },
    residence: {
      title: "DECLARAÇÃO DE RESIDÊNCIA",
      subtitle: "Declaro que moro onde moro",
      trap: "O CEP vai de trás pra frente.",
      fields: {
        address: {
          label: "Rua e número (como no RG)",
          refusal: "Seu endereço como no RG. Rua e número.",
        },
        cepReversed: {
          label: "CEP, de trás pra frente",
          refusal: "O CEP ao contrário. Do último dígito pro primeiro.",
        },
      },
    },
    proofOfLife: {
      title: "PROVA DE VIDA",
      subtitle: "Atestado de que o requerente está vivo",
      trap: "Data de nascimento com o ano primeiro.",
      fields: {
        name: { label: "Nome completo", refusal: "Seu nome completo, por favor." },
        alive: {
          label: "Está vivo? (marque uma)",
          refusal: "Uma opção. A verdadeira. O senhor está aqui em pé.",
        },
        birth: {
          label: "Data de nascimento, ano primeiro (só números)",
          refusal: "Ano, depois mês, depois dia. Nessa ordem. Só números.",
        },
      },
      options: { yes: "Sim", no: "Não", rather: "Prefiro não informar" },
    },
    powerOfAttorney: {
      title: "PROCURAÇÃO",
      subtitle: "Autorizo a mim mesmo a me representar",
      trap: "O procurador é você.",
      fields: {
        grantor: {
          label: "Outorgante (quem dá os poderes)",
          refusal: "O outorgante é o senhor. Nome completo.",
        },
        grantee: {
          label: "Outorgado (quem representa o outorgante, ver subtítulo)",
          refusal: "Leia o subtítulo. O senhor se representa. Seu próprio nome completo.",
        },
      },
    },
    negativeCertificate: {
      title: "CERTIDÃO NEGATIVA DE CERTIDÃO",
      subtitle: "Atesta que não há certidão",
      trap: "O número da certidão tem que ficar em branco.",
      fields: {
        name: { label: "Nome completo do requerente", refusal: "Seu nome completo, como no RG." },
        number: {
          label: "Nº da certidão (não há)",
          refusal: "Não há certidão. Então não há número. Então o campo fica vazio.",
        },
      },
    },
    filiation: {
      title: "CADASTRO DE FILIAÇÃO",
      subtitle: "Nome da mãe, mãe do requerente",
      trap: "A segunda linha é em letra de forma maiúscula.",
      fields: {
        mother: { label: "Nome completo da mãe", refusal: "O nome da sua mãe. Está no RG." },
        motherUpper: {
          label: "Nome completo da mãe EM LETRA DE FORMA",
          refusal: "LETRA DE FORMA. TUDO MAIÚSCULO.",
        },
      },
    },
    threeCopies: {
      title: "REQUERIMENTO EM 3 VIAS",
      subtitle: "Via única · via 2 de 3",
      trap: "O cabeçalho diz qual via é esta.",
      fields: {
        name: { label: "Nome completo", refusal: "Seu nome completo." },
        which: {
          label: "Qual via é esta? (ver cabeçalho)",
          refusal: "Está no cabeçalho qual via é esta. Não é a 1. A via 1 não existe.",
        },
      },
    },
    awareness: {
      title: "TERMO DE CIÊNCIA",
      subtitle: "Declaro que li o que não li",
      trap: "A caixa tem que ficar sem marcar.",
      fields: {
        initials: {
          label: "Rubrique aqui (iniciais do nome completo)",
          refusal: "Suas iniciais. As três. Pode ser maiúscula.",
        },
        agree: {
          label: "NÃO marque a caixa abaixo se leu isto",
          refusal: "O senhor leu, então não devia ter marcado. Agora vai ter que ler de novo.",
        },
      },
      options: { agree: "Li e concordo" },
    },
    absence: {
      title: "JUSTIFICATIVA DE AUSÊNCIA",
      subtitle: "Por que o senhor não veio ontem",
      trap: "Nenhuma palavra pode ter a letra A.",
      fields: {
        name: { label: "Nome completo", refusal: "Seu nome completo." },
        reason: {
          label: "Motivo (3+ palavras, nenhuma com a letra A)",
          refusal: "Tem um A aí. A gente achou. Três palavras, sem A.",
        },
      },
    },
    update: {
      title: "ATUALIZAÇÃO CADASTRAL",
      subtitle: "Para atualizar o que não mudou",
      trap: "O CPF precisa dos pontos e do hífen.",
      fields: {
        cpf: {
          label: "CPF (com pontos e hífen, como no RG)",
          refusal: "Com os pontos. E o hífen. Como está impresso. Pontuação também é documento.",
        },
        changed: { label: "O que mudou?", refusal: "Nada mudou. É esse o sentido da atualização." },
      },
    },
    majority: {
      title: "DECLARAÇÃO DE MAIORIDADE",
      subtitle: "Comprovante de idade em anos de cartório",
      trap: "Pede a idade que você vai fazer no próximo aniversário.",
      fields: {
        name: { label: "Nome completo", refusal: "Seu nome completo." },
        age: {
          label: "Idade que fará no próximo aniversário",
          refusal: "O próximo aniversário. Não este. Conte a partir da data de nascimento.",
        },
      },
    },
    autograph: {
      title: "CARTÃO DE AUTÓGRAFO",
      subtitle: "Assine igualzinho ao RG",
      trap: "A assinatura tem que ser igual à do RG.",
      fields: {
        rg: { label: "RG, só números", refusal: "O número do seu RG. Só números." },
        signature: {
          label: "Assinatura (igual à do RG)",
          refusal: "Essa não é a assinatura do RG. Olhe lá e assine assim.",
        },
      },
    },
    contact: {
      title: "FICHA DE CONTATO",
      subtitle: "Para entrarmos em contato (não entraremos)",
      trap: "Pergunta quantos campos o formulário tem.",
      fields: {
        name: { label: "Nome completo", refusal: "Seu nome completo." },
        date: {
          label: "Data de hoje, em números",
          refusal: "A data de hoje. Em números. A que está na senha.",
        },
        count: {
          label: "Quantos campos tem este formulário, contando este?",
          refusal: "Conte os campos. Este conta.",
        },
      },
    },
    notApplicable: {
      title: "AUTODECLARAÇÃO",
      subtitle: "Assinale apenas o que NÃO se aplica",
      trap: "Assinale o que não se aplica.",
      fields: {
        which: {
          label: "Assinale apenas o que NÃO se aplica ao senhor",
          refusal: "Só o que NÃO se aplica. O senhor marcou uma coisa verdadeira.",
        },
      },
      options: {
        me: "Sou eu mesmo",
        notMe: "Não sou eu mesmo",
        here: "Estou neste cartório",
        elsewhere: "Estou em outro cartório",
      },
    },
    justification: {
      title: "JUSTIFICATIVA DO REQUERIMENTO",
      subtitle: "Por que o senhor precisa do que precisa",
      trap: "“Porque precisa” não é aceito.",
      fields: {
        date: {
          label: "Data de hoje, por extenso, em algarismos",
          refusal: "A data de hoje, em algarismos.",
        },
        reason: {
          label: "Motivo (pelo menos 3 palavras; não escreva “porque precisa”)",
          refusal: "“Porque precisa” não é motivo. Está escrito aí.",
        },
      },
    },
  },
  lines: {
    called: ["{ticket}, {window}. Próximo!", "Senha {ticket}? {window}. Vamos, vamos."],
    reveal: [
      "Certo. Preciso de {doc}. É {route}.",
      "Pra isso, {doc}. Começa no {route}. E volta aqui.",
      "Ah, e {doc}. {route}. Eu teria dito antes, mas não era a sua vez.",
    ],
    revealForm: [
      "Preciso de {doc}. Toma o formulário. Leia com calma: {route}.",
      "Aqui, pega este formulário. Preciso de {doc}: {route}.",
    ],
    revealFormOnly: [
      "Preciso deste formulário preenchido. Toma. Traz de volta junto com o resto.",
      "Pega este formulário. Preenche. Lê cada campo. Traz aqui de novo.",
    ],
    stillMissing: ["Ainda falta {doc}. Eu avisei.", "Ainda não. Falta {doc}. Próximo!"],
    final: ["Tudo aqui. Vou carimbar. Pronto.", "Tudo em ordem. Muito incomum. Carimbando."],
    done: ["Pronto: {docs}. Próximo!", "Feito. {docs}. Não vai perder."],
    notHere: ["Não é aqui, senhor. Confira a pasta.", "Isso não é deste guichê. Próximo!"],
    needInput: [
      "Pra {doc} eu preciso antes de {input}.",
      "Não faço {doc} sem {input}. Volta com isso.",
    ],
    needCopyNotOriginal: [
      "Autenticamos cópia. Isso é o original. Tira cópia no guichê 2 e volta.",
      "Isto é o original. Preciso da cópia. Da cópia, de preferência. Guichê 2.",
    ],
    fieldOrder: [
      "O senhor preencheu na ordem de leitura. Os campos são numerados. O 1 vem primeiro, mesmo estando embaixo.",
    ],
    bluePen: [
      "Caneta preta? Aqui? Azul. Sempre azul. Refaça esse formulário.",
      "Não está em azul. O guichê 1 não lê tinta preta.",
    ],
    jam: [
      "A máquina travou. Quarta cópia. Sempre é. Pega outra senha.",
      "Travou. Na próxima senha vai. Provavelmente.",
    ],
    closed: ["O {window} encerrou por hoje.", "{window}: encerrado. Volte amanhã, ou nunca."],
    skipped: [
      "O painel pulou a sua senha no {window}. Agora o senhor é o último.",
      "Pulou. Foi o sistema. O senhor é o último da fila do {window}.",
    ],
    cartorioClosed: ["O cartório fechou. Todo mundo pra fora."],
  },
};

export default ptBR;
