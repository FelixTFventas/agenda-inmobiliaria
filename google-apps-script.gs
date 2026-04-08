const SHEET_NAME = 'Citas';

function doPost(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
    const payload = JSON.parse(e.postData.contents || '{}');

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
      payload.creado_en || new Date().toISOString()
    ]);

    return jsonResponse({ status: 'success' });
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
  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    'id',
    'cliente',
    'telefono',
    'propiedad',
    'asesor',
    'fecha',
    'hora_inicio',
    'hora_fin',
    'creado_en'
  ]);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
