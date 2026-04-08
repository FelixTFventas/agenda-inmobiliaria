# Google Sheets Setup

1. Crea una hoja de calculo nueva en Google Sheets.
2. Abre `Extensiones > Apps Script`.
3. Pega el contenido de `google-apps-script.gs` en el editor.
4. Guarda el proyecto.
5. En `Implementar > Nueva implementacion`, elige `Aplicacion web`.
6. Configura:
   - Ejecutar como: tu cuenta
   - Quien tiene acceso: Cualquiera
7. Implementa y copia la URL terminada en `/exec`.
8. En la app, abre `Configurar Google Sheets` y pega esa URL.

Cada cita nueva se guardara en la hoja `Citas`.
