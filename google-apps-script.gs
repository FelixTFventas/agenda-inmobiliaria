const SHEET_NAME = 'Citas';
const CALENDAR_ID = 'f3907a67a115e0dd3a6aa84559989b1eff1809dacc0962801da02d062a4d9c81@group.calendar.google.com';

function doPost(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
    const payload = JSON.parse(e.postData.contents || '{}');
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);

    if (!calendar) {
      throw new Error('No se encontro el calendario compartido configurado.');
    }

    const startTime = parseDateTime(payload.fecha, payload.hora_inicio);
    const endTime = parseDateTime(payload.fecha, payload.hora_fin);

    if (!startTime || !endTime || endTime <= startTime) {
      throw new Error('La fecha u horario de la cita no es valido.');
    }

    const event = calendar.createEvent(
      buildTitle(payload),
      startTime,
      endTime,
      {
        description: buildDescription(payload)
      }
    );
    const eventLink = buildEventLink(event.getId());

    ensureHeader(sheet);

    sheet.appendRow([
      payload.id || '',
      payload.cliente || '',
      payload.telefono || '',
      payload.propiedad || '',
      payload.asesor || '',
      payload.fecha || '',
      payload.hora_inicio || '',
      payload.hora_fin || '',
      payload.creado_en || new Date().toISOString(),
      event.getId(),
      eventLink
    ]);

    return jsonResponse({
      status: 'success',
      eventId: event.getId(),
      eventLink: eventLink
    });
  } catch (error) {
    return jsonResponse({
      status: 'error',
      message: error.message
    });
  }
}

function doGet() {
  return jsonResponse({ status: 'success', message: 'Apps Script activo' });
}

function ensureHeader(sheet) {
  const headers = [
    'id',
    'cliente',
    'telefono',
    'propiedad',
    'asesor',
    'fecha',
    'hora_inicio',
    'hora_fin',
    'creado_en',
    'calendar_event_id',
    'calendar_event_link'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    return;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];

  headers.forEach(function (header, index) {
    if (currentHeaders[index] !== header) {
      sheet.getRange(1, index + 1).setValue(header);
    }
  });
}

function buildTitle(payload) {
  return 'Visita ' + (payload.propiedad || '') + ' - ' + (payload.cliente || '');
}

function buildDescription(payload) {
  return [
    'Cliente: ' + (payload.cliente || ''),
    'Telefono: ' + (payload.telefono || ''),
    'Asesor: ' + (payload.asesor || ''),
    'Propiedad: ' + (payload.propiedad || '')
  ].join('\n');
}

function parseDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const parts = String(dateValue).split('-');
  const timeParts = String(timeValue).split(':');

  if (parts.length !== 3 || timeParts.length < 2) {
    return null;
  }

  return new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2]),
    Number(timeParts[0]),
    Number(timeParts[1]),
    0,
    0
  );
}

function buildEventLink(eventId) {
  const encoded = Utilities.base64EncodeWebSafe(eventId + ' ' + CALENDAR_ID);
  return 'https://calendar.google.com/calendar/event?eid=' + encoded;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
