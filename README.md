# PawLink

Aplicación web adaptable de PawLink. Incluye la página de inicio, registro e inicio de sesión, los paneles de dueño, paseador y especialista, perfiles profesionales, búsqueda y reserva de paseos, gestión de mascotas, agenda de especialistas y seguimiento GPS.

## Abrir el proyecto

Usa Node.js 24. Ejecuta `npm ci` y `npm run dev`. `npm run build` genera el sitio en `dist/`. Puedes probar la versión de producción con `npm run preview`.

En **Iniciar Sesión**, expande **Probar con una cuenta de demostración** para elegir un perfil. También puedes registrar una cuenta local. Los datos, los perfiles creados, las reservas y las consultas se guardan en el navegador y pueden probarse cambiando de cuenta en ese mismo navegador. Las reservas de prueba no generan cobros. La aplicación estática no ofrece pagos, videollamadas, verificación de identidad ni sincronización entre dispositivos.

## GPS

**Mis Paseos → Empezar** abre el mapa desde la reserva. El rastreo requiere HTTPS o localhost y permiso de ubicación. Mantén la pestaña abierta mientras dure el paseo. El mapa utiliza Leaflet y OpenStreetMap. La ruta y las métricas se guardan en el historial del dispositivo.

## Diseño

El archivo de referencia es [PawLink Mockups App Web](https://www.figma.com/design/f5RnDupNFLOq7GCYG6GqB2/Pawlink-Mockups-App-Web). La aplicación usa las referencias de escritorio y de App v2 en móvil. Se compararon las referencias visuales de inicio, nosotros, inicio de sesión, búsqueda, panel del dueño y reservas. Las demás pantallas se implementaron con la estructura extraída del mismo archivo y los componentes de esas referencias.

## Azure Static Web Apps

El proyecto incluye un flujo de GitHub Actions. Para automatizar despliegues, configura el token de la Static Web App como secreto `AZURE_STATIC_WEB_APPS_API_TOKEN` y ejecuta **Actions → Azure Static Web Apps → Run workflow** en `main`. También puedes publicar el resultado de `npm run build` directamente en un recurso existente con `swa deploy ./dist --env production`.
