# 📊 Dashboard Analítico - Apontamentos & Paradas de Rendimento

Dashboard completo e profissional para análise de dados de apontamentos e paradas de rendimento, com gráficos interativos e métricas em tempo real conectado ao PostgreSQL Railway.

## 🚀 ACESSO RÁPIDO

**Dashboard**: http://localhost:3001  
**Status**: ✅ Funcionando  
**Banco**: ✅ PostgreSQL Railway Conectado

## 🚀 Funcionalidades

### 📈 Métricas e KPIs
- **Total de Apontamentos** - Quantidade total de registros
- **Total de Funcionários** - Número de colaboradores únicos
- **Total de Horas** - Soma de todas as horas trabalhadas
- **Faturamento Total** - Valor total gerado

### 📊 Gráficos Analíticos

1. **Paradas Mais Frequentes**
   - Visualização das paradas que mais ocorrem
   - Total de horas paradas por tipo
   - Média de duração

2. **Horas Trabalhadas por Período**
   - Evolução temporal das horas trabalhadas
   - Últimos 30 dias de dados

3. **Faturamento por Período**
   - Análise financeira diária
   - Identificação de picos e quedas

4. **Taxa de Produtividade**
   - Comparação entre horas trabalhadas vs paradas
   - Percentual de produtividade
   - Gráfico com dois eixos Y

5. **Top 10 Funcionários**
   - Ranking por horas trabalhadas
   - Faturamento individual
   - Quantidade de apontamentos

6. **Impacto de Paradas**
   - Quantidade de paradas por período
   - Total de horas perdidas
   - Impacto financeiro

### 📋 Tabela Detalhada
- Análise diária completa
- Taxa de produtividade colorida (verde/amarelo/vermelho)
- Dados exportáveis

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL (Railway)
- **Frontend**: HTML5, CSS3, JavaScript
- **Gráficos**: Chart.js 4.4.0
- **Libs**: pg, cors, dotenv

## 📦 Instalação

### Pré-requisitos
- Node.js 14+ instalado
- Acesso ao banco PostgreSQL Railway

### Passo a Passo

1. **Clone ou navegue até o diretório do projeto:**
```bash
cd C:\dashboard-analytics
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure o arquivo `.env`:**
O arquivo já está configurado com suas credenciais Railway:
```env
DB_HOST=ballast.proxy.rlwy.net
DB_PORT=21526
DB_USER=postgres
DB_PASSWORD=CqdPHkjnPksiOYxCKVZtFUUOIGDIlPNr
DB_NAME=railway
DB_SCHEMA=joaoafiune
PORT=3000
```

4. **Inicie o servidor:**
```bash
npm start
```

Ou para desenvolvimento com auto-reload:
```bash
npm run dev
```

5. **Acesse o dashboard:**
Abra seu navegador em: **http://localhost:3000**

## 📁 Estrutura do Projeto

```
dashboard-analytics/
├── public/
│   ├── index.html      # Interface do dashboard
│   ├── styles.css      # Estilos e design responsivo
│   └── app.js          # Lógica frontend e gráficos
├── database.js         # Configuração PostgreSQL
├── server.js           # API REST e endpoints
├── package.json        # Dependências
├── .env                # Credenciais (NÃO commitar!)
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### `GET /api/summary`
Retorna resumo geral dos dados

### `GET /api/paradas-frequentes`
Top 10 paradas mais frequentes

### `GET /api/horas-periodo`
Horas trabalhadas nos últimos 30 dias

### `GET /api/faturamento-periodo`
Faturamento diário dos últimos 30 dias

### `GET /api/top-funcionarios-horas`
Top 10 funcionários por horas trabalhadas

### `GET /api/impacto-paradas`
Análise de impacto de paradas por período

### `GET /api/produtividade`
Análise completa de produtividade (horas vs paradas)

### `GET /api/tables-info`
Informações sobre estrutura das tabelas

## 🎨 Características do Design

- ✅ **Responsivo** - Funciona em desktop, tablet e mobile
- ✅ **Dark Mode Ready** - Gradientes modernos
- ✅ **Animações** - Transições suaves
- ✅ **Loading States** - Feedback visual ao carregar
- ✅ **Auto-refresh** - Atualização automática a cada 5 minutos

## 📊 Queries SQL Inteligentes

O sistema utiliza queries otimizadas com:
- `COALESCE` para lidar com diferentes nomes de colunas
- `DATE_TRUNC` para agregações temporais
- `FULL OUTER JOIN` para análises completas
- CTEs (Common Table Expressions) para consultas complexas
- Tratamento de valores nulos

## 🔒 Segurança

- Credenciais em arquivo `.env` (não versionado)
- Conexão SSL com PostgreSQL
- Sanitização de inputs
- CORS configurado

## 🐛 Troubleshooting

### Erro de Conexão ao Banco
- Verifique se as credenciais no `.env` estão corretas
- Confirme se o IP está autorizado no Railway
- Teste a conexão manualmente

### Gráficos não aparecem
- Verifique o console do navegador (F12)
- Confirme se o servidor está rodando
- Limpe o cache do navegador

### Dados vazios
- Verifique se as tabelas existem no schema `joaoafiune`
- Confirme os nomes das colunas nas tabelas
- Use o endpoint `/api/tables-info` para debug

## 📝 Notas Importantes

1. As queries são **flexíveis** e tentam encontrar colunas com nomes similares
2. O sistema funciona mesmo com estruturas de tabela ligeiramente diferentes
3. Valores nulos são tratados automaticamente
4. Todas as datas são formatadas para pt-BR

## 🚀 Melhorias Futuras

- [ ] Exportar relatórios em PDF/Excel
- [ ] Filtros por data personalizados
- [ ] Notificações de paradas críticas
- [ ] Comparação entre períodos
- [ ] Dashboard de predição com ML
- [ ] Autenticação de usuários
- [ ] Logs de auditoria

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor no terminal
2. Inspecione o console do navegador
3. Teste os endpoints diretamente no navegador ou Postman

## 📄 Licença

ISC - Livre para uso e modificação

---

**Desenvolvido com ❤️ usando Node.js e Chart.js**

🎯 **Foco total em: Paradas | Horas | Faturamento**
