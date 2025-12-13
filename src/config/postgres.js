import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

export const connectPostgres = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected');
    
    // Create table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS pose_keypoints (
        id SERIAL PRIMARY KEY,
        image_id VARCHAR(255) NOT NULL,
        keypoints_json JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
    process.exit(1);
  }
};

export default pool;
