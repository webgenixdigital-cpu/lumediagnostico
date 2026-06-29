/**
 * LUME OS — Diagnostic Engine
 * Diagnóstico OPERA™ v2.0 — Final
 * IEE™ opera internamente. O usuário vê apenas seu Nível de Evolução.
 */

'use strict';

window.LUME = window.LUME || {};

LUME.Diagnostic = {

  _state: {
    identification:  null,
    answers:         {},
    currentQuestion: 0,
    scores:          null,
    result:          null,
    startedAt:       null,
    completedAt:     null,
    version:         '2.0.0',
  },

  _pilares: [
    { key:'O', name:'Organização',    desc:'Clareza, prioridades e objetivos' },
    { key:'P', name:'Processos',      desc:'Repetibilidade e redução de improvisos' },
    { key:'E', name:'Estrutura',      desc:'Ferramentas e organização operacional' },
    { key:'R', name:'Relacionamento', desc:'Experiência do cliente e comunicação' },
    { key:'A', name:'Acompanhamento', desc:'Indicadores e tomada de decisão' },
  ],

  _pilarMessages: {
    O: { title:'Organização',    msg:'Vamos entender como sua empresa está organizada e se as prioridades estão claras.' },
    P: { title:'Processos',      msg:'Agora vamos avaliar se as atividades do dia a dia seguem um padrão definido.' },
    E: { title:'Estrutura',      msg:'Vamos conhecer as ferramentas e a base operacional que sustenta seu negócio.' },
    R: { title:'Relacionamento', msg:'Como sua empresa constrói e mantém relacionamentos com os clientes?' },
    A: { title:'Acompanhamento', msg:'Como você acompanha os resultados e toma decisões baseadas em dados?' },
  },

  _scale: [
    { value:1, label:'Nunca' },
    { value:2, label:'Raramente' },
    { value:3, label:'Às vezes' },
    { value:4, label:'Frequentemente' },
    { value:5, label:'Sempre' },
  ],

  _questions: [
    { pilar:0, text:'Tenho clareza sobre as prioridades atuais da minha empresa.' },
    { pilar:0, text:'Sei exatamente quais atividades geram mais impacto no meu negócio.' },
    { pilar:0, text:'Possuo objetivos definidos para os próximos meses.' },
    { pilar:0, text:'Minha rotina de trabalho é organizada e previsível.' },
    { pilar:1, text:'As atividades mais importantes da empresa seguem um padrão definido.' },
    { pilar:1, text:'Os erros recorrentes são identificados e corrigidos.' },
    { pilar:1, text:'Minha equipe sabe como executar as atividades principais.' },
    { pilar:1, text:'Existem poucos retrabalhos no dia a dia.' },
    { pilar:2, text:'As informações importantes da empresa são facilmente encontradas.' },
    { pilar:2, text:'Utilizo ferramentas adequadas para apoiar minha gestão.' },
    { pilar:2, text:'Minha rotina administrativa está organizada.' },
    { pilar:2, text:'Os recursos da empresa estão estruturados para sustentar o crescimento.' },
    { pilar:3, text:'Meus clientes recebem respostas rápidas e claras.' },
    { pilar:3, text:'Existe um processo consistente de atendimento.' },
    { pilar:3, text:'Realizo ações de relacionamento após o atendimento.' },
    { pilar:3, text:'Recebo feedbacks positivos com frequência.' },
    { pilar:4, text:'Acompanho regularmente os indicadores do meu negócio.' },
    { pilar:4, text:'Reservo tempo para revisar resultados e decisões.' },
    { pilar:4, text:'Consigo identificar rapidamente problemas na operação.' },
    { pilar:4, text:'Possuo metas e planos definidos para os próximos 90 dias.' },
  ],

  /* ═══════════════════════════════════════════════════════════
     NÍVEIS DE EVOLUÇÃO
     IEE™ opera internamente — o empresário vê o nome do nível.
     Range real: 20–100 (instrumento com 20 questões, escala 1-5)
  ═══════════════════════════════════════════════════════════ */
  _ieeBands: [
    {
      min:20, max:40,
      level:'Gestão Inicial',
      icon:'🌱',
      color:'#92400E',
      /* Interno */
      _label:'Fundação',
      description:'Sua empresa está na fase de estruturação da base. A gestão ainda é muito centralizada na sua presença, e há poucas rotinas definidas. Este é o momento de construir os alicerces.',
      interpretation:'Com os ajustes certos, empresas neste estágio evoluem rapidamente. O potencial de transformação é enorme — e as ações mais simples geram os maiores resultados.',
      nextObjective:'Seu próximo passo é construir a base operacional do negócio: clareza de prioridades, uma rotina mínima documentada e processos básicos que funcionem sem a sua presença constante.',
      nextAssessment:'Recomendamos uma nova avaliação em 30 a 45 dias, após implementar as primeiras ações do plano.',
      evolutionPlan:[
        'Listar as 5 prioridades mais importantes do negócio e revisá-las toda semana',
        'Documentar o passo a passo do processo de atendimento ao cliente',
        'Criar uma rotina semanal com blocos de tempo definidos para cada área',
        'Organizar todos os documentos da empresa em uma pasta digital única',
        'Definir 3 indicadores simples para acompanhar mensalmente',
      ],
    },
    {
      min:41, max:60,
      level:'Organização em Construção',
      icon:'🧱',
      color:'#B45309',
      _label:'Organização Inicial',
      description:'Sua empresa já demonstra iniciativas positivas. Há esforço real de organização, mas a execução ainda é irregular. O desafio é transformar boas intenções em sistemas consistentes.',
      interpretation:'Você está no estágio de maior alavancagem: com foco e método, as mudanças agora geram impacto visível em poucos meses. O que você precisa é de consistência — não de grandiosidade.',
      nextObjective:'Seu próximo passo é consolidar o que já funciona e eliminar as inconsistências que consomem energia. Transformar iniciativas isoladas em rotinas que se repetem independentemente da sua presença.',
      nextAssessment:'Recomendamos uma nova avaliação em 45 a 60 dias, para medir o impacto das primeiras mudanças.',
      evolutionPlan:[
        'Padronizar o processo de atendimento com um checklist simples',
        'Organizar a agenda semanal com blocos fixos para cada prioridade',
        'Separar definitivamente as finanças pessoais das empresariais',
        'Implantar uma ferramenta de agendamento e controle básico',
        'Agendar uma revisão mensal de 1 hora para analisar os resultados',
      ],
    },
    {
      min:61, max:75,
      level:'Gestão em Desenvolvimento',
      icon:'⚙️',
      color:'#C89B3C',
      _label:'Gestão em Desenvolvimento',
      description:'Sua empresa já opera com processos definidos e clareza de direção. Há evolução real e consistente. O próximo salto vem da padronização do que já funciona e de um acompanhamento mais estruturado.',
      interpretation:'Você construiu uma base sólida. Agora é hora de refinar — aumentar a repetibilidade, medir com mais precisão e preparar a empresa para crescer de forma mais previsível.',
      nextObjective:'Seu próximo passo é aumentar a consistência dos processos que já existem e criar uma rotina de acompanhamento de resultados que informe suas decisões com dados reais.',
      nextAssessment:'Recomendamos uma nova avaliação em 60 a 75 dias, após consolidar as melhorias nos pilares mais fracos.',
      evolutionPlan:[
        'Criar um padrão de comunicação com clientes para cada etapa do atendimento',
        'Implementar uma revisão semanal de resultados de 30 minutos',
        'Documentar os processos mais críticos com passo a passo e checklist',
        'Definir metas mensais claras para cada área do negócio',
        'Agendar um momento mensal para comparar resultado real com a meta',
      ],
    },
    {
      min:76, max:88,
      level:'Gestão Estruturada',
      icon:'📈',
      color:'#2A5247',
      _label:'Gestão Estruturada',
      description:'Sua empresa tem uma gestão organizada, com processos definidos e previsibilidade nos resultados. Você opera acima da média — o próximo desafio é a escala e a melhoria contínua.',
      interpretation:'Com esta base, você tem condições de crescer sem aumentar proporcionalmente o caos. O foco agora é refinar os pontos mais fracos e preparar a empresa para um novo ciclo de expansão.',
      nextObjective:'Seu próximo passo é fortalecer os pilares com menor maturidade e criar sistemas que permitam crescer de forma organizada, com qualidade e sem perder a previsibilidade que você já construiu.',
      nextAssessment:'Recomendamos uma nova avaliação em 75 a 90 dias, para verificar a evolução dos pilares em desenvolvimento.',
      evolutionPlan:[
        'Revisar e otimizar os processos mais críticos para eliminar gargalos',
        'Criar um programa simples de fidelização e pós-atendimento',
        'Definir um dashboard básico com os 5 indicadores mais importantes',
        'Treinar a equipe nos processos documentados e avaliar desempenho',
        'Planejar a próxima fase de crescimento com base nos dados atuais',
      ],
    },
    {
      min:89, max:100,
      level:'Excelência Operacional',
      icon:'🏆',
      color:'#1F3D34',
      _label:'Excelência Operacional',
      description:'Sua empresa atingiu o mais alto nível de maturidade do Método OPERA™. Processos consistentes, gestão organizada e capacidade real de crescimento sustentável.',
      interpretation:'Você está entre os negócios mais maduros do programa. A base está construída. O desafio agora é manter a consistência enquanto expande e identifica novos ciclos de crescimento.',
      nextObjective:'Seu próximo passo é identificar novas alavancas de crescimento — novos canais, novos mercados ou aprofundamento nos clientes atuais — mantendo a consistência operacional que você já conquistou.',
      nextAssessment:'Recomendamos uma avaliação de manutenção a cada 90 dias para monitorar a evolução e identificar novas oportunidades.',
      evolutionPlan:[
        'Mapear oportunidades de expansão: novos serviços ou novos mercados',
        'Implementar um programa estruturado de indicadores e metas trimestrais',
        'Desenvolver a equipe para maior autonomia e liderança operacional',
        'Criar um programa de fidelização e indicação de clientes',
        'Planejar a próxima fase de escalabilidade do negócio',
      ],
    },
  ],

  /* ── Interpretação por pilar ── */
  _pilarInterpretations: {
    O: [
      { max:8,  text:'Sua empresa ainda não tem um norte claro. As prioridades mudam com frequência e grande parte da energia vai para resolver urgências. Sem direção definida, o esforço aumenta e os resultados ficam inconsistentes.' },
      { max:12, text:'Existe algum senso de direção, mas a consistência ainda falta. Os objetivos nem sempre se traduzem em ações concretas. O negócio avança em ritmo irregular, alternando dias produtivos com dias reativos.' },
      { max:16, text:'Sua empresa já tem boa clareza de objetivos e uma rotina razoavelmente organizada. Com ajustes na definição de prioridades, o crescimento pode se tornar mais previsível e menos desgastante.' },
      { max:20, text:'Organização é um dos seus maiores ativos. Você tem clareza de prioridades, objetivos definidos e uma rotina produtiva — uma base sólida que torna o crescimento mais previsível.' },
    ],
    P: [
      { max:8,  text:'Sua empresa ainda depende muito das pessoas e pouco de processos definidos. Cada situação é resolvida de forma diferente, gerando retrabalho e inconsistências. Crescer nesse cenário tende a ampliar o caos.' },
      { max:12, text:'Alguns processos existem, mas a variação na execução ainda é alta. Enquanto os padrões não estiverem definidos, o crescimento terá um teto natural — tudo ainda passa por você.' },
      { max:16, text:'Seus processos estão razoavelmente consolidados. Há espaço para aumentar a repetibilidade e reduzir as variações que consomem tempo e energia da equipe.' },
      { max:20, text:'Processos bem definidos e executados com consistência são um diferencial real. Sua empresa pode crescer sem depender exclusivamente de você em cada decisão.' },
    ],
    E: [
      { max:8,  text:'A estrutura operacional ainda é frágil. Faltam ferramentas adequadas e as informações não estão organizadas para suportar crescimento. Construir sobre essa base é arriscado.' },
      { max:12, text:'Você tem algumas ferramentas, mas a organização operacional precisa evoluir. A estrutura atual pode se tornar um gargalo à medida que o negócio tenta crescer.' },
      { max:16, text:'Boa estrutura operacional com espaço para melhorias. Algumas ferramentas e rotinas podem ser aprimoradas para suportar uma operação mais robusta.' },
      { max:20, text:'Sua estrutura operacional é um ponto de força. Informações acessíveis, ferramentas certas e recursos organizados criam a base para crescer sem perder eficiência.' },
    ],
    R: [
      { max:8,  text:'O relacionamento com clientes ainda acontece de forma reativa. Não há processo consistente de atendimento ou fidelização, o que limita a retenção e dificulta o crescimento por indicação.' },
      { max:12, text:'Existe esforço no relacionamento, mas a consistência falta. A experiência do cliente varia dependendo do momento — o que impacta percepção de valor e retenção.' },
      { max:16, text:'Bom relacionamento com clientes, com processo razoavelmente definido. Há oportunidade de transformar clientes satisfeitos em promotores ativos da marca.' },
      { max:20, text:'Relacionamento é um dos seus maiores diferenciais. Atendimento consistente e processo de fidelização ativo geram o ciclo de crescimento mais saudável possível.' },
    ],
    A: [
      { max:8,  text:'Seu negócio opera em modo reativo, sem acompanhamento regular de resultados. As decisões são tomadas por intuição ou urgência — o que aumenta o risco operacional.' },
      { max:12, text:'Existe algum acompanhamento, mas não é frequente nem estruturado. As decisões ainda têm pouco respaldo em dados concretos.' },
      { max:16, text:'Você acompanha resultados com razoável frequência. Com indicadores mais bem definidos e revisões periódicas, suas decisões podem ser mais precisas e o crescimento mais intencional.' },
      { max:20, text:'Acompanhamento é um dos seus pontos fortes. Indicadores claros, revisões regulares e decisões baseadas em dados — uma vantagem real na gestão do negócio.' },
    ],
  },

  _initialRecommendations: {
    O: 'Comece esta semana definindo por escrito as suas 3 prioridades mais importantes para os próximos 90 dias. Coloque no papel, compartilhe com sua equipe e revise toda segunda-feira.',
    P: 'Escolha o processo mais crítico do negócio e documente o passo a passo. Crie um checklist simples e teste com sua equipe por 30 dias.',
    E: 'Dedique um dia para organizar sua estrutura digital e separar definitivamente as finanças pessoais das empresariais.',
    R: 'Implemente um fluxo de pós-atendimento: envie uma mensagem personalizada 24 horas após cada atendimento.',
    A: 'Defina os 3 indicadores que você vai acompanhar semanalmente e reserve 1 hora toda semana para analisá-los.',
  },

  _firstSteps: {
    O: ['Definir por escrito as 5 prioridades de maior impacto no negócio.','Escrever as 3 metas principais para os próximos 90 dias.','Criar uma rotina semanal com blocos de tempo protegidos.'],
    P: ['Documentar o passo a passo do atendimento padrão ao cliente.','Criar um checklist de abertura e fechamento do dia.','Mapear os 3 processos que mais geram retrabalho e propor ajustes.'],
    E: ['Centralizar documentos, senhas e arquivos em uma pasta digital única.','Separar definitivamente conta bancária pessoal da empresarial.','Implantar uma ferramenta de agendamento digital.'],
    R: ['Criar uma mensagem de boas-vindas padrão para novos clientes.','Implantar uma pesquisa de satisfação após cada atendimento.','Solicitar avaliações no Google para os 10 clientes mais fiéis.'],
    A: ['Definir 3 indicadores para acompanhar semanalmente.','Reservar 1 hora toda semana para analisar os resultados.','Comparar o resultado real com as metas definidas mensalmente.'],
  },

  /* ── API ── */
  init()        { this._restoreState(); },
  setIdentification(d) { this._state.identification=Object.assign({},d); if(!this._state.startedAt) this._state.startedAt=new Date().toISOString(); this._persist(); },
  getIdentification()  { return this._state.identification; },
  answerQuestion(i,v)  { this._state.answers[i]=v; this._persist(); },
  getAnswer(i)         { return this._state.answers[i]||null; },
  getCurrentQuestion() { return this._state.currentQuestion; },
  setCurrentQuestion(i){ this._state.currentQuestion=i; this._persist(); },
  getQuestion(i)       { return this._questions[i]||null; },
  getTotalQuestions()  { return this._questions.length; },
  getPilares()         { return this._pilares; },
  getScale()           { return this._scale; },
  getPilarMessage(key) { return this._pilarMessages[key]||null; },
  getPilarForQuestion(i){ var q=this._questions[i]; return q?this._pilares[q.pilar]:null; },

  getIEEBand(iee) {
    return this._ieeBands.find(function(b){ return iee>=b.min && iee<=b.max; }) || this._ieeBands[0];
  },

  getNextLevel(iee) {
    var bands = this._ieeBands;
    var idx   = bands.findIndex(function(b){ return iee>=b.min && iee<=b.max; });
    if (idx === -1 || idx === bands.length-1) return null;
    var next = bands[idx+1];
    return { band:next, pointsNeeded: next.min - iee };
  },

  getPilarInterpretation(key, score) {
    var arr = this._pilarInterpretations[key]||[];
    return (arr.find(function(t){ return score<=t.max; })||arr[arr.length-1]||{}).text||'';
  },

  getFirstSteps(key)            { return this._firstSteps[key]||[]; },
  getInitialRecommendation(key) { return this._initialRecommendations[key]||''; },

  getCompletionTime() {
    if (!this._state.startedAt||!this._state.completedAt) return null;
    var ms=new Date(this._state.completedAt)-new Date(this._state.startedAt);
    var min=Math.floor(ms/60000), sec=Math.floor((ms%60000)/1000);
    return min===0 ? sec+'s' : min+'min '+(sec<10?'0':'')+sec+'s';
  },

  calculateScores() {
    var pilarScores=[0,0,0,0,0];
    var self = this;
    this._questions.forEach(function(q,i){ pilarScores[q.pilar]+=(self._state.answers[i]||3); });
    var iee     = pilarScores.reduce(function(a,b){return a+b;},0);
    var ieeBand = this.getIEEBand(iee);
    var nextLvl = this.getNextLevel(iee);

    var pilarObjects = this._pilares.map(function(p,i){
      return Object.assign({},p,{
        ieeContribution: pilarScores[i],
        pct: Math.round((pilarScores[i]/20)*100),
        interpretation: self.getPilarInterpretation(p.key, pilarScores[i]),
        firstSteps:     self.getFirstSteps(p.key),
      });
    });

    var ranked = pilarObjects.slice().sort(function(a,b){return a.ieeContribution-b.ieeContribution;});

    this._state.completedAt = new Date().toISOString();

    var result = {
      pilarScores, pilarObjects, ranked,
      strong:       ranked.slice(-2).reverse(),
      weak:         ranked.slice(0,3),
      iee,
      ieeBand,
      nextLevel:    nextLvl,
      biggestStrength:       ranked[ranked.length-1],
      biggestGap:            ranked[0],
      topPriorities:         ranked.slice(0,3),
      initialRecommendation: this.getInitialRecommendation(ranked[0].key),
      evolutionPlan:         ieeBand.evolutionPlan,
      completionTime:        this.getCompletionTime(),
      version:               this._state.version,
      date: new Date().toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'}),
    };

    this._state.result = result;
    this._persist();
    this._saveHistory(result);
    return result;
  },

  getResult() { return this._state.result; },

  getExecutiveSummary() {
    var r = this._state.result;
    if (!r) return '';
    var id   = this._state.identification||{};
    var name = (id.name||'').split(' ')[0]||'Empresário(a)';
    var co   = id.company||'sua empresa';
    var gap  = r.biggestGap;
    var str  = r.biggestStrength;
    var iee  = r.iee;

    var texts = {
      20: name+', este diagnóstico revela um negócio com grande potencial ainda não estruturado. '+co+' ainda depende fortemente da sua presença para funcionar. A principal oportunidade de transformação está em **'+gap.name+'**. E é sobre **'+str.name+'** — seu ponto mais forte — que a evolução deve começar.',
      41: name+', '+co+' já está em movimento na direção certa. Existem iniciativas positivas e clareza parcial de direção. O desafio atual são as inconsistências: o que funciona em alguns momentos não se repete em outros. Consolidar **'+str.name+'** como base e fortalecer **'+gap.name+'** é o caminho mais inteligente agora.',
      61: name+', '+co+' já demonstra evolução consistente. Há processos razoavelmente definidos e capacidade real de crescimento. Fortalecer **'+gap.name+'** é o que vai transformar uma empresa em desenvolvimento em uma empresa verdadeiramente estruturada.',
      76: name+', '+co+' opera com uma base de gestão sólida. Você tem previsibilidade, processos definidos e clareza de direção. O destaque em **'+str.name+'** é um diferencial real. Refinar **'+gap.name+'** vai abrir o próximo ciclo de crescimento com mais consistência.',
      89: name+', '+co+' atingiu o nível mais alto de maturidade. A empresa opera com consistência em todos os pilares, com destaque para **'+str.name+'**. O foco agora está em manter essa qualidade enquanto expande para novos ciclos de crescimento.',
    };
    var level = iee>=89?89:iee>=76?76:iee>=61?61:iee>=41?41:20;
    return texts[level];
  },

  _saveHistory(result) {
    try {
      var key     = 'lume-iee-history';
      var history = LUME.Storage.load(key)||[];
      history.push({
        date:        result.date,
        iee:         result.iee,
        level:       result.ieeBand.level,
        icon:        result.ieeBand.icon,
        pilarScores: result.pilarScores,
        company:     (this._state.identification||{}).company||'',
        version:     result.version,
        completedAt: this._state.completedAt,
      });
      if (history.length > 10) history = history.slice(-10);
      LUME.Storage.save(key, history);
    } catch(e) {}
  },

  reset() {
    this._state={ identification:null, answers:{}, currentQuestion:0, scores:null, result:null, startedAt:null, completedAt:null, version:'2.0.0' };
    LUME.Storage.remove(LUME.Config.storageKey);
  },

  _persist()      { LUME.Storage.save(LUME.Config.storageKey, this._state); },
  _restoreState() { var s=LUME.Storage.load(LUME.Config.storageKey); if(s) this._state=Object.assign(this._state,s); },
};
