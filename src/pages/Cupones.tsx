import { Loader2, Ticket } from "lucide-react"
import { couponService } from "@/services"
import { useAsync } from "@/hooks/useAsync"
import { CouponCard } from "@/components/cupones/CouponCard"

export function Cupones() {
  const { data: cupones, loading } = useAsync(
    () => couponService.listarVigentes(),
    []
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-semibold">Cupones</h1>
        <p className="text-sm text-muted-foreground">
          Descuentos vigentes de comercios asociados.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !cupones || cupones.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Ticket className="size-8" />
          <p className="text-sm">Por ahora no hay cupones disponibles.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cupones.map((cupon) => (
            <CouponCard key={cupon.id} cupon={cupon} />
          ))}
        </div>
      )}
    </div>
  )
}
