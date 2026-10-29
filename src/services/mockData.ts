import { addDays, addHours, subDays } from "date-fns"
import type {
  Comercio,
  Cupon,
  Inscripcion,
  Movimiento,
  Plan,
  Sorteo,
  User,
} from "./types"

const now = new Date()
const iso = (d: Date) => d.toISOString()

/** Saldo de regalo para el cliente de prueba (conveniencia del mock, ver design.md). */
export const SALDO_REGALO_INICIAL = 500

export const PLANES: Plan[] = [
  { id: "plan1", nombre: "Plan 1", meses: 1, costoCreditos: 100 },
  { id: "plan3", nombre: "Plan 3", meses: 3, costoCreditos: 250 },
  { id: "black", nombre: "Plan Black", meses: 12, costoCreditos: 800 },
]

/**
 * Datos semilla. Se clonan al iniciar cada servicio para que el mock
 * sea mutable en memoria sin alterar estas constantes de referencia.
 */
export const seedUsers: User[] = [
  {
    id: "u-admin",
    nombre: "Administrador",
    email: "admin@cuponet.com",
    password: "admin123",
    role: "admin",
    creditos: 0,
    membresia: null,
  },
  {
    id: "u-cliente",
    nombre: "Cliente Demo",
    email: "cliente@cuponet.com",
    password: "cliente123",
    role: "cliente",
    creditos: SALDO_REGALO_INICIAL, // saldo de regalo para recorrer el flujo
    membresia: null, // arranca sin membresía
  },
]

export const seedComercios: Comercio[] = [
  {
    id: "c-sabores",
    nombre: "Sabores del Centro",
    instagramUrl: "https://instagram.com/saboresdelcentro",
  },
  {
    id: "c-cafe",
    nombre: "Café Aroma",
    instagramUrl: "https://instagram.com/cafearoma",
  },
  {
    id: "c-fit",
    nombre: "Gimnasio FitLife",
    instagramUrl: "https://instagram.com/fitlife",
  },
  {
    id: "c-moda",
    nombre: "Moda Urbana",
    instagramUrl: "https://instagram.com/modaurbana",
  },
]

export const seedCupones: Cupon[] = [
  {
    id: "cup-1",
    comercioId: "c-sabores",
    titulo: "30% en comida",
    descripcion: "30% de descuento en todo el menú de almuerzo.",
    descuento: "30%",
    vencimiento: iso(addDays(now, 15)),
  },
  {
    id: "cup-2",
    comercioId: "c-cafe",
    titulo: "2x1 en cafés",
    descripcion: "Llevá dos cafés pagando uno, de lunes a viernes.",
    descuento: "2x1",
    vencimiento: iso(addDays(now, 7)),
  },
  {
    id: "cup-3",
    comercioId: "c-fit",
    titulo: "50% primera cuota",
    descripcion: "Mitad de precio en tu primer mes de gimnasio.",
    descuento: "50%",
    vencimiento: iso(addDays(now, 30)),
  },
  {
    id: "cup-4",
    comercioId: "c-moda",
    titulo: "25% en indumentaria",
    descripcion: "25% off en toda la colección de temporada.",
    descuento: "25%",
    vencimiento: iso(addDays(now, 3)),
  },
  {
    // Cupón vencido para probar R3.4 (impedir canje de vencidos)
    id: "cup-vencido",
    comercioId: "c-sabores",
    titulo: "15% en cenas (vencido)",
    descripcion: "Promoción expirada, no debería poder canjearse.",
    descuento: "15%",
    vencimiento: iso(subDays(now, 2)),
  },
]

export const seedSorteos: Sorteo[] = [
  {
    id: "sorteo-1",
    titulo: "Sorteo del mes",
    productoPrincipal: "Smart TV 50''",
    productosSecundarios: ["Auriculares inalámbricos", "Gift card $5.000"],
    cierre: iso(addDays(now, 5)),
    numerosEnJuego: 100,
    costoCreditos: 50,
    estado: "activo",
  },
  {
    id: "sorteo-2",
    titulo: "Sorteo gamer",
    productoPrincipal: "Consola de videojuegos",
    productosSecundarios: ["Joystick extra"],
    cierre: iso(addDays(now, 10)),
    numerosEnJuego: 200,
    costoCreditos: 80,
    estado: "activo",
  },
  {
    // Próximo a cerrar para probar R4.5 (cierre por cuenta regresiva)
    id: "sorteo-pronto",
    titulo: "Sorteo flash",
    productoPrincipal: "Cafetera express",
    productosSecundarios: [],
    cierre: iso(addHours(now, 2)),
    numerosEnJuego: 50,
    costoCreditos: 30,
    estado: "activo",
  },
]

export const seedInscripciones: Inscripcion[] = []

export const seedMovimientos: Movimiento[] = []
