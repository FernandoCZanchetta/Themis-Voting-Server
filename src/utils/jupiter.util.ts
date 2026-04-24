import { ParsedCodeAndName } from '@types'

export function parseCodeAndName(text?: string): ParsedCodeAndName {
  if (!text) {
    return { code: null, name: null}
  }

  const [rawCode, name] = text.split(' - ').map(t => t?.trim())

  const code = Number(rawCode)

  return { code: Number.isNaN(code) ? null : code, name: name ?? null}
}
