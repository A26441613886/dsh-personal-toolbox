import { DatabaseSync, backup } from 'node:sqlite';
import { existsSync } from 'node:fs';
// SQLite online backup includes committed WAL data without stopping the writer.
export async function backupSpending(source, destination) {
  if (existsSync(destination)) throw Error('Spending backup destination already exists');
  const db = new DatabaseSync(source, { readOnly: true });
  try {
    await backup(db, destination);
    const copy = new DatabaseSync(destination, { readOnly: true });
    try { if (copy.prepare('PRAGMA quick_check').get().quick_check !== 'ok') throw Error('Spending backup integrity check failed'); }
    finally { copy.close(); }
  } finally { db.close(); }
}
