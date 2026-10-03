import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { createClient, updateClient } from '../../api/clients.api'
import type { Client } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  client?: Client | null
}

interface FormData {
  name: string
  phone: string
  email: string
  notes: string
}

export function ClientFormModal({ open, onClose, client }: Props) {
  const qc = useQueryClient()
  const isEdit = !!client

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  useEffect(() => {
    reset({
      name: client?.name || '',
      phone: client?.phone || '',
      email: client?.email || '',
      notes: client?.notes || '',
    })
  }, [client, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? updateClient(client!.id, data) : createClient(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      onClose()
    },
  })

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Cliente' : 'Novo Cliente'}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input label="Nome *" {...register('name', { required: 'Obrigatório' })} error={errors.name?.message} />
        <Input label="Telefone *" {...register('phone', { required: 'Obrigatório' })} placeholder="(11) 99999-9999" error={errors.phone?.message} />
        <Input label="E-mail" type="email" {...register('email')} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Observações</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            placeholder="Preferências, alergias..."
          />
        </div>
        {mutation.error && <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={mutation.isPending}>{isEdit ? 'Salvar' : 'Cadastrar'}</Button>
        </div>
      </form>
    </Modal>
  )
}
