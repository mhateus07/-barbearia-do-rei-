import 'dotenv/config' // carrega .env antes de qualquer coisa
import './src/config/env' // valida as variáveis
import { app } from './src/app'

const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
})
