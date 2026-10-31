import { Loader2, Trophy } from "lucide-react"
import { raffleService } from "@/services"
import { useAsync } from "@/hooks/useAsync"
import { RaffleCard } from "@/components/sorteos/RaffleCard"

export function Sorteos() {
  const { data: sorteos, loading } = useAsync(
    () => raffleService.listarActivos(),
    []
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <Trophy className="size-5 text-accent-sorteos" />
          Sorteos
        </h1>
        <p className="text-sm text-muted-foreground">
          Participá con tus puntos y sumá oportunidades.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !sorteos || sorteos.length === 0 ? (
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
