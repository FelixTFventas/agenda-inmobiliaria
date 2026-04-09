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
8. Autoriza tambien el acceso a Google Calendar cuando Apps Script lo solicite.
9. En la app, abre `Configurar Google Sheets` y pega esa URL.

Cada cita nueva se guardara en la hoja `Citas`.

Calendarios usados:
- `Ventas`: `f3907a67a115e0dd3a6aa84559989b1eff1809dacc0962801da02d062a4d9c81@group.calendar.google.com`
- `Arriendo`: `e011c9c835c657b151a32cee1e71e17c2fd035d6875c3014482cd44c078e40c3@group.calendar.google.com`

Columnas registradas:
- `id`
- `cliente`
- `telefono`
- `propiedad`
- `equipo`
- `asesor`
- `fecha`
- `hora_inicio`
- `duracion_minutos`
- `calendar_event_id`
- `estado`
- `error`
- `revisar`
- `creado_en`

Comportamiento del flujo:
- Si el evento se crea en Google Calendar, la fila queda con `estado = creado` y `revisar = NO`.
- Si falla Google Calendar, la cita igual se guarda en la hoja con `estado = error_calendar` y `revisar = SI`.
- La app crea la cita en Google Calendar del equipo seleccionado y registra el resultado en Google Sheets.
