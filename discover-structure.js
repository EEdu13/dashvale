const pool = require('./database');
require('dotenv').config();

async function discoverTables() {
  console.log('🔍 Descobrindo estrutura das tabelas...\n');
  
  try {
    // Informações da tabela apontamentos
    console.log('📋 Tabela: APONTAMENTOS');
    console.log('='.repeat(60));
    const apontamentos = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = 'apontamentos'
      ORDER BY ordinal_position
    `, [process.env.DB_SCHEMA]);
    
    console.table(apontamentos.rows);
    
    // Primeiro registro de apontamentos
    console.log('\n📌 Primeiro registro de apontamentos:');
    const firstApontamento = await pool.query(`
      SELECT * FROM ${process.env.DB_SCHEMA}.apontamentos LIMIT 1
    `);
    console.log(JSON.stringify(firstApontamento.rows[0], null, 2));
    
    // Informações da tabela paradas_rendimento
    console.log('\n\n⚠️  Tabela: PARADAS_RENDIMENTO');
    console.log('='.repeat(60));
    const paradas = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = 'paradas_rendimento'
      ORDER BY ordinal_position
    `, [process.env.DB_SCHEMA]);
    
    console.table(paradas.rows);
    
    // Primeiro registro de paradas
    console.log('\n📌 Primeiro registro de paradas_rendimento:');
    const firstParada = await pool.query(`
      SELECT * FROM ${process.env.DB_SCHEMA}.paradas_rendimento LIMIT 1
    `);
    console.log(JSON.stringify(firstParada.rows[0], null, 2));
    
    // Contagem de registros
    console.log('\n\n📊 RESUMO DOS DADOS:');
    console.log('='.repeat(60));
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM ${process.env.DB_SCHEMA}.apontamentos) as total_apontamentos,
        (SELECT COUNT(*) FROM ${process.env.DB_SCHEMA}.paradas_rendimento) as total_paradas
    `);
    console.table(counts.rows);
    
    console.log('\n✅ Análise concluída!');
    console.log('\nAgora você pode ajustar as queries do server.js com os nomes corretos das colunas.');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit();
  }
}

discoverTables();
