const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

// Definir schema padrão
pool.on('connect', (client) => {
  client.query(`SET search_path TO ${process.env.DB_SCHEMA}, public`);
});

// Testar conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:');
    console.error('   Mensagem:', err.message);
    console.error('   Código:', err.code);
    console.error('   Host:', process.env.DB_HOST);
    console.error('   Porta:', process.env.DB_PORT);
    console.error('   Database:', process.env.DB_NAME);
    console.error('   User:', process.env.DB_USER);
    console.error('   Schema:', process.env.DB_SCHEMA);
  } else {
    console.log('✅ Conectado ao PostgreSQL Railway em:', res.rows[0].now);
  }
});

module.exports = pool;
