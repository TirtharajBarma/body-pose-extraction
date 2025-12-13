import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import archiver from 'archiver';
import { sendBackupEmail } from './emailService.js';

const execAsync = promisify(exec);

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export const performBackup = async () => {
  const timestamp = new Date().toISOString().split('T')[0];
  const backupFileName = `${timestamp}-backup.zip`;
  const backupFilePath = path.join(BACKUP_DIR, backupFileName);
  
  const sqlFileName = `${timestamp}-postgres-backup.sql`;
  const mongoFileName = `${timestamp}-mongodb-backup.json`;
  
  const sqlFilePath = path.join(BACKUP_DIR, sqlFileName);
  const mongoFilePath = path.join(BACKUP_DIR, mongoFileName);

  try {
    console.log('📦 Exporting PostgreSQL database...');
    await exportPostgres(sqlFilePath);

    console.log('📦 Exporting MongoDB collection...');
    await exportMongoDB(mongoFilePath);

    console.log('🗜️  Creating ZIP archive...');
    await createZipArchive(backupFilePath, [
      { path: sqlFilePath, name: sqlFileName },
      { path: mongoFilePath, name: mongoFileName }
    ]);

    console.log('📧 Sending backup email...');
    await sendBackupEmail(backupFilePath, backupFileName);

    // Clean up individual backup files
    fs.unlinkSync(sqlFilePath);
    fs.unlinkSync(mongoFilePath);

    console.log(`✅ Backup completed: ${backupFileName}`);
    return backupFilePath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    
    // Clean up partial files
    [sqlFilePath, mongoFilePath, backupFilePath].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    
    throw error;
  }
};

const exportPostgres = async (outputPath) => {
  const { PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, PG_DATABASE } = process.env;
  
  const command = `PGPASSWORD="${PG_PASSWORD}" pg_dump -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${PG_DATABASE} -f ${outputPath}`;
  
  try {
    await execAsync(command);
  } catch (error) {
    throw new Error(`PostgreSQL export failed: ${error.message}`);
  }
};

const exportMongoDB = async (outputPath) => {
  const mongoUri = process.env.MONGO_URI;
  
  // Extract database name from URI
  const dbMatch = mongoUri.match(/\/([^/?]+)(\?|$)/);
  const dbName = dbMatch ? dbMatch[1] : 'pose_extraction';
  
  const command = `mongoexport --uri="${mongoUri}" --collection=images --out=${outputPath} --jsonArray`;
  
  try {
    await execAsync(command);
  } catch (error) {
    throw new Error(`MongoDB export failed: ${error.message}`);
  }
};

const createZipArchive = (outputPath, files) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      console.log(`Archive created: ${archive.pointer()} bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    files.forEach(file => {
      archive.file(file.path, { name: file.name });
    });

    archive.finalize();
  });
};
