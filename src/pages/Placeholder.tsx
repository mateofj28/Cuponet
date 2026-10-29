import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PlaceholderProps {
  title: string
}

/**
 * Página temporal usada mientras se implementan las pantallas reales
 * del spec. Se renderiza dentro del AppShell (header + bottom nav).
 */
export function Placeholder({ title }: PlaceholderProps) {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Pantalla en construcción.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Esta sección se implementa en las tareas siguientes del plan.
        </CardContent>
      </Card>
    </div>
  )
}
