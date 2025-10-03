export const SKU_REGEX = /^[A-Za-z0-9._~-]+$/

export function isValidSku(value: string) {
  return SKU_REGEX.test(value)
}
