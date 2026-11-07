// Reçoit les commentaires du site et les range dans l'onglet « Commentaires ».
const SHEET_NAME = 'Commentaires';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const p = (e && e.parameter) || {};
    const email = String(p.email || '').trim().slice(0, 200);
    const comment = String(p.comment || '').trim().slice(0, 2000);
    const recipe = String(p.recipe || '').trim().slice(0, 200);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !comment) return ok_();

    lock.waitLock(10000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(['Date', 'Recette', 'Email', 'Commentaire']);
      sh.setFrozenRows(1);
    }
    sh.appendRow([new Date(), safe_(recipe), safe_(email), safe_(comment)]);
  } catch (err) {
    // on ne renvoie jamais le détail de l'erreur au visiteur
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
  return ok_();
}

// Empêche qu'un texte commençant par = + - @ soit interprété comme une formule.
function safe_(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }
function ok_() { return ContentService.createTextOutput('ok'); }
