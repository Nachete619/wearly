# Wearly

Red social web dedicada a la **moda local**, con un feed visual al estilo Pinterest.

**[Ver demo en vivo](https://wearly-seven.vercel.app)**

> Proyecto desarrollado en equipo de 2 personas durante el ciclo técnico en la E.E.T. N.º 3139 "Martín Miguel de Güemes" (Salta, Argentina). Fue probado y evaluado por docentes del colegio.

<!--
COMPLETAR: agregá acá una captura de pantalla o un GIF corto de la app.
1. Creá una carpeta `docs/` en el repo y subí la imagen (ej: docs/home.png).
2. Descomentá la línea de abajo.

![Pantalla principal de Wearly](docs/home.png)
-->

## Funcionalidades

- Feed visual de publicaciones organizado al estilo Pinterest.
- Interfaz construida con componentes reutilizables.

<!--
COMPLETAR: sumá una viñeta por cada función que realmente tenga la app. Ejemplos, borrá lo que no aplique:
- Registro e inicio de sesión de usuarios
- Publicar looks con imágenes
- Perfiles de usuario
- Guardar o dar "me gusta" a publicaciones
- Buscador o filtros por categoría / estilo / marca
- Diseño responsive (celular y computadora)
-->

## Tecnologías

| Área | Herramientas |
|------|--------------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) y [React 18](https://react.dev/) |
| Lenguaje | [TypeScript](https://www.typescriptlang.org/) |
| Estilos | [Tailwind CSS](https://tailwindcss.com/) y [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) |
| Componentes de UI | [shadcn/ui](https://ui.shadcn.com/) sobre [Radix UI](https://www.radix-ui.com/) |
| Backend / datos | [Supabase](https://supabase.com/) (`@supabase/ssr` y `supabase-js`) |
| Despliegue | [Vercel](https://vercel.com/) |

## Estructura del proyecto

```
wearly/
├── app/          # Rutas y páginas (Next.js App Router)
├── components/   # Componentes reutilizables de la interfaz
├── hooks/        # Hooks personalizados de React
├── lib/          # Utilidades y funciones auxiliares
├── public/       # Archivos estáticos (imágenes, íconos)
└── styles/       # Estilos globales
```

## Cómo correrlo en tu computadora

Requisitos: [Node.js](https://nodejs.org/) 18.17 o superior y una cuenta gratuita de [Supabase](https://supabase.com/).

```bash
# 1. Clonar el repositorio
git clone https://github.com/Nachete619/wearly.git
cd wearly

# 2. Instalar dependencias
npm install

# 3. Configurar las variables de entorno (ver la sección siguiente)
cp .env.example .env.local

# 4. Iniciar el servidor de desarrollo
npm run dev
```

Después abrí [http://localhost:3000](http://localhost:3000) en el navegador.

### Variables de entorno

Creá un archivo `.env.local` en la raíz del proyecto con los datos de tu proyecto de Supabase (los encontrás en *Project Settings → API*):

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

> Nunca subas el archivo `.env.local` al repositorio.

<!--
COMPLETAR antes de subir:
1. Verificá que los nombres de las variables coincidan con los que usa tu código (buscá "process.env" en el proyecto).
   Si usás más variables, agregalas acá.
2. Creá un archivo `.env.example` con esos mismos nombres y valores vacíos para que el paso 3 funcione.
-->

## Scripts disponibles

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la versión de producción |
| `npm run start` | Ejecuta la versión de producción |
| `npm run lint` | Revisa el código con ESLint |

También podés usar `pnpm` en lugar de `npm`.

## Autor

**Ignacio Arias** · Técnico en Informática y estudiante de la Tecnicatura Universitaria en Programación (UNSa)

- GitHub: [@Nachete619](https://github.com/Nachete619)
- Email: ignacionicolasarias25@gmail.com

## Otros proyectos

- [StreamApp](https://github.com/Nachete619/StreamApp): plataforma de streaming en vivo con IA que resume lo ocurrido en los videos.
