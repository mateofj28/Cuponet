import { Link } from "react-router-dom"
import { formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Store } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { CuponConComercio } from "@/services/coupon.service"

export function CouponCard({ cupon }: { cupon: CuponConComercio }) {
  return (
    <Link to={`/cupones/${cupon.id}`} className="group">
      <Card className="transition-colors group-hover:border-primary">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">{cupon.titulo}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Store className="size-3.5" />
                {cupon.comercio?.nombre ?? "Comercio"}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-accent-cupones">
              {cupon.descuento}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Vence{" "}
          {formatDistanceToNow(parseISO(cupon.vencimiento), {
            addSuffix: true,
            locale: es,
          })}
        </CardContent>
      </Card>
    </Link>
  )
}
