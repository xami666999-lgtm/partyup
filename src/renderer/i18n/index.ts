import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const en = {
  app: 'PartyUp',
  tag: 'Your retro cabinet',
  home: 'Home',
  library: 'Library',
  emulators: 'Emulators',
  party: 'Party',
}
i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {
    en: { translation: en },
    es: { translation: { ...en, home: 'Inicio', library: 'Biblioteca' } },
    fr: { translation: { ...en, home: 'Accueil', library: 'Bibliothèque' } },
    de: { translation: { ...en, home: 'Start', library: 'Bibliothek' } },
    jp: { translation: { ...en, home: 'ホーム', library: 'ライブラリ' } },
    zh: { translation: { ...en, home: '首页', library: '游戏库' } },
    ru: { translation: { ...en, home: 'Главная', library: 'Библиотека' } },
    pt: { translation: { ...en, home: 'Início', library: 'Biblioteca' } },
    it: { translation: { ...en, home: 'Home', library: 'Libreria' } },
  },
})
export default i18n
