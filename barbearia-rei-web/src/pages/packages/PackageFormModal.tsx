import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { createPackage, updatePackage } from '../../api/packages.api'
import { listServices } from '../../api/services.api'
import type { Package } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  pkg?: Package | null
}

interface FormData {
  name: string
  description: string
  serviceId: string
  totalSessions: number
  price: number
  validityDays: number | ''
}

export function PackageFormModal({ open, onClose, pkg }: Props) {
  const qc = useQueryClient()
  const isEdit = !!pkg

  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => listServices(true) })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>()

  useEffect(() => {
    if (pkg) {
      reset({
        name: pkg.name,
        description: pkg.description || '',
        serviceId: pkg.service.id,
        totalSessions: pkg.totalSessions,
        price: pkg.price,
        validityDays: pkg.validityDays ?? '',
      })
    } else {
      reset({ name: '', description: '', serviceId: '', totalSessions: 10, price: 0, validityDays: '' })
    }
  }, [pkg, reset])

  const mutation = useMutation({
    mutationFn: (d: FormData) => {
      const payload = {
        name: d.name,
        description: d.description || undefined,
        serviceId: d.serviceId,
        totalSessions: Number(d.totalSessions),
        price: Number(d.price),
        validityDays: d.validityDays === '' ? undefined : Number(d.validityDays),
      }
      return isEdit ? updatePackage(pkg!.id, payload) : createPackage(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packages'] })
      onClose()
    },
  })

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Pacote' : 'Novo Pacote'}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input
          label="Nome *"
          placeholder="Ex: 10 Cortes"
          {...register('name', { required: 'Obrigatório' })}
          error={errors.name?.message}
        />
        <Input label="Descrição" {...register('description')} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Serviço coberto *</label>
          <select
            {...register('serviceId', { required: 'Obrigatório' })}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
          >
            <option value="">Selecione...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.serviceId && <span className="text-xs text-red-500">{errors.serviceId.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nº de sessões *"
            type="number"
            min="1"
            {...register('totalSessions', { required: 'Obrigatório', valueAsNumber: true })}
            error={errors.totalSessions?.message}
          />
          <Input
            label="Preço do pacote (R$) *"
            type="number"
            step="0.01"
            min="0"
            {...register('price', { required: 'Obrigatório', valueAsNumber: true })}
            error={errors.price?.message}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Validade (dias)</label>
          <Input
            type="number"
            min="1"
            placeholder="Deixe em branco pra não expirar"
            {...register('validityDays')}
          />
        </div>

        {mutation.error && <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEdit ? 'Salvar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
