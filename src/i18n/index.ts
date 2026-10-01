import { createI18n } from 'vue-i18n'
import en from './locales/en.json'

export const SUPPORTED_LOCALES = ['en', 'zh-CN', 'ja', 'es', 'de', 'fr'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export const FALLBACK_LOCALE: SupportedLocale = 'en'

type LocaleMessages = typeof en

const localeLoaders: Record<SupportedLocale, () => Promise<LocaleMessages>> = {
  en: async () => en,
  'zh-CN': () => import('./locales/zh-CN.json').then((module) => module.default),
  ja: () => import('./locales/ja.json').then((module) => module.default),
  es: () => import('./locales/es.json').then((module) => module.default),
  de: () => import('./locales/de.json').then((module) => module.default),
  fr: () => import('./locales/fr.json').then((module) => module.default),
}

export const i18n = createI18n({
  legacy: false,
  locale: FALLBACK_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  messages: { en } as Record<SupportedLocale, LocaleMessages>,
  missingWarn: false,
  fallbackWarn: false,
})

export async function loadLocaleMessages(locale: SupportedLocale): Promise<void> {
  if (locale === FALLBACK_LOCALE || i18n.global.availableLocales.includes(locale)) return
  const messages = await localeLoaders[locale]()
  i18n.global.setLocaleMessage(locale, messages)
}

export async function setLocale(locale: SupportedLocale): Promise<void> {
  await loadLocaleMessages(locale)
  i18n.global.locale.value = locale
  if (typeof document !== 'undefined') document.documentElement.lang = locale
}

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}
