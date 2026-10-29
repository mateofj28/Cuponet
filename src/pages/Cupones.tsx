import { Ticket } from "lucide-react"
import { couponService } from "@/services"
import { CouponCard } from "@/components/cupones/CouponCard"

export function Cupones() {
  const cupones = couponService.listarVigentes()

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-semibold">Cupones</h1>
        <p className="text-sm text-muted-foreground">
          Descuentos vigentes de comercios asociados.
        </p>
      </div>

      {cupones.length === 0 ? (
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
