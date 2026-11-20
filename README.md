# Portfolio de Diego

Portfolio personal de Diego (plugins de Minecraft, bots de Discord, networks y splitters).
Es una web estática publicada gratis en **GitHub Pages**: https://ethsynx.github.io/portfolio/

Basado en la plantilla **Minecraft Server Developer Portfolio** de **Electro** (licencia MIT).

## Añadir o cambiar un proyecto

1. Crea una carpeta en `public/proyectos/` (por ejemplo `public/proyectos/miplugin/`) y mete dentro
   la portada (16:9), las capturas y el archivo descargable (.jar, .zip…).
2. Abre `src/config/proyectos.ts`, copia uno de los proyectos que ya hay, pégalo y cambia los textos.
   Las rutas de los archivos se escriben sin `public/`, por ejemplo `"proyectos/miplugin/portada.png"`.
3. Sube los cambios desde el terminal de VS Code:

   ```bash
   git add .
   git commit -m "Añado el proyecto X"
   git push
   ```

En un par de minutos la web se actualiza sola. Puedes ver cómo va en la pestaña **Actions** del
repositorio en GitHub.

- Para ocultar un proyecto sin borrarlo, pon `publicado: false`.
- El orden de la lista es el orden en que salen en la web.
- GitHub no admite archivos de más de 100 MB.

## Ver la web en tu ordenador antes de subirla

```bash
npm install     # solo la primera vez
npm run dev
```

Abre `http://localhost:8080`.

## Qué editar

| Qué                                      | Dónde                                                    |
| ---------------------------------------- | -------------------------------------------------------- |
| Proyectos                                | `src/config/proyectos.ts`                                |
| Imágenes y descargas de los proyectos    | `public/proyectos/`                                      |
| Nombre, textos, «Sobre mí», Discord, SEO | `src/config/site.ts`                                     |
| Comandos de la consola de demo           | `src/components/site/Terminal.tsx`                       |
| Colores                                  | `src/styles.css` (`--primary`)                           |
| Logo                                     | `src/components/site/Logo.tsx` y los iconos de `public/` |

## Cómo se publica

`.github/workflows/publicar.yml` compila la web cada vez que se sube algo a la rama `main`
(`npx vite build` genera el HTML de la página) y publica la carpeta `.output/public` en GitHub Pages.

> Antes la web tenía un panel privado `/admin` con base de datos. Se quitó para poder alojarla gratis
> en GitHub Pages; sigue en el historial de Git (commit `4aef541`) por si algún día se quiere recuperar.

## Créditos

Plantilla original diseñada y desarrollada por **Electro** (MIT). Iconos de [Lucide](https://lucide.dev).
Esta web no está afiliada a Mojang, Microsoft ni Discord.
