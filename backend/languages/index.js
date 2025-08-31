// languages/index.js
import en from './en.js';
import hi from './hi.js';
import es from './es.js';
import fr from './fr.js';

export const languages = {
  en,
  hi,
  es,
  fr
};

export function getLanguage(lang) {
  return languages[lang] || en;
}
