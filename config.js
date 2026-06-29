/**
 * LUME OS — Config
 * Configurações globais da aplicação.
 * Todas as configurações centralizadas aqui.
 */

'use strict';

window.LUME = window.LUME || {};

LUME.Config = {
  version:    '2.0.0',
  app:        'LUME OS',
  module:     'Diagnóstico OPERA',
  questions:  20,
  storageKey: 'lume-diagnostic',

  /* ── Integrações ── */
  whatsapp:   '5535987096476',
  sheetsUrl:  'https://script.google.com/macros/s/AKfycbyHWaN1ds2ekbq4lgXAbZ67qT9AygbtPanlgSV5lvF4JfKN-Yr5hH9FX3zIH_1xz32eUQ/exec',

  /* ── Segmentos ── */
  segments: [
    { value: 'salao',       label: 'Salão de Beleza'     },
    { value: 'clinica',     label: 'Clínica Estética'     },
    { value: 'barbearia',   label: 'Barbearia'            },
    { value: 'beauty',      label: 'Beauty Design'        },
    { value: 'spa',         label: 'Spa & Bem-estar'      },
    { value: 'studio',      label: 'Studio Especializado' },
    { value: 'consultoria', label: 'Consultoria'          },
    { value: 'servicos',    label: 'Serviços em Geral'    },
    { value: 'comercio',    label: 'Comércio'             },
    { value: 'outro',       label: 'Outro'                },
  ],

  /* ── Wizard steps ── */
  steps: {
    LANDING:        'landing',
    IDENTIFICATION: 'identification',
    QUESTIONNAIRE:  'questionnaire',
    LOADING:        'loading',
    RESULT:         'result',
  },
};
