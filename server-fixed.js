const express = require('express');
const cors = require('cors');
const pool = require('./database');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Obter estrutura das tabelas
app.get('/api/tables-info', async (req, res) => {
  try {
    const apontamentosInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = 'apontamentos'
      ORDER BY ordinal_position
    `, [process.env.DB_SCHEMA]);

    const paradasInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = 'paradas_rendimento'
      ORDER BY ordinal_position
    `, [process.env.DB_SCHEMA]);

    res.json({
      apontamentos: apontamentosInfo.rows,
      paradas_rendimento: paradasInfo.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API: Resumo geral
app.get('/api/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_apontamentos,
        COUNT(DISTINCT operador) as total_funcionarios,
        SUM(COALESCE(hi, 0) + COALESCE(hf, 0)) as total_horas,
        SUM(COALESCE(total_faturado, 0)) as total_faturamento
      FROM ${process.env.DB_SCHEMA}.apontamentos
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API: Paradas mais frequentes
app.get('/api/paradas-frequentes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(atividade, tipo_parada, 'Sem descrição') as parada,
        COUNT(*) as quantidade,
        SUM(
          CASE 
            WHEN total LIKE '%:%' THEN
              CAST(SPLIT_PART(total, ':', 1) AS INTEGER) + 
              CAST(SPLIT_PART(total, ':', 2) AS NUMERIC) / 60.0
            ELSE 0
          END
        ) as total_horas_paradas,
        ROUND(AVG(
          CASE 
            WHEN total LIKE '%:%' THEN
              CAST(SPLIT_PART(total, ':', 1) AS INTEGER) + 
              CAST(SPLIT_PART(total, ':', 2) AS NUMERIC) / 60.0
            ELSE 0
          END
        )::numeric, 2) as media_horas
      FROM ${process.env.DB_SCHEMA}.paradas_rendimento
      GROUP BY COALESCE(atividade, tipo_parada, 'Sem descrição')
      ORDER BY quantidade DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API: Horas por período
app.get('/api/horas-periodo', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('day', data::timestamp) as periodo,
        SUM(COALESCE(hi, 0) + COALESCE(hf, 0)) as total_horas,
        COUNT(*) as quantidade
      FROM ${process.env.DB_SCHEMA}.apontamentos
      WHERE data IS NOT NULL
      GROUP BY DATE_TRUNC('day', data::timestamp)
      ORDER BY periodo DESC
      LIMIT 30
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API: Faturamento por período
app.get('/api/faturamento-periodo', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('day', data::timestamp) as periodo,
        SUM(COALESCE(total_faturado, 0)) as total_faturamento,
        SUM(COALESCE(produzido, 0)) as total_produzido,
        COUNT(*) as quantidade
      FROM ${process.env.DB_SCHEMA}.apontamentos
      WHERE data IS NOT NULL
      GROUP BY DATE_TRUNC('day', data::timestamp)
      ORDER BY periodo DESC
      LIMIT 30
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API: Top funcionários por horas
app.get('/api/top-funcionarios-horas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(operador, 'Não identificado') as funcionario,
        SUM(COALESCE(hi, 0) + COALESCE(hf, 0)) as total_horas,
        COUNT(*) as total_apontamentos,
        SUM(COALESCE(total_faturado, 0)) as total_faturamento,
        SUM(COALESCE(produzido, 0)) as total_produzido
      FROM ${process.env.DB_SCHEMA}.apontamentos
      WHERE operador IS NOT NULL
      GROUP BY operador
      ORDER BY total_horas DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API: Impacto de paradas no faturamento
app.get('/api/impacto-paradas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('day', data::timestamp) as periodo,
        COUNT(*) as quantidade_paradas,
        SUM(
          CASE 
            WHEN total LIKE '%:%' THEN
              CAST(SPLIT_PART(total, ':', 1) AS INTEGER) + 
              CAST(SPLIT_PART(total, ':', 2) AS NUMERIC) / 60.0
            ELSE 0
          END
        ) as total_horas_paradas,
        AVG(COALESCE(producao, 0)) as producao_media
      FROM ${process.env.DB_SCHEMA}.paradas_rendimento
      WHERE data IS NOT NULL
      GROUP BY DATE_TRUNC('day', data::timestamp)
      ORDER BY periodo DESC
      LIMIT 30
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API: Análise de produtividade (horas vs paradas)
app.get('/api/produtividade', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH apontamentos_dia AS (
        SELECT 
          DATE_TRUNC('day', data::timestamp) as dia,
          SUM(COALESCE(hi, 0) + COALESCE(hf, 0)) as horas_trabalhadas,
          SUM(COALESCE(total_faturado, 0)) as faturamento,
          SUM(COALESCE(produzido, 0)) as producao
        FROM ${process.env.DB_SCHEMA}.apontamentos
        WHERE data IS NOT NULL
        GROUP BY DATE_TRUNC('day', data::timestamp)
      ),
      paradas_dia AS (
        SELECT 
          DATE_TRUNC('day', data::timestamp) as dia,
          SUM(
            CASE 
              WHEN total LIKE '%:%' THEN
                CAST(SPLIT_PART(total, ':', 1) AS INTEGER) + 
                CAST(SPLIT_PART(total, ':', 2) AS NUMERIC) / 60.0
              ELSE 0
            END
          ) as horas_paradas,
          COUNT(*) as quantidade_paradas
        FROM ${process.env.DB_SCHEMA}.paradas_rendimento
        WHERE data IS NOT NULL
        GROUP BY DATE_TRUNC('day', data::timestamp)
      )
      SELECT 
        COALESCE(a.dia, p.dia) as periodo,
        COALESCE(a.horas_trabalhadas, 0) as horas_trabalhadas,
        COALESCE(p.horas_paradas, 0) as horas_paradas,
        COALESCE(a.faturamento, 0) as faturamento,
        COALESCE(a.producao, 0) as producao,
        COALESCE(p.quantidade_paradas, 0) as quantidade_paradas,
        ROUND((COALESCE(a.horas_trabalhadas, 0) / NULLIF(COALESCE(a.horas_trabalhadas, 0) + COALESCE(p.horas_paradas, 0), 0) * 100)::numeric, 2) as taxa_produtividade
      FROM apontamentos_dia a
      FULL OUTER JOIN paradas_dia p ON a.dia = p.dia
      ORDER BY COALESCE(a.dia, p.dia) DESC
      LIMIT 30
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API: Análise por máquina
app.get('/api/maquinas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        maquina,
        COUNT(*) as total_apontamentos,
        SUM(COALESCE(hi, 0) + COALESCE(hf, 0)) as total_horas,
        SUM(COALESCE(produzido, 0)) as total_produzido,
        SUM(COALESCE(area_total, 0)) as area_total
      FROM ${process.env.DB_SCHEMA}.apontamentos
      WHERE maquina IS NOT NULL
      GROUP BY maquina
      ORDER BY total_horas DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API: Análise por atividade
app.get('/api/atividades', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        atividade,
        COUNT(*) as quantidade,
        SUM(COALESCE(hi, 0) + COALESCE(hf, 0)) as total_horas,
        SUM(COALESCE(produzido, 0)) as total_produzido,
        AVG(COALESCE(total_faturado, 0)) as media_faturamento
      FROM ${process.env.DB_SCHEMA}.apontamentos
      WHERE atividade IS NOT NULL
      GROUP BY atividade
      ORDER BY quantidade DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Dashboard disponível em http://localhost:${PORT}`);
});
