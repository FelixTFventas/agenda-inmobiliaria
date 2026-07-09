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

Calendarios usados por asesor:
- `Paola Crespo`: `810f08fc5f25465b02f063c8377b8fd8b691be7be34edb386111239586e15998@group.calendar.google.com`
- `Yunior Lara`: `asesorventasfelixtrujillo@gmail.com`
- `Patricia Trujillo`: `4c9d88289e74511e476b6a8d131bab7179c2f5a1b711097b62367d3b13f6f695@group.calendar.google.com`
- `Harold Trujillo`: `1344b30c158727690510a312d648d03bcd114c17eab04012e071c606e8bf7300@group.calendar.google.com`
- `Cristian Rojas`: `b6d0495d06c467e5fc0d7ac0602b68f242fd053200ac849ec1acaceeec68fef3@group.calendar.google.com`

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
- La app crea la cita en Google Calendar del asesor seleccionado y registra el resultado en Google Sheets.
