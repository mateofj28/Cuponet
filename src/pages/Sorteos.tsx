import { Trophy } from "lucide-react"
import { raffleService } from "@/services"
import { RaffleCard } from "@/components/sorteos/RaffleCard"

export function Sorteos() {
  const sorteos = raffleService.listarActivos()

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-semibold">Sorteos</h1>
        <p className="text-sm text-muted-foreground">
          Participá con tus créditos y sumá oportunidades.
        </p>
      </div>

      {sorteos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Trophy className="size-8" />
          <p className="text-sm">No hay sorteos activos en este momento.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorteos.map((sorteo) => (
            <RaffleCard key={sorteo.id} sorteo={sorteo} />
          ))}
        </div>
      )}
    </div>
  )
}
