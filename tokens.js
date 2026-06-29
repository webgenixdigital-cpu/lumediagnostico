/**
 * LUME OS — Tokens
 * Constantes JavaScript utilizadas pelos módulos.
 * Espelha os design tokens do CSS quando necessário.
 * Nunca duplicar valores — se existe no CSS, referencia daqui.
 */

'use strict';

window.LUME = window.LUME || {};

LUME.Tokens = {

  /* ── Animações (ms) ── */
  animation: {
    fast:   150,
    base:   250,
    slow:   400,
    page:   350,
  },

  /* ── Diagnóstico ── */
  questions:  20,
  pilares:    5,
  scoreMin:   20,
  scoreMax:   100,

  /* ── Storage ── */
  storageKey: 'lume-diagnostic',

  /* ── Scroll ── */
  navScrollThreshold: 20,
  revealRootMargin:   '0px 0px -60px 0px',
  revealThreshold:    0.1,

  /* ── Wizard ── */
  wizard: {
    transitionClass:  'is-transitioning',
    activeClass:      'is-active',
    hiddenClass:      'is-hidden',
    animatingClass:   'is-animating',
  },

  /* ── Validação ── */
  validation: {
    emailRegex:  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phoneMinLen: 10,
    nameMinLen:  2,
  },

};
