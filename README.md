# PawLink · GPS de paseos

Aplicación web adaptable basada en «Mis Paseos» de PawLink para escritorio y móvil. Registra el recorrido del dispositivo con geolocalización, muestra distancia y duración, permite pausar y continuar, y conserva el historial en el navegador. Incluye un recorrido de ejemplo de Miraflores, Lima, separado del historial real.

## Desarrollo local

Con Node.js 24, ejecuta `npm ci` y `npm run dev`. Abre la dirección que muestra Vite. `npm run build` genera la aplicación en `dist/`.

El GPS requiere HTTPS o localhost y permiso de ubicación. Para registrar el recorrido, mantén la pestaña visible y la pantalla activa. Los paseos se guardan en el navegador del dispositivo que los registró. El mapa base usa Leaflet y OpenStreetMap.

## Azure Static Web Apps

Crea una Static Web App con el plan Free y «Other» como origen. En Azure, copia el token desde **Manage deployment token**. En GitHub, guarda el token en **Settings → Secrets and variables → Actions** con el nombre `AZURE_STATIC_WEB_APPS_API_TOKEN`. Ejecuta **Actions → Azure Static Web Apps → Run workflow** en la rama `main`. Los siguientes cambios en `main` se publicarán automáticamente.

La aplicación usa el recurso estático y no requiere una API, base de datos ni clave de mapas.
