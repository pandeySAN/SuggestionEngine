import dotenv from 'dotenv';
import path from 'path';
import sequelize from '../config/database';
import { seedAuthorities } from '../utils/seedAuthorities';
import logger from '../config/logger';

// Load environment variables explicitly
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const runSeed = async () => {
  try {
    console.log('🌱 Starting seed process...');
    console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Found' : 'Missing');

    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    await seedAuthorities();

    console.log('✅ Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

runSeed();