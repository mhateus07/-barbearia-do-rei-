import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { createAppointment } from '../../api/appointments.api'
import { listBarbers } from '../../api/barbers.api'
import { listServices } from '../../api/services.api'
import { listClients } from '../../api/clients.api'

interface Props {
  open: boolean
  onClose: () => void
  defaultDate?: string
}

interface FormData {
  clientId: string
  barberId: string
  serviceIds: string[]
  startsAt: string
  notes: string
}

export function AppointmentFormModal({ open, onClose, defaultDate }: Props) {
  const qc = useQueryClient()

  const { data: barbers = [] } = useQuery({ queryKey: ['barbers'], queryFn: () => listBarbers(true) })
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => listServices(true) })
  const { data: clientsData } = useQuery({ queryKey: ['clients', ''], queryFn: () => listClients() })
  const clients = clientsData?.data ?? []

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>()

  useEffect(() => {
    reset({ clientId: '', barberId: '', serviceIds: [], startsAt: defaultDate || '', notes: '' })
  }, [open, defaultDate, reset])

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
      onClose()
    },
  })

  return (
    <Modal open={open} onClose={onClose} title="Novo Agendamento" size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Cliente *</label>
            <select {...register('clientId', { required: 'Obrigatório' })}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500">
              <option value="">Selecione...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
            </select>
            {errors.clientId && <span className="text-xs text-red-500">{errors.clientId.message}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Barbeiro *</label>
            <select {...register('barberId', { required: 'Obrigatório' })}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500">
              <option value="">Selecione...</option>
              {barbers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            {errors.barberId && <span className="text-xs text-red-500">{errors.barberId.message}</span>}
          </div>
        </div>

        <Input
          label="Data e Hora *"
          type="datetime-local"
          {...register('startsAt', { required: 'Obrigatório' })}
          error={errors.startsAt?.message}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Serviços *</label>
          <div className="max-h-36 overflow-y-auto rounded-lg border border-zinc-300 p-2 space-y-1">
            <Controller
              name="serviceIds"
              control={control}
              rules={{ required: 'Selecione ao menos um serviço' }}
              render={({ field }) => (
                <>
                  {services.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-zinc-50 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        value={s.id}
                        checked={field.value?.includes(s.id)}
                        onChange={(e) => {
                          const val = e.target.value
                          const current = field.value || []
                          field.onChange(e.target.checked ? [...current, val] : current.filter((v) => v !== val))
                        }}
                        className="accent-amber-500"
                      />
                      {s.name} — {s.durationMin}min — R$ {Number(s.price).toFixed(2)}
                    </label>
                  ))}
                </>
              )}
            />
          </div>
          {errors.serviceIds && <span className="text-xs text-red-500">{errors.serviceIds.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Observações</label>
          <textarea {...register('notes')} rows={2}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500" />
        </div>

        {mutation.error && <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={mutation.isPending}>Agendar</Button>
        </div>
      </form>
    </Modal>
  )
}
