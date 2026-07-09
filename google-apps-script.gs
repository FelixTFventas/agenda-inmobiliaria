const SHEET_NAME = 'Citas';
const DEFAULT_DURATION_MINUTES = 45;
const ADVISOR_CALENDARS = {
  'Paola Crespo': '810f08fc5f25465b02f063c8377b8fd8b691be7be34edb386111239586e15998@group.calendar.google.com',
  'Yunior Lara': 'asesorventasfelixtrujillo@gmail.com',
  'Patricia Trujillo': '4c9d88289e74511e476b6a8d131bab7179c2f5a1b711097b62367d3b13f6f695@group.calendar.google.com',
  'Harold Trujillo': '1344b30c158727690510a312d648d03bcd114c17eab04012e071c606e8bf7300@group.calendar.google.com',
  'Cristian Rojas': 'b6d0495d06c467e5fc0d7ac0602b68f242fd053200ac849ec1acaceeec68fef3@group.calendar.google.com'
};
const ADVISOR_EVENT_COLORS = {
  'Paola Crespo': CalendarApp.EventColor.BLUE,
  'Yunior Lara': CalendarApp.EventColor.GREEN,
  'Patricia Trujillo': CalendarApp.EventColor.RED,
  'Harold Trujillo': CalendarApp.EventColor.MAUVE,
  'Cristian Rojas': CalendarApp.EventColor.ORANGE
};

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    return jsonResponse(handleAppointment(payload));
  } catch (error) {
    return jsonResponse({
      status: 'error',
      message: error.message
    });
  }
}

function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.action === 'createAppointment') {
      const payload = JSON.parse(e.parameter.payload || '{}');
      const result = handleAppointment(payload);
      return callbackResponse(result, e.parameter.callback);
    }

    return jsonResponse({ status: 'success', message: 'Apps Script activo' });
  } catch (error) {
    const response = {
      status: 'error',
      message: error.message
    };

    return callbackResponse(response, e && e.parameter && e.parameter.callback);
  }
}

function handleAppointment(payload) {
  validatePayload(payload);

  const calendarId = ADVISOR_CALENDARS[payload.asesor];

  if (!calendarId) {
    throw new Error('No se encontro un calendario configurado para el asesor seleccionado.');
  }

  const calendar = CalendarApp.getCalendarById(calendarId);

  if (!calendar) {
    throw new Error('No se encontro el calendario configurado.');
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  const durationMinutes = Number(payload.duracion_minutos) || DEFAULT_DURATION_MINUTES;
  const startDate = parseDateTime(payload.fecha, payload.hora_inicio);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  let event = null;
  let eventCreated = false;
  let appointmentStatus = 'creado';
  let errorMessage = '';
  let reviewFlag = 'NO';

  ensureHeader(sheet);

  try {
    event = calendar.createEvent(
      buildTitle(payload),
      startDate,
      endDate,
      { description: buildDescription(payload) }
    );
    applyAdvisorColor(event, payload.asesor);
    eventCreated = true;
  } catch (error) {
    appointmentStatus = 'error_calendar';
    errorMessage = error.message;
    reviewFlag = 'SI';
  }

  const row = [
    payload.id || '',
    payload.cliente || '',
    payload.telefono || '',
    payload.propiedad || '',
    payload.equipo || '',
    payload.asesor || '',
    payload.fecha || '',
    payload.hora_inicio || '',
    durationMinutes,
    eventCreated && event ? event.getId() : '',
    appointmentStatus,
    errorMessage,
    reviewFlag,
    payload.creado_en || new Date().toISOString()
  ];

  try {
    sheet.appendRow(row);
  } catch (error) {
    return {
      status: 'success',
      eventCreated: eventCreated,
      eventId: eventCreated && event ? event.getId() : '',
      sheetSaved: false,
      appointmentStatus: eventCreated ? 'warning_sheet' : appointmentStatus,
      review: eventCreated ? 'NO' : reviewFlag,
      message: eventCreated
        ? 'La cita se creo en Google Calendar, pero no se pudo guardar en Google Sheets.'
        : 'No se pudo guardar la cita en Google Sheets y tampoco se creo el evento en Calendar.',
      error: eventCreated ? error.message : errorMessage || error.message
    };
  }

  return {
    status: 'success',
    eventCreated: eventCreated,
    eventId: eventCreated && event ? event.getId() : '',
    sheetSaved: true,
    appointmentStatus: appointmentStatus,
    review: reviewFlag,
    message: eventCreated
      ? 'La cita se creo correctamente en Google Calendar.'
      : 'La cita se guardo para revision, pero no se pudo crear el evento en Calendar.',
    error: errorMessage
  };
}

function ensureHeader(sheet) {
  const headers = [
    'id',
    'cliente',
    'telefono',
    'propiedad',
    'equipo',
    'asesor',
    'fecha',
    'hora_inicio',
    'duracion_minutos',
    'calendar_event_id',
    'estado',
    'error',
    'revisar',
    'creado_en'
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
    'Equipo: ' + (payload.equipo || ''),
    'Asesor: ' + (payload.asesor || ''),
    'Propiedad: ' + (payload.propiedad || '')
  ].join('\n');
}

function applyAdvisorColor(event, advisor) {
  const eventColor = ADVISOR_EVENT_COLORS[advisor];

  if (!eventColor) {
    return;
  }

  event.setColor(eventColor);
}

function validatePayload(payload) {
  const requiredFields = ['cliente', 'telefono', 'propiedad', 'equipo', 'asesor', 'fecha', 'hora_inicio'];

  for (var i = 0; i < requiredFields.length; i += 1) {
    if (!payload[requiredFields[i]]) {
      throw new Error('Falta el campo obligatorio: ' + requiredFields[i]);
    }
  }
}

function parseDateTime(dateValue, timeValue) {
  const dateParts = String(dateValue || '').split('-');
  const timeParts = String(timeValue || '').split(':');

  if (dateParts.length !== 3 || timeParts.length < 2) {
    throw new Error('La fecha u hora no tienen un formato valido.');
  }

  return new Date(
    Number(dateParts[0]),
    Number(dateParts[1]) - 1,
    Number(dateParts[2]),
    Number(timeParts[0]),
    Number(timeParts[1]),
    0,
    0
  );
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function callbackResponse(data, callback) {
  if (!callback) {
    return jsonResponse(data);
  }

  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(data) + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
