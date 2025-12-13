import cron from 'node-cron';
import { performBackup } from './backup.js';

export const startBackupCron = () => {
  // Run daily at 11:59 PM
  cron.schedule('59 23 * * *', async () => {
    console.log('🔄 Starting scheduled backup...');
    try {
      await performBackup();
      console.log('✅ Scheduled backup completed successfully');
    } catch (error) {
      console.error('❌ Scheduled backup failed:', error);
    }
  });

  console.log('⏰ Backup cron job scheduled for 11:59 PM daily');
};
