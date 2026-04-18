import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('=== Current Environment ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('Parsed URL parts:');

const url = process.env.DATABASE_URL || '';
try {
  const urlObj = new URL(url);
  console.log('Protocol:', urlObj.protocol);
  console.log('Username:', urlObj.username);
  console.log('Password:', urlObj.password);
  console.log('Host:', urlObj.hostname);
  console.log('Port:', urlObj.port);
  console.log('Database:', urlObj.pathname.substring(1));
} catch (error) {
  console.error('Failed to parse URL:', error);
}