import type { Agenda, Appointment } from './OperationsPage'

const time = (value: string) =>
  new Date(value).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
const statusLabels: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em atendimento',
  COMPLETED: 'Concluído',
}

export function AgendaTimeline({
  agenda,
  date,
  select,
  removeBlock,
  canEdit,
}: {
  agenda: Agenda
  date: string
  select: (appointment: Appointment) => void
  removeBlock: (id: string) => void
  canEdit: boolean
}) {
  const minute = (value: string) =>
    Math.max(
      0,
      Math.min(
        1440,
        (new Date(value).getTime() - new Date(`${date}T00:00:00`).getTime()) /
          60000,
      ),
    )
  if (!agenda.barbers.length)
    return (
      <p className="bg-white rounded-xl border p-8 text-zinc-500">
        Cadastre um profissional para começar.
      </p>
    )
  const active = agenda.appointments.filter(
    (a) => !['CANCELLED', 'NO_SHOW'].includes(a.status),
  )
  const start = Math.min(
    8 * 60,
    ...active.map((a) => Math.floor(minute(a.startsAt) / 60) * 60),
    ...agenda.blocks.map((b) => Math.floor(minute(b.startsAt) / 60) * 60),
  )
  const end = Math.max(
    20 * 60,
    ...active.map((a) => Math.ceil(minute(a.endsAt) / 60) * 60),
    ...agenda.blocks.map((b) => Math.ceil(minute(b.endsAt) / 60) * 60),
  )
  const hours = Array.from(
    { length: Math.ceil((end - start) / 60) },
    (_, i) => start + i * 60,
  )
  const columns = {
    gridTemplateColumns: `52px repeat(${agenda.barbers.length}, minmax(240px, 1fr))`,
  }
  return (
    <div
      className="max-h-[620px] overflow-auto rounded-2xl border border-zinc-200 bg-white"
      aria-label="Grade de horários por profissional"
    >
      <div
        className="grid sticky top-0 z-20 bg-zinc-50 border-b"
        style={columns}
      >
        <div className="p-3 text-xs text-zinc-500">Hora</div>
        {agenda.barbers.map((b) => (
          <h2 key={b.id} className="p-3 font-semibold border-l">
            {b.name}
          </h2>
        ))}
      </div>
      <div className="grid" style={columns}>
        <div className="relative" style={{ height: (end - start) * 2 }}>
          {hours.map((h) => (
            <span
              key={h}
              className="absolute left-2 text-xs text-zinc-400"
              style={{ top: (h - start) * 2 + 4 }}
            >
              {String(h / 60).padStart(2, '0')}:00
            </span>
          ))}
        </div>
        {agenda.barbers.map((b) => (
          <div
            key={b.id}
            className="relative border-l"
            style={{ height: (end - start) * 2 }}
          >
            {hours.map((h) => (
              <div
                key={h}
                className="absolute w-full border-t border-zinc-100"
                style={{ top: (h - start) * 2, height: 120 }}
              >
                <div className="absolute top-[60px] w-full border-t border-dashed border-zinc-100" />
              </div>
            ))}
            {agenda.blocks
              .filter((block) => block.barberId === b.id)
              .map((block) => (
                <div
                  key={block.id}
                  className="absolute inset-x-1 z-10 rounded-lg border border-dashed bg-zinc-200/90 p-2 text-xs overflow-hidden"
                  style={{
                    top: (minute(block.startsAt) - start) * 2,
                    height: Math.max(
                      30,
                      (minute(block.endsAt) - minute(block.startsAt)) * 2,
                    ),
                  }}
                >
                  <p>
                    {time(block.startsAt)}–{time(block.endsAt)} · {block.reason}
                  </p>
                  {canEdit && (
                    <button
                      className="underline mt-1"
                      onClick={() => removeBlock(block.id)}
                    >
                      Liberar
                    </button>
                  )}
                </div>
              ))}
            {active
              .filter((a) => a.barber.id === b.id)
              .flatMap((a) =>
                (a.segments.length
                  ? a.segments
                  : [
                      {
                        id: a.id,
                        kind: 'ACTIVE',
                        startsAt: a.startsAt,
                        endsAt: a.endsAt,
                      },
                    ]
                ).map((segment) => {
                  const height = Math.max(
                    30,
                    (minute(segment.endsAt) - minute(segment.startsAt)) * 2,
                  )
                  const processing = segment.kind === 'PROCESSING'
                  return (
                    <button
                      key={segment.id}
                      title={`${a.client.name} · ${a.services.map((s) => s.service.name).join(', ')} · ${statusLabels[a.status]}`}
                      onClick={() => select(a)}
                      className={`absolute inset-x-1 text-left rounded-lg border-l-4 border px-2 py-1 overflow-hidden ${processing ? 'z-0 border-dashed border-l-sky-300 bg-sky-50/60 text-sky-700' : a.status === 'COMPLETED' ? 'z-10 border-l-emerald-500 bg-emerald-50' : 'z-10 border-l-amber-500 bg-amber-50'}`}
                      style={{
                        top: (minute(segment.startsAt) - start) * 2,
                        height,
                      }}
                    >
                      <p className="text-[10px] font-semibold truncate">
                        {time(segment.startsAt)}–{time(segment.endsAt)} ·{' '}
                        {processing ? 'Pausa' : statusLabels[a.status]}
                      </p>
                      <p className="font-semibold text-xs truncate">
                        {a.client.name}
                      </p>
                      {height >= 70 && !processing && (
                        <p className="text-xs text-zinc-500 truncate">
                          {a.services.map((s) => s.service.name).join(' + ')}
                        </p>
                      )}
                    </button>
                  )
                }),
              )}
          </div>
        ))}
      </div>
    </div>
  )
}
