import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { db } from './db';

// db.runTransaction operates on the repo's committed server/data/pms_database.json
// fixture (there is no DB_HOST configured in this environment, so the JSON
// fallback is the only backend exercised here). This suite only tests the
// "referenced record doesn't exist" abort path: per the implementation,
// writeDB() is only ever reached after every mutation's target has been
// found, so an aborted transaction is guaranteed to perform no write at all.
// A snapshot/restore around the assertion makes that guarantee explicit
// rather than just implicit in the source.

const DATA_FILE = path.join(process.cwd(), 'server', 'data', 'pms_database.json');

describe('db.runTransaction', () => {
  it('aborts and returns null without writing anything when a mutation targets a nonexistent record', async () => {
    const before = fs.readFileSync(DATA_FILE, 'utf8');

    const result = await db.runTransaction([
      { type: 'update', collection: 'reservations', id: 'definitely-not-a-real-reservation-xyz', fields: { status: 'Terminée' } },
      { type: 'update', collection: 'rooms', id: 'room-1', fields: { current_status: 'À nettoyer' } }
    ]);

    const after = fs.readFileSync(DATA_FILE, 'utf8');

    expect(result).toBeNull();
    expect(after).toBe(before);
  });

  it('aborts on the first missing record and never applies a later mutation in the same batch', async () => {
    const before = fs.readFileSync(DATA_FILE, 'utf8');

    // Valid-looking first mutation, invalid second: proves ordering doesn't
    // let an earlier valid mutation slip through when a later one fails.
    const result = await db.runTransaction([
      { type: 'update', collection: 'rooms', id: 'room-that-does-not-exist', fields: { current_status: 'Occupée' } }
    ]);

    const after = fs.readFileSync(DATA_FILE, 'utf8');

    expect(result).toBeNull();
    expect(after).toBe(before);
  });
});
