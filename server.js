import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongoDB } from './src/config/mongodb.js';
import { connectPostgres } from './src/config/postgres.js';
import { startBackupCron } from './src/utils/cronJobs.js';
import extractPoseRoutes from './src/routes/extractPose.routes.js';
import recordsRoutes from './src/routes/records.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', extractPoseRoutes);
app.use('/api', recordsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      port: PORT
    }
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to databases
    await connectMongoDB();
    await connectPostgres();
    
    // Start cron jobs
    startBackupCron();
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// changes korlo..............
