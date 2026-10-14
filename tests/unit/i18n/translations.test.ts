import { describe, expect, it } from 'vitest'
import * as fc from 'fast-check'
import { i18n, loadLocaleMessages, setLocale, SUPPORTED_LOCALES } from '@/i18n'
import en from '@/i18n/locales/en.json'
import zhTW from '@/i18n/locales/zh-TW.json'
import zhCN from '@/i18n/locales/zh-CN.json'
import ja from '@/i18n/locales/ja.json'
import es from '@/i18n/locales/es.json'
import de from '@/i18n/locales/de.json'
import fr from '@/i18n/locales/fr.json'

const messages = { en, 'zh-TW': zhTW, 'zh-CN': zhCN, ja, es, de, fr }

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return prefix ? [prefix] : []
  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  )
}

function resolveKey(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

describe('i18n', () => {
  it('defines all seven supported locales', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'zh-TW', 'zh-CN', 'ja', 'es', 'de', 'fr'])
  })

  it('keeps every locale key-complete with English', () => {
    const expected = flattenKeys(en).sort()
    for (const locale of SUPPORTED_LOCALES) {
      expect(flattenKeys(messages[locale]).sort(), locale).toEqual(expected)
    }
  })

  /**
   * Feature: azure-az900-card-clash-engine, Property 22: Translation completeness per language
   * Validates: Requirements 8.3
   */
  it('Property 22 (fast-check): any key in English exists and is a non-empty string in any supported locale', () => {
    const allKeys = flattenKeys(en)
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        fc.constantFrom(...allKeys),
        (locale, key) => {
          const val = resolveKey(messages[locale] as Record<string, unknown>, key)
          return typeof val === 'string' && val.trim().length > 0
        },
      ),
      { numRuns: 200 },
    )
  })

  it('lazy-loads non-English messages and updates the document language', async () => {
    await loadLocaleMessages('zh-TW')
    expect(i18n.global.availableLocales).toContain('zh-TW')
    await setLocale('zh-TW')
    expect(i18n.global.locale.value).toBe('zh-TW')
    expect(document.documentElement.lang).toBe('zh-TW')
    expect(i18n.global.t('app.home')).toBe('首頁')

    await loadLocaleMessages('zh-CN')
    expect(i18n.global.availableLocales).toContain('zh-CN')
    await setLocale('zh-CN')
    expect(i18n.global.locale.value).toBe('zh-CN')
    expect(document.documentElement.lang).toBe('zh-CN')
    expect(i18n.global.t('app.home')).toBe('首页')
    await setLocale('en')
  })
})
