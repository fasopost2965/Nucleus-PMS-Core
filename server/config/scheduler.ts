import { db } from './db';

/**
 * Starts the server-side scheduler that automatically snapshots
 * primary configuration tables into the MySQL 'backups' table.
 */
export function startBackupScheduler() {
  console.log('[Scheduler] Initializing automated configuration backup scheduler...');

  const performBackupSnapshot = async () => {
    try {
      console.log('[Scheduler] Starting 24h automatic snapshot of primary configuration tables...');

      // Read current primary configuration tables
      const settings = await db.getCollection('settings');
      const system_config = await db.getCollection('system_config');
      const module_access = await db.getCollection('module_access');

      // Check if we have records to save
      if (settings.length === 0 && system_config.length === 0 && module_access.length === 0) {
        console.warn('[Scheduler] Skipping backup snapshot: primary config tables appear to be empty.');
        return;
      }

      const snapshot = {
        settings,
        system_config,
        module_access,
        timestamp: new Date().toISOString()
      };

      // Store in MySQL backups table (will fall back to JSON local file if offline)
      const newBackup = {
        id: Date.now(),
        backup_type: 'auto_24h',
        backup_data: JSON.stringify(snapshot),
        created_at: new Date().toISOString()
      };

      await db.insert('backups', newBackup);
      console.log('[Scheduler] Successfully saved 24h backup snapshot to "backups" table.');
    } catch (err: any) {
      console.error('[Scheduler] Automated backup snapshot failed:', err.message);
    }
  };

  // Run initial trigger 10 seconds after server boot
  setTimeout(() => {
    console.log('[Scheduler] Executing boot-time backup check...');
    performBackupSnapshot().catch(err => {
      console.error('[Scheduler] Boot-time backup execution error:', err);
    });
  }, 10000);

  // Set up recurring trigger every 24 hours
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    performBackupSnapshot().catch(err => {
      console.error('[Scheduler] Interval automatic backup execution error:', err);
    });
  }, TWENTY_FOUR_HOURS_MS);
}
