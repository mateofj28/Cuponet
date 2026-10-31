import { useEffect, useState } from "react"
import { Loader2, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { adminService, type UsuarioAdmin } from "@/services"
import { useDebounce } from "@/hooks/useDebounce"
import { formatCreditos } from "@/lib/format"

interface UserSearchProps {
  /** Cliente seleccionado (o null). */
  value: UsuarioAdmin | null
  onSelect: (user: UsuarioAdmin | null) => void
}

/**
 * Buscador con autocompletado de clientes por email o DNI (RA5).
 * Consulta dinámicamente (con debounce) y muestra coincidencias.
 */
export function UserSearch({ value, onSelect }: UserSearchProps) {
  const [texto, setTexto] = useState("")
  const [resultados, setResultados] = useState<UsuarioAdmin[]>([])
  const [buscando, setBuscando] = useState(false)
  const query = useDebounce(texto, 300)

  useEffect(() => {
    let activo = true
    const q = query.trim()
    if (q.length < 2) {
      setResultados([])
      return
    }
    setBuscando(true)
    adminService.buscarUsuarios(q).then((res) => {
      if (activo) {
        setResultados(res)
        setBuscando(false)
      }
    })
    return () => {
      activo = false
    }
  }, [query])

  // Si ya hay un cliente elegido, mostramos el "chip" y un botón para cambiar.
  if (value) {
    return (
      <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {value.nombre} {value.apellido ?? ""}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {value.email} · {formatCreditos(value.creditos)} pts
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            onSelect(null)
            setTexto("")
          }}
          aria-label="Cambiar cliente"
        >
          <X className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        {buscando && (
          <Loader2 className="absolute right-2.5 top-2.5 size-4 animate-spin text-muted-foreground" />
        )}
        <Input
          className="pl-8"
          placeholder="Buscar por email o DNI"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      {query.trim().length >= 2 && (
        <div className="rounded-md border">
          {resultados.length === 0 && !buscando ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              Sin coincidencias.
            </p>
          ) : (
            resultados.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => onSelect(u)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {u.nombre} {u.apellido ?? ""}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {u.email}
                    {u.dni ? ` · DNI ${u.dni}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatCreditos(u.creditos)} pts
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
