import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { createWaitlistEntry } from '../../api/waitlist.api'
import { listBarbers } from '../../api/barbers.api'
import { listServices } from '../../api/services.api'
import { listClients } from '../../api/clients.api'

interface Props {
  open: boolean
  onClose: () => void
}

interface FormData {
  clientId: string
  barberId: string
  serviceId: string
  preferredDate: string
  notes: string
}

export function WaitlistFormModal({ open, onClose }: Props) {
  const qc = useQueryClient()

  const { data: barbers = [] } = useQuery({ queryKey: ['barbers'], queryFn: () => listBarbers(true) })
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => listServices(true) })
  const { data: clientsData } = useQuery({ queryKey: ['clients', ''], queryFn: () => listClients() })
  const clients = clientsData?.data ?? []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>()

  useEffect(() => {
    reset({ clientId: '', barberId: '', serviceId: '', preferredDate: '', notes: '' })
  }, [open, reset])

  const mutation = useMutation({
    mutationFn: (d: FormData) =>
      createWaitlistEntry({
        clientId: d.clientId,
        barberId: d.barberId || undefined,
        serviceId: d.serviceId || undefined,
        preferredDate: d.preferredDate,
        notes: d.notes || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['waitlist'] })
      onClose()
    },
  })

  return (
    <Modal open={open} onClose={onClose} title="Adicionar à Lista de Espera">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Cliente *</label>
          <select
            {...register('clientId', { required: 'Obrigatório' })}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
          >
            <option value="">Selecione...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.phone}
              </option>
            ))}
          </select>
          {errors.clientId && <span className="text-xs text-red-500">{errors.clientId.message}</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Barbeiro preferido</label>
            <select
              {...register('barberId')}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            >
              <option value="">Qualquer barbeiro</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Serviço desejado</label>
            <select
              {...register('serviceId')}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            >
              <option value="">Qualquer serviço</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Data desejada *"
          type="date"
          {...register('preferredDate', { required: 'Obrigatório' })}
          error={errors.preferredDate?.message}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Observações</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            placeholder="Ex: prefere de manhã"
          />
        </div>

        {mutation.error && <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Adicionar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
