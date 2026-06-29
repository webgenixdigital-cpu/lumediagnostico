/**
 * LUME OS — App Controller
 * Diagnóstico OPERA™ v2.0 — Final
 * O usuário vê seu Nível de Evolução. O IEE™ opera internamente.
 */

'use strict';

window.LUME = window.LUME || {};

LUME.App = {

  _steps:          [],
  _currentStep:    null,
  _autoAdvance:    null,
  _pilarIntroSeen: {},

  init() {
    this.initModules();
    this.initNavigation();
    this.initAnimations();
    this.initHero();
    this.initWizard();
    this.initCTA();
  },

  initModules() { if (LUME.Diagnostic) LUME.Diagnostic.init(); },

  /* ── NAV ───────────────────────────── */
  initNavigation() {
    var nav = document.querySelector('.lume-nav');
    if (!nav) return;
    var ticking = false;
    var upd = function() { nav.classList.toggle('is-scrolled', window.scrollY > LUME.Tokens.navScrollThreshold); ticking = false; };
    upd();
    window.addEventListener('scroll', function() { if(!ticking){ window.requestAnimationFrame(upd); ticking=true; } }, { passive:true });
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click', function(e){
        var t = document.querySelector(a.getAttribute('href'));
        if(!t) return;
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 16, behavior:'smooth' });
      });
    });
  },

  /* ── ANIMATIONS ────────────────────── */
  initAnimations() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.lume-reveal,.lume-reveal-stagger,.lume-result-reveal').forEach(function(el){ el.classList.add('is-visible'); });
      return;
    }
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
    }, { rootMargin: LUME.Tokens.revealRootMargin, threshold: LUME.Tokens.revealThreshold });
    document.querySelectorAll('.lume-reveal,.lume-reveal-stagger,.lume-result-reveal').forEach(function(el){ obs.observe(el); });
  },

  initHero() {
    document.querySelectorAll('[data-hero-item]').forEach(function(el,i){ el.style.animationDelay=(i*80)+'ms'; });
  },

  /* ── WIZARD ────────────────────────── */
  initWizard() {
    this._steps = Array.from(document.querySelectorAll('[data-wizard-step]'));
    if (!this._steps.length) return;
    this.goToStep(LUME.Config.steps.LANDING, false);
  },

  goToStep(name, animate) {
    if (animate === undefined) animate = true;
    var self   = this;
    var target = this._steps.find(function(el){ return el.dataset.wizardStep===name; });
    var current= this._steps.find(function(el){ return el.classList.contains('is-active'); });
    if (!target || target===current) return;
    var go = function() {
      self._steps.forEach(function(el){ el.classList.remove('is-active','is-animating'); });
      target.classList.add('is-active','page-enter');
      target.addEventListener('animationend', function(){ target.classList.remove('page-enter'); }, { once:true });
      self._currentStep = name;
      var nav = document.querySelector('.lume-nav');
      if (nav) nav.classList.toggle('lume-nav--app', name !== LUME.Config.steps.LANDING);
      window.scrollTo({ top:0, behavior:'instant' });
    };
    if (animate && current) { current.classList.add('is-animating'); setTimeout(go, LUME.Tokens.animation.page); }
    else go();
  },

  /* ── CTA ───────────────────────────── */
  initCTA() {
    var self = this;
    document.querySelectorAll('[data-action="start-diagnostic"]').forEach(function(btn){
      btn.addEventListener('click', function(e){ e.preventDefault(); self.startDiagnostic(); });
    });
  },

  startDiagnostic() {
    LUME.Diagnostic.reset();
    this._pilarIntroSeen = {};
    this.goToStep(LUME.Config.steps.IDENTIFICATION);
  },

  backToLanding() { this.goToStep(LUME.Config.steps.LANDING); },

  /* ── IDENTIFICATION ────────────────── */
  submitIdentification() {
    var self = this;
    var f = {
      name:    document.getElementById('field-name'),
      company: document.getElementById('field-company'),
      email:   document.getElementById('field-email'),
      phone:   document.getElementById('field-phone'),
      segment: document.getElementById('field-segment'),
    };
    var ok = true;
    var V  = LUME.Tokens.validation;
    Object.values(f).forEach(function(el){
      el.classList.remove('is-error','is-valid');
      var err = el.closest('.lume-form__group').querySelector('.lume-form__error');
      if (err) err.classList.remove('is-visible');
    });
    var validate = function(el, cond, msg){ if(!cond){ self._fieldError(el,msg); ok=false; } else el.classList.add('is-valid'); };
    validate(f.name,    f.name.value.trim().length >= V.nameMinLen,              'Informe seu nome completo.');
    validate(f.company, f.company.value.trim().length > 0,                       'Informe o nome da empresa.');
    validate(f.email,   V.emailRegex.test(f.email.value.trim()),                 'Informe um e-mail válido.');
    validate(f.phone,   f.phone.value.replace(/\D/g,'').length >= V.phoneMinLen, 'Informe um telefone com DDD.');
    validate(f.segment, f.segment.value !== '',                                  'Selecione o segmento de atuação.');
    if (!ok) return;
    LUME.Diagnostic.setIdentification({
      name:    f.name.value.trim(),
      company: f.company.value.trim(),
      email:   f.email.value.trim(),
      phone:   f.phone.value.replace(/\D/g,''),
      segment: f.segment.value,
    });
    this._pilarIntroSeen = {};
    LUME.Diagnostic.setCurrentQuestion(0);
    this.goToStep(LUME.Config.steps.QUESTIONNAIRE);
    setTimeout(function(){ self._showPilarIntro(0); }, 200);
  },

  _fieldError(el, msg) {
    el.classList.add('is-error');
    var err = el.closest('.lume-form__group').querySelector('.lume-form__error');
    if (err) { err.textContent=msg; err.classList.add('is-visible'); }
  },

  /* ── QUESTIONNAIRE ─────────────────── */
  _showPilarIntro(pilarIdx) {
    var self  = this;
    var pilar = LUME.Diagnostic.getPilares()[pilarIdx];
    var info  = LUME.Diagnostic.getPilarMessage(pilar.key);
    var card  = document.getElementById('q-main-card');
    var nav   = document.getElementById('q-nav');
    if (!card) { this.renderQuestion(pilarIdx*4); return; }
    if (nav) nav.style.visibility = 'hidden';
    card.innerHTML =
      '<div class="lume-pilar-intro">' +
        '<div class="lume-pilar-intro__key">'+pilar.key+'</div>' +
        '<h2 class="lume-pilar-intro__name">'+(info?info.title:pilar.name)+'</h2>' +
        '<p class="lume-pilar-intro__msg">'+(info?info.msg:pilar.desc)+'</p>' +
        '<p class="lume-pilar-intro__hint">4 perguntas neste bloco</p>' +
        '<button type="button" class="lume-btn lume-btn--primary" onclick="LUME.App._startPilarQ('+pilarIdx+')">Começar →</button>' +
      '</div>';
    this._pilarIntroSeen[pilarIdx] = true;
    card._introTimer = setTimeout(function(){ self._startPilarQ(pilarIdx); }, 2400);
  },

  _startPilarQ(pilarIdx) {
    var card = document.getElementById('q-main-card');
    if (card && card._introTimer) { clearTimeout(card._introTimer); card._introTimer=null; }
    var nav = document.getElementById('q-nav');
    if (nav) nav.style.visibility = 'visible';
    this.renderQuestion(pilarIdx*4);
  },

  renderQuestion(index) {
    var total    = LUME.Diagnostic.getTotalQuestions();
    var q        = LUME.Diagnostic.getQuestion(index);
    var pilar    = LUME.Diagnostic.getPilarForQuestion(index);
    var pilares  = LUME.Diagnostic.getPilares();
    var scale    = LUME.Diagnostic.getScale();
    var saved    = LUME.Diagnostic.getAnswer(index);
    var pct      = Math.round(((index+1)/total)*100);
    var qInPilar = (index%4)+1;
    var isLast   = index === total-1;
    var pilarDesc= ['Clareza e prioridades','Processos e padrões','Ferramentas e estrutura','Clientes e atendimento','Indicadores e decisões'];
    var self     = this;

    var set = function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
    set('q-progress-num', (index+1)+' de '+total);
    var pb = document.getElementById('q-progress-fill'); if(pb) pb.style.width=pct+'%';

    pilares.forEach(function(p,i){
      var pip = document.getElementById('q-pip-'+i);
      if(!pip) return;
      pip.classList.remove('is-done','is-active');
      if(i < q.pilar)        pip.classList.add('is-done');
      else if(i === q.pilar) pip.classList.add('is-active');
    });

    set('q-pilar-key',   pilar.key);
    set('q-pilar-name',  pilar.name);
    set('q-pilar-sub',   pilarDesc[q.pilar]);
    set('q-pilar-count', qInPilar+' de 4');

    var card = document.getElementById('q-main-card');
    if (card) {
      var qt = card.querySelector('.lume-q-text');
      if (!qt) {
        card.innerHTML =
          '<div class="lume-q-text-wrap"><p class="lume-q-text" id="q-text" aria-live="polite"></p></div>' +
          '<div class="lume-scale-wrap">' +
            '<div class="lume-scale-endpoints" aria-hidden="true"><span class="lume-scale-endpoint">Nunca</span><span class="lume-scale-endpoint">Sempre</span></div>' +
            '<div class="lume-scale" id="q-scale" role="group" aria-label="Escala de 1 a 5"></div>' +
          '</div>';
        qt = card.querySelector('.lume-q-text');
      }
      if (qt) {
        qt.classList.remove('is-entering','is-exiting');
        void qt.offsetWidth;
        qt.textContent = q.text;
        qt.classList.add('is-entering');
        qt.addEventListener('animationend', function(){ qt.classList.remove('is-entering'); }, { once:true });
      }
    }

    var sb = document.getElementById('q-scale');
    if (sb) {
      sb.innerHTML = scale.map(function(s){
        return '<button type="button" class="lume-scale-btn'+(saved===s.value?' is-selected':'')+'"'+
          ' data-value="'+s.value+'" onclick="LUME.App.selectAnswer('+s.value+')"'+
          ' aria-pressed="'+(saved===s.value)+'" aria-label="'+s.label+'">' +
          '<span class="lume-scale-btn__num">'+s.value+'</span>'+
          '<span class="lume-scale-btn__label">'+s.label+'</span>'+
        '</button>';
      }).join('');
    }

    var bp = document.getElementById('q-btn-prev');
    var bn = document.getElementById('q-btn-next');
    var nav= document.getElementById('q-nav');
    if (nav) nav.style.visibility = 'visible';
    if (bp) bp.style.visibility = index > 0 ? 'visible' : 'hidden';
    if (bn) { bn.disabled=saved===null; bn.textContent=isLast?'Concluir avaliação →':'Próxima →'; }
    var hint = document.querySelector('.lume-q-nav__hint');
    if (hint) hint.textContent = saved !== null ? 'Avançando automaticamente...' : 'Escolha a opção que melhor descreve sua realidade';
  },

  selectAnswer(value) {
    var self  = this;
    var index = LUME.Diagnostic.getCurrentQuestion();
    LUME.Diagnostic.answerQuestion(index, value);
    document.querySelectorAll('.lume-scale-btn').forEach(function(btn){
      var v = parseInt(btn.dataset.value);
      btn.classList.toggle('is-selected', v===value);
      btn.setAttribute('aria-pressed', v===value);
    });
    var bn = document.getElementById('q-btn-next');
    if (bn) bn.disabled = false;
    var hint = document.querySelector('.lume-q-nav__hint');
    if (hint) hint.textContent = 'Avançando automaticamente...';
    if (this._autoAdvance) clearTimeout(this._autoAdvance);
    this._autoAdvance = setTimeout(function(){
      var h = document.querySelector('.lume-q-nav__hint');
      if (h) h.textContent = '';
      self.nextQuestion();
    }, 600);
  },

  nextQuestion() {
    if (this._autoAdvance) { clearTimeout(this._autoAdvance); this._autoAdvance=null; }
    var index = LUME.Diagnostic.getCurrentQuestion();
    var total = LUME.Diagnostic.getTotalQuestions();
    if (LUME.Diagnostic.getAnswer(index) === null) return;
    var curPilar  = Math.floor(index/4);
    var nextIndex = index+1;
    if (nextIndex < total) {
      var nextPilar = Math.floor(nextIndex/4);
      if (nextPilar !== curPilar) this._toast(LUME.Diagnostic.getPilares()[curPilar].name+' concluído ✓');
      LUME.Diagnostic.setCurrentQuestion(nextIndex);
      if (nextPilar !== curPilar && !this._pilarIntroSeen[nextPilar]) this._showPilarIntro(nextPilar);
      else this.renderQuestion(nextIndex);
    } else {
      this.startAnalysis();
    }
  },

  prevQuestion() {
    if (this._autoAdvance) { clearTimeout(this._autoAdvance); this._autoAdvance=null; }
    var index = LUME.Diagnostic.getCurrentQuestion();
    if (index > 0) { LUME.Diagnostic.setCurrentQuestion(index-1); this.renderQuestion(index-1); }
  },

  _toast(msg) {
    var el = document.getElementById('lume-toast');
    if (!el) { el=document.createElement('div'); el.id='lume-toast'; el.className='lume-milestone'; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('is-visible');
    setTimeout(function(){ el.classList.remove('is-visible'); }, 2200);
    var ar = document.getElementById('lume-toast-region');
    if (ar) { ar.textContent=''; setTimeout(function(){ ar.textContent=msg; }, 50); }
  },

  /* ── ANALYSIS ──────────────────────── */
  startAnalysis() {
    var self = this;
    this.goToStep(LUME.Config.steps.LOADING);
    var steps = [
      'Avaliando Organização',
      'Cruzando indicadores',
      'Identificando oportunidades',
      'Definindo prioridades',
      'Construindo Diagnóstico Executivo',
      'Finalizando relatório',
    ];
    var progressEl = document.getElementById('analysis-progress');
    var listEl     = document.getElementById('analysis-steps');
    if (!listEl) {
      setTimeout(function(){ var r=LUME.Diagnostic.calculateScores(); self.renderResult(r); self.goToStep(LUME.Config.steps.RESULT); setTimeout(function(){ self._revealResult(); },300); }, 2500);
      return;
    }
    listEl.innerHTML = steps.map(function(s,i){
      return '<div class="lume-analysis-step" id="as-'+i+'"><div class="lume-analysis-step__dot"></div><span class="lume-analysis-step__text">'+s+'</span></div>';
    }).join('');
    var step   = 0;
    var STEP_MS= 460;
    var advance= function(){
      if (step < steps.length) {
        var el = document.getElementById('as-'+step);
        if (el) { el.classList.add('is-active'); setTimeout(function(){ el.classList.add('is-done'); }, STEP_MS-100); }
        if (progressEl) progressEl.style.width=Math.round(((step+1)/steps.length)*92)+'%';
        step++;
        setTimeout(advance, STEP_MS);
      } else {
        if (progressEl) progressEl.style.width='100%';
        setTimeout(function(){
          var r=LUME.Diagnostic.calculateScores();
          self.renderResult(r);
          self._sendToSheets(r);
          self.goToStep(LUME.Config.steps.RESULT);
          setTimeout(function(){ self._revealResult(); }, 400);
        }, 500);
      }
    };
    setTimeout(advance, 300);
  },

  /* ── RESULT ────────────────────────── */
  renderResult(result) {
    var id  = LUME.Diagnostic.getIdentification()||{};
    var set = function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
    var stH = function(id,v){ var el=document.getElementById(id); if(el) el.innerHTML=v; };

    /* Capa */
    set('result-company',   id.company||id.name||'—');
    set('result-responsible', id.name||'—');
    set('result-report-date', result.date);
    set('result-report-version', 'Versão Beta 2.0');

    /* Nível de Evolução (não mostra IEE™ número) */
    set('result-level-icon',  result.ieeBand.icon);
    set('result-level-name',  result.ieeBand.level);
    set('result-level-desc',  result.ieeBand.description);
    set('result-level-interp',result.ieeBand.interpretation);
    set('result-meta-version',result.version ? 'v'+result.version : '');
    set('result-meta-date',   result.date);
    set('result-meta-duration', result.completionTime ? 'Concluído em '+result.completionTime : '');

    /* Anel — mostra ícone do nível, não número */
    this._buildLevelRing('result-ring-svg', result.iee, result.ieeBand.icon);

    /* Próxima evolução */
    if (result.nextLevel) {
      set('result-next-level-name',   result.nextLevel.band.icon+' '+result.nextLevel.band.level);
      set('result-next-level-points', 'Faltam '+result.nextLevel.pointsNeeded+' pontos para este estágio');
      this._buildNextBar('result-next-bar', result.iee, result.nextLevel);
    } else {
      set('result-next-level-name',   '🏆 Excelência Operacional atingida');
      set('result-next-level-points', 'Você alcançou o nível mais alto do Método OPERA™.');
    }

    /* Pontos fortes / oportunidades */
    set('result-strength-name',  result.biggestStrength.name);
    set('result-strength-score', result.biggestStrength.ieeContribution+'/20');
    set('result-gap-name',       result.biggestGap.name);
    set('result-gap-score',      result.biggestGap.ieeContribution+'/20');

    /* Pilares */
    this._buildBars('result-pilar-bars', result.pilarObjects);
    this._buildRadar('result-radar', result.pilarScores);

    /* Resumo consultivo */
    var summary = LUME.Diagnostic.getExecutiveSummary();
    stH('result-summary', summary.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>'));

    /* Análise por dimensão */
    this._buildAnalysis('result-analysis', result.pilarObjects);

    /* Prioridades */
    this._buildPriorities('result-priorities', result.topPriorities);

    /* Plano inicial de evolução */
    this._buildEvolutionPlan('result-evolution-plan', result.evolutionPlan);

    /* Próximo objetivo */
    set('result-next-objective', result.ieeBand.nextObjective);

    /* Próxima avaliação recomendada */
    set('result-next-assessment', result.ieeBand.nextAssessment);
  },

  _revealResult() {
    var self = this;
    document.querySelectorAll('[data-result-reveal]').forEach(function(el,i){
      setTimeout(function(){ el.classList.add('is-visible'); }, i*140);
    });
    setTimeout(function(){
      var arc = document.querySelector('.ring-fill');
      var r   = LUME.Diagnostic.getResult();
      if (arc && r) { arc.style.strokeDashoffset = 339.3*(1-(r.iee-20)/80); }
    }, 300);
    setTimeout(function(){
      document.querySelectorAll('.lume-pilar-bar__fill').forEach(function(bar,i){
        setTimeout(function(){ bar.style.width=bar.dataset.w+'%'; }, i*80);
      });
    }, 500);
    setTimeout(function(){
      document.querySelectorAll('.lume-interp-item__bar').forEach(function(bar){ bar.style.width=bar.dataset.w+'%'; });
    }, 900);
    setTimeout(function(){
      var fill = document.querySelector('.lume-next-bar__fill');
      if (fill) fill.style.width = fill.dataset.w+'%';
    }, 800);
  },

  /* ── Helpers ── */
  _buildLevelRing(id, iee, icon) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML =
      '<svg class="lume-score-ring-svg" viewBox="0 0 120 120">' +
        '<circle class="ring-bg" cx="60" cy="60" r="54"/>' +
        '<circle class="ring-fill" cx="60" cy="60" r="54" stroke-dasharray="339.3" stroke-dashoffset="339.3"/>' +
      '</svg>' +
      '<div class="lume-ring-icon-center">' +
        '<span class="lume-ring-icon" aria-hidden="true">'+icon+'</span>' +
      '</div>';
  },

  _buildNextBar(id, iee, nextLevel) {
    var el = document.getElementById(id);
    if (!el) return;
    var band  = LUME.Diagnostic.getIEEBand(iee);
    var range = nextLevel.band.min - band.min;
    var prog  = iee - band.min;
    var pct   = Math.min(100, Math.round((prog/range)*100));
    el.innerHTML =
      '<div class="lume-next-bar__track">'+
        '<div class="lume-next-bar__fill" data-w="'+pct+'" style="width:0%"></div>'+
      '</div>';
  },

  _buildBars(id, pilars) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = pilars.map(function(p){
      return '<div class="lume-pilar-bar">'+
        '<div class="lume-pilar-bar__header">'+
          '<span class="lume-pilar-bar__name"><span class="lume-pilar-bar__key">'+p.key+'</span>'+p.name+'</span>'+
          '<span class="lume-pilar-bar__score">'+p.ieeContribution+'/20</span>'+
        '</div>'+
        '<div class="lume-pilar-bar__track">'+
          '<div class="lume-pilar-bar__fill" data-w="'+p.pct+'" style="width:0%"></div>'+
        '</div>'+
      '</div>';
    }).join('');
  },

  _buildRadar(id, scores) {
    var el=document.getElementById(id); if(!el) return;
    var pls=LUME.Diagnostic.getPilares(), cx=130,cy=130,r=90,n=5;
    var ang=function(i){ return (2*Math.PI*i/n)-Math.PI/2; };
    var pt =function(i,f){ return {x:cx+Math.cos(ang(i))*r*f, y:cy+Math.sin(ang(i))*r*f}; };
    var svg='<svg viewBox="0 0 260 260" role="img" aria-label="Radar OPERA">';
    [0.2,0.4,0.6,0.8,1].forEach(function(f){
      var pts=pls.map(function(_,i){var p=pt(i,f);return p.x+','+p.y;}).join(' ');
      svg+='<polygon points="'+pts+'" fill="none" stroke="#E5E7EB" stroke-width="0.8"/>';
    });
    pls.forEach(function(_,i){ var p=pt(i,1); svg+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p.x+'" y2="'+p.y+'" stroke="#E5E7EB" stroke-width="0.8"/>'; });
    var dataPts=pls.map(function(_,i){var f=Math.max(0.07,(scores[i]-4)/16); var p=pt(i,f); return p.x+','+p.y;}).join(' ');
    svg+='<polygon points="'+dataPts+'" fill="rgba(31,61,52,0.1)" stroke="#1F3D34" stroke-width="2"/>';
    pls.forEach(function(_,i){var f=Math.max(0.07,(scores[i]-4)/16); var p=pt(i,f); svg+='<circle cx="'+p.x+'" cy="'+p.y+'" r="4.5" fill="#1F3D34" stroke="white" stroke-width="2"/>'; });
    pls.forEach(function(p,i){var lp=pt(i,1.26); svg+='<text x="'+lp.x+'" y="'+lp.y+'" text-anchor="middle" dominant-baseline="middle" font-family="Inter,sans-serif" font-size="11" font-weight="600" fill="#24352F">'+p.key+'</text>'; });
    svg+='</svg>';
    el.innerHTML=svg;
  },

  _buildAnalysis(id, pilars) {
    var el=document.getElementById(id); if(!el) return;
    el.innerHTML=pilars.map(function(p){
      return '<div class="lume-interp-item">'+
        '<div class="lume-interp-item__header"><span class="lume-interp-item__key">'+p.key+'</span><span class="lume-interp-item__name">'+p.name+'</span><span class="lume-interp-item__score">'+p.ieeContribution+'/20</span></div>'+
        '<div class="lume-interp-item__bar-wrap"><div class="lume-interp-item__bar" data-w="'+p.pct+'" style="width:0%"></div></div>'+
        '<p class="lume-interp-item__text">'+p.interpretation+'</p>'+
      '</div>';
    }).join('');
  },

  _buildPriorities(id, weakPilars) {
    var el=document.getElementById(id); if(!el) return;
    el.innerHTML=weakPilars.map(function(p,i){
      return '<div class="lume-priority-item">'+
        '<div class="lume-priority-item__rank">'+(i+1)+'</div>'+
        '<div class="lume-priority-item__body">'+
          '<div class="lume-priority-item__name">'+p.name+'</div>'+
          '<div class="lume-priority-item__score">Situação atual: '+p.ieeContribution+'/20 — '+p.pct+'% de evolução nesta dimensão</div>'+
        '</div>'+
      '</div>';
    }).join('');
  },

  _buildEvolutionPlan(id, actions) {
    var el=document.getElementById(id); if(!el) return;
    el.innerHTML = actions.map(function(action,i){
      return '<div class="lume-evolution-item">'+
        '<div class="lume-evolution-item__num">'+(i+1)+'</div>'+
        '<p class="lume-evolution-item__text">'+action+'</p>'+
      '</div>';
    }).join('');
  },

  /* ── INTEGRAÇÕES ──────────────────────── */

  /**
   * Envia lead para Google Sheets após conclusão do diagnóstico.
   * Usa o webhook configurado em LUME.Config.sheetsUrl
   */
  _sendToSheets(result) {
    var url = LUME.Config.sheetsUrl;
    if (!url) return;
    var id = LUME.Diagnostic.getIdentification() || {};
    var payload = {
      nome:          id.name    || '',
      empresa:       id.company || '',
      email:         id.email   || '',
      whatsapp:      id.phone   || '',
      nicho:         id.segment || '',
      nivel:         result.ieeBand.level,
      iee:           result.iee,
      pilarO:        result.pilarScores[0],
      pilarP:        result.pilarScores[1],
      pilarE:        result.pilarScores[2],
      pilarR:        result.pilarScores[3],
      pilarA:        result.pilarScores[4],
      forca:         result.biggestStrength.name,
      gargalo:       result.biggestGap.name,
      data:          result.date,
      versao:        result.version,
      duracao:       result.completionTime || '',
    };
    try {
      fetch(url, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      }).catch(function() {});
    } catch(e) {}
  },

  /**
   * Abre WhatsApp com mensagem pré-preenchida.
   * Chamado pelo botão do CTA final.
   */
  openWhatsApp() {
    var wpp = LUME.Config.whatsapp;
    if (!wpp) return;
    var id  = LUME.Diagnostic.getIdentification() || {};
    var r   = LUME.Diagnostic.getResult() || {};
    var band= (r.ieeBand || {});
    var msg =
      'Olá! Acabei de fazer o Diagnóstico OPERA™ pelo LUME OS.

' +
      'Empresa: '  + (id.company || id.name || '') + '
' +
      'Nível: '    + (band.level || '') + ' ' + (band.icon || '') + '
' +
      'Dimensão mais forte: '     + ((r.biggestStrength || {}).name || '') + '
' +
      'Principal oportunidade: '  + ((r.biggestGap || {}).name || '') + '

' +
      'Quero construir meu Plano Estratégico de Evolução.';
    window.open('https://wa.me/' + wpp + '?text=' + encodeURIComponent(msg), '_blank');
  },

  /* ── RESTART ───────────────────────── */
  restart() {
    LUME.Diagnostic.reset();
    this._pilarIntroSeen = {};
    ['field-name','field-company','field-email','field-phone'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
    var seg=document.getElementById('field-segment'); if(seg) seg.selectedIndex=0;
    this.goToStep(LUME.Config.steps.LANDING);
  },
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ LUME.App.init(); });
else LUME.App.init();
