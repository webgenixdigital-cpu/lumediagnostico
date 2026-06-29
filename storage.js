/**
 * LUME OS — Storage
 * Abstração sobre localStorage.
 * Toda persistência de dados passa por este módulo.
 * Permite futura migração para IndexedDB ou API sem alterar outros módulos.
 */

'use strict';

window.LUME = window.LUME || {};

LUME.Storage = {

  /**
   * Salva um valor no storage.
   * @param {string} key   - Chave de identificação
   * @param {*}      value - Valor a salvar (serializado automaticamente)
   * @returns {boolean} Sucesso da operação
   */
  save(key, value) {
    try {
      const serialized = JSON.stringify({
        data:      value,
        savedAt:   new Date().toISOString(),
        version:   LUME.Config?.version || '2.0.0',
      });
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.warn('[LUME.Storage] Falha ao salvar:', key, error);
      return false;
    }
  },

  /**
   * Recupera um valor do storage.
   * @param {string} key          - Chave de identificação
   * @param {*}      defaultValue - Valor padrão caso não encontrado
   * @returns {*} Valor armazenado ou defaultValue
   */
  load(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;

      const parsed = JSON.parse(raw);
      return parsed?.data ?? defaultValue;
    } catch (error) {
      console.warn('[LUME.Storage] Falha ao carregar:', key, error);
      return defaultValue;
    }
  },

  /**
   * Remove uma entrada específica do storage.
   * @param {string} key - Chave a remover
   * @returns {boolean} Sucesso da operação
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('[LUME.Storage] Falha ao remover:', key, error);
      return false;
    }
  },

  /**
   * Remove todas as entradas do LUME OS do storage.
   * Não afeta dados de outras aplicações.
   * @returns {boolean} Sucesso da operação
   */
  clear() {
    try {
      const prefix = 'lume-';
      const keysToRemove = Object.keys(localStorage)
        .filter(key => key.startsWith(prefix));

      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.warn('[LUME.Storage] Falha ao limpar storage:', error);
      return false;
    }
  },

  /**
   * Verifica se uma chave existe no storage.
   * @param {string} key - Chave a verificar
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(key) !== null;
  },

};
