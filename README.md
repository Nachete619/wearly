# Wearly

Red social web dedicada a la **moda local**, con un feed visual al estilo Pinterest donde se puede descubrir y compartir looks, marcas y estilos de la comunidad.

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
- Diseño responsive, pensado para usarse desde el celular y la computadora.
- Interfaz construida con componentes reutilizables.

<!--
COMPLETAR: sumá una viñeta por cada función que realmente tenga la app. Ejemplos, borrá lo que no aplique:
- Registro e inicio de sesión de usuarios
- Publicar looks con imágenes
- Perfiles de usuario
- Guardar o dar "me gusta" a publicaciones
- Buscador o filtros por categoría / estilo / marca
-->

## Tecnologías

| Área | Herramientas |
|------|--------------|
| Framework | [Next.js](https://nextjs.org/) y [React](https://react.dev/) |
| Lenguaje | [TypeScript](https://www.typescriptlang.org/) |
| Estilos | [Tailwind CSS](https://tailwindcss.com/) |
| Componentes de UI | [shadcn/ui](https://ui.shadcn.com/) |
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

Requisitos: [Node.js](https://nodejs.org/) 18 o superior.

```bash
# 1. Clonar el repositorio
git clone https://github.com/Nachete619/wearly.git
cd wearly

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Después abrí [http://localhost:3000](http://localhost:3000) en el navegador.

También podés usar `pnpm install` y `pnpm dev` si preferís pnpm.

<!--
COMPLETAR: si la app usa variables de entorno (por ejemplo claves de una base de datos o de un servicio de imágenes),
creá un archivo `.env.example` con los nombres (sin los valores reales) y explicalo acá. Si no usa ninguna, borrá este comentario.
-->

## Autor

**Ignacio Arias** · Técnico en Informática y estudiante de la Tecnicatura Universitaria en Programación (UNSa)

- GitHub: [@Nachete619](https://github.com/Nachete619)
- Email: ignacionicolasarias25@gmail.com

## Otros proyectos

- [StreamApp](https://github.com/Nachete619/StreamApp): plataforma de streaming en vivo con IA que resume lo ocurrido en los videos.
