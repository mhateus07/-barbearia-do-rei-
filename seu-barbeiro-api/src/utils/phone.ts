export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '')
  const phone =
    digits.length === 10 || digits.length === 11 ? `55${digits}` : digits
  if (!/^55\d{10,11}$/.test(phone))
    throw new Error('Informe um telefone brasileiro válido com DDD')
  return phone
}
