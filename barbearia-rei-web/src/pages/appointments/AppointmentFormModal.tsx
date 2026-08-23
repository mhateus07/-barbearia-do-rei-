import { useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PackageIcon } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { createAppointment, updateAppointment } from '../../api/appointments.api'
import { listBarbers } from '../../api/barbers.api'
import { listServices } from '../../api/services.api'
import { listClients } from '../../api/clients.api'
import { listClientPackages } from '../../api/packages.api'
import type { Appointment } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  defaultDate?: string
  appointment?: Appointment | null
}

interface FormData {
  clientId: string
  barberId: string
  serviceIds: string[]
  startsAt: string
  notes: string
  clientPackageId: string
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function AppointmentFormModal({ open, onClose, defaultDate, appointment }: Props) {
  const qc = useQueryClient()
  const isEdit = !!appointment

  const { data: barbers = [] } = useQuery({ queryKey: ['barbers'], queryFn: () => listBarbers(true) })
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => listServices(true) })
  const { data: clientsData } = useQuery({ queryKey: ['clients', ''], queryFn: () => listClients() })
  const clients = clientsData?.data ?? []

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>()

  useEffect(() => {
    if (appointment) {
      reset({
        clientId: appointment.client.id,
        barberId: appointment.barber.id,
        serviceIds: appointment.services.map((s) => s.service.id),
        startsAt: toDatetimeLocal(appointment.startsAt),
        notes: appointment.notes || '',
        clientPackageId: '',
      })
    } else {
      reset({
        clientId: '',
        barberId: '',
        serviceIds: [],
        startsAt: defaultDate || '',
        notes: '',
        clientPackageId: '',
      })
    }
  }, [open, appointment, defaultDate, reset])

  const selectedClientId = useWatch({ control, name: 'clientId' })
  const selectedPackageId = useWatch({ control, name: 'clientPackageId' })

  // Pacotes só entram em agendamentos novos — editar um já pago com pacote
  // não pode trocar de serviço (bloqueado no backend), então não faz
  // sentido oferecer a troca de pacote aqui
  const { data: clientPackages = [] } = useQuery({
    queryKey: ['client-packages', selectedClientId],
    queryFn: () => listClientPackages(selectedClientId),
    enabled: !isEdit && !!selectedClientId,
  })
  const eligiblePackages = clientPackages.filter((cp) => cp.active)
  const selectedPackage = eligiblePackages.find((cp) => cp.id === selectedPackageId)

  useEffect(() => {
    setValue('clientPackageId', '')
  }, [selectedClientId, setValue])

  useEffect(() => {
    if (selectedPackage) {
      setValue('serviceIds', [selectedPackage.package.serviceId])
    }
  }, [selectedPackage, setValue])

  const mutation = useMutation({
    mutationFn: (d: FormData) => {
      const payload = { ...d, clientPackageId: d.clientPackageId || undefined }
      return isEdit ? updateAppointment(appointment!.id, payload) : createAppointment(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
      qc.invalidateQueries({ queryKey: ['client-packages', selectedClientId] })
      onClose()
    },
  })

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Agendamento' : 'Novo Agendamento'} size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Barbeiro *</label>
            <select
              {...register('barberId', { required: 'Obrigatório' })}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            >
              <option value="">Selecione...</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.barberId && <span className="text-xs text-red-500">{errors.barberId.message}</span>}
          </div>
        </div>

        {!isEdit && eligiblePackages.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
              <PackageIcon className="h-3.5 w-3.5 text-amber-500" />
              Pagar com pacote
            </label>
            <select
              {...register('clientPackageId')}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            >
              <option value="">Nenhum — cobrar preço normal</option>
              {eligiblePackages.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  {cp.package.name} — {cp.sessionsRemaining} sessões de {cp.package.service.name} restantes
                </option>
              ))}
            </select>
            {selectedPackage && (
              <p className="text-xs text-amber-600">
                Serviço travado em "{selectedPackage.package.service.name}" — 1 sessão será debitada do pacote
              </p>
            )}
          </div>
        )}

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
                    <label
                      key={s.id}
                      className="flex items-center gap-2 rounded px-2 py-1 hover:bg-zinc-50 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        value={s.id}
                        checked={field.value?.includes(s.id)}
                        disabled={!!selectedPackage}
                        onChange={(e) => {
                          const val = e.target.value
                          const current = field.value || []
                          field.onChange(
                            e.target.checked ? [...current, val] : current.filter((v) => v !== val),
                          )
                        }}
                        className="accent-amber-500 disabled:opacity-50"
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
          <textarea
            {...register('notes')}
            rows={2}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
          />
        </div>

        {mutation.error && <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEdit ? 'Salvar' : 'Agendar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
