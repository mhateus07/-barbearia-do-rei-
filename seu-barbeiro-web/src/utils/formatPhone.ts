/** "5532998578057" → "(32) 99857-8057". Valores fora do padrão voltam como vieram. */
export function formatPhone(phone?: string | null): string {
  if (!phone) return ''
  let digits = phone.replace(/\D/g, '')
  if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2)
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return phone
}
