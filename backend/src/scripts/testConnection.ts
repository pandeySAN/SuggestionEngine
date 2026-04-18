import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('=== Environment Variables ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('REDIS_URL:', process.env.REDIS_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Missing');
console.log('=============================');

import { Sequelize } from 'sequelize';

const testConnection = async () => {
  try {
    const sequelize = new Sequelize(process.env.DATABASE_URL!, {
      dialect: 'postgres',
      logging: console.log,
    });

    await sequelize.authenticate();
    console.log('✅ Connection successful!');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
};

testConnection();