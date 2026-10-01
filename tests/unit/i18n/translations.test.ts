import { describe, expect, it } from 'vitest'
import { i18n, loadLocaleMessages, setLocale, SUPPORTED_LOCALES } from '@/i18n'
import en from '@/i18n/locales/en.json'
import zhCN from '@/i18n/locales/zh-CN.json'
import ja from '@/i18n/locales/ja.json'
import es from '@/i18n/locales/es.json'
import de from '@/i18n/locales/de.json'
import fr from '@/i18n/locales/fr.json'

const messages = { en, 'zh-CN': zhCN, ja, es, de, fr }

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return prefix ? [prefix] : []
  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe('i18n', () => {
  it('defines all six supported locales', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'zh-CN', 'ja', 'es', 'de', 'fr'])
  })

  it('keeps every locale key-complete with English', () => {
    const expected = flattenKeys(en).sort()
    for (const locale of SUPPORTED_LOCALES) {
      expect(flattenKeys(messages[locale]).sort(), locale).toEqual(expected)
    }
  })

  it('lazy-loads non-English messages and updates the document language', async () => {
    await loadLocaleMessages('zh-CN')
    expect(i18n.global.availableLocales).toContain('zh-CN')
    await setLocale('zh-CN')
    expect(i18n.global.locale.value).toBe('zh-CN')
    expect(document.documentElement.lang).toBe('zh-CN')
    expect(i18n.global.t('app.home')).toBe('首页')
    await setLocale('en')
  })
})
