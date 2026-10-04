import { useParams } from 'react-router-dom'
import { PixPanel } from '../../components/public/PixPanel'
import { PublicShell } from './PublicShell'

export function PayPage() {
  const { token = '' } = useParams()
  return (
    <PublicShell title="Pagamento via Pix">
      <h1 className="mb-1 font-display text-2xl font-bold">Pague com Pix</h1>
      <p className="mb-6 text-sm text-zinc-400">
        A confirmação aparece aqui assim que o banco aprovar.
      </p>
      <PixPanel token={token} />
    </PublicShell>
  )
}
