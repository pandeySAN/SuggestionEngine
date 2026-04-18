import { Client } from 'pg';

const testConnection = async () => {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres123',
    database: 'postgres', // Connect to default database first
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // List all databases
    const result = await client.query('SELECT datname FROM pg_database');
    console.log('\nDatabases:');
    result.rows.forEach((row: any) => console.log('  -', row.datname));

    // Try to connect to suggestion_engine
    await client.end();
    
    const client2 = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres123',
      database: 'suggestion_engine',
    });

    await client2.connect();
    console.log('\n✅ Successfully connected to suggestion_engine database!');
    
    // List tables
    const tables = await client2.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('\nTables:', tables.rows.length);
    
    await client2.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testConnection();