-- Script SQL para testar a estrutura das tabelas
-- Execute este script para verificar os dados disponíveis

-- 1. Verificar estrutura da tabela apontamentos
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'joaoafiune' 
  AND table_name = 'apontamentos'
ORDER BY ordinal_position;

-- 2. Verificar estrutura da tabela paradas_rendimento
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'joaoafiune' 
  AND table_name = 'paradas_rendimento'
ORDER BY ordinal_position;

-- 3. Contar registros em apontamentos
SELECT COUNT(*) as total_apontamentos 
FROM joaoafiune.apontamentos;

-- 4. Contar registros em paradas_rendimento
SELECT COUNT(*) as total_paradas 
FROM joaoafiune.paradas_rendimento;

-- 5. Visualizar primeiros registros de apontamentos
SELECT * 
FROM joaoafiune.apontamentos 
LIMIT 5;

-- 6. Visualizar primeiros registros de paradas_rendimento
SELECT * 
FROM joaoafiune.paradas_rendimento 
LIMIT 5;

-- 7. Verificar colunas que contêm 'hora' no nome em apontamentos
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'joaoafiune' 
  AND table_name = 'apontamentos'
  AND (column_name ILIKE '%hora%' OR column_name ILIKE '%time%' OR column_name ILIKE '%duracao%');

-- 8. Verificar colunas que contêm 'faturamento' ou 'valor' no nome
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'joaoafiune' 
  AND table_name = 'apontamentos'
  AND (column_name ILIKE '%faturamento%' OR column_name ILIKE '%valor%' OR column_name ILIKE '%preco%');

-- 9. Verificar colunas de data em ambas as tabelas
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'joaoafiune' 
  AND table_name IN ('apontamentos', 'paradas_rendimento')
  AND (data_type ILIKE '%date%' OR data_type ILIKE '%time%')
ORDER BY table_name, column_name;

-- 10. Análise rápida de paradas
SELECT 
    COALESCE(tipo_parada, motivo, descricao, 'Sem descrição')::text as tipo_parada,
    COUNT(*) as quantidade
FROM joaoafiune.paradas_rendimento
GROUP BY COALESCE(tipo_parada, motivo, descricao, 'Sem descrição')::text
ORDER BY quantidade DESC
LIMIT 10;
