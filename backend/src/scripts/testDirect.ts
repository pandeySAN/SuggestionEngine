import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'suggestion_engine',
  username: 'postgres',
  password: 'postgres123',
  logging: console.log,
});

const test = async () => {
  try {
    console.log('Testing direct connection...');
    await sequelize.authenticate();
    console.log('✅ Connection successful!');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Sync successful!');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

test();