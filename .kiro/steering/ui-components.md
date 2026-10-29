# UI y Componentes

## Librería de UI: shadcn/ui (única permitida)

Para toda la interfaz de usuario de Cuponet se usa **exclusivamente [shadcn/ui](https://ui.shadcn.com/)**.

No se debe instalar, importar ni proponer ninguna otra librería de componentes de UI, por ejemplo: MUI (Material UI), Ant Design, Chakra UI, Mantine, React-Bootstrap, HeroUI, PrimeReact u otras equivalentes. Si una tarea parece requerir otra librería, detente y proponlo primero; no la agregues por defecto.

## Reglas

- **Componentes nuevos de UI**: agrégalos con el CLI de shadcn, nunca los escribas a mano desde cero ni los copies de otra librería.
  ```bash
  npx shadcn@latest add <componente>
  ```
- **Ubicación**: los componentes de shadcn viven en `src/components/ui/`. Los componentes propios de la app van en `src/components/` (fuera de `ui/`), y pueden componerse a partir de los de shadcn.
- **Estilado**: usa **Tailwind CSS v4** (ya configurado) y las variables de tema de shadcn. Evita CSS suelto o librerías de estilos paralelas (styled-components, emotion, etc.) salvo que se acuerde explícitamente.
- **Clases condicionales**: usa el helper `cn` de `@/lib/utils` para combinar clases.
- **Imports**: usa el alias `@/` (p. ej. `import { Button } from "@/components/ui/button"`).
- **Iconos**: usa `lucide-react` (la librería de iconos configurada en `components.json`).
- **Primitivas**: la base configurada es Radix (`radix-nova`). Para comportamiento accesible (dialog, dropdown, etc.) usa lo que shadcn provee sobre Radix.

## Configuración de referencia

- `components.json` contiene la configuración de shadcn (style, aliases, baseColor `neutral`, iconos `lucide`).
- No edites a mano los archivos generados en `src/components/ui/` salvo para personalizaciones puntuales e intencionales.
