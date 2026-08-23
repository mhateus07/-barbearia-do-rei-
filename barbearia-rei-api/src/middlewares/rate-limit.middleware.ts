import rateLimit from 'express-rate-limit'

// Login: poucas tentativas por IP, pra dificultar brute-force de credenciais.
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
})

// Signup público: limita criação de novos tenants por IP, pra dificultar spam.
export const signupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de cadastro. Tente novamente mais tarde.' },
})
