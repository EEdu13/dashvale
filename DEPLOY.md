# 🚀 Deploy do Dashboard

## Configuração de Variáveis de Ambiente

O aplicativo precisa das seguintes variáveis de ambiente configuradas:

### Obrigatórias:
```env
DB_HOST=ballast.proxy.rlwy.net
DB_PORT=21526
DB_USER=postgres
DB_PASSWORD=CqdPHkjnPksiOYxCKVZtFUUOIGDIlPNr
DB_NAME=railway
DB_SCHEMA=joaoafiune
```

### Opcionais:
```env
PORT=8080  # Porta do servidor (padrão: 3001)
```

## Deploy no Railway / Render / Vercel

### 1. Configure as variáveis de ambiente no painel do serviço

### 2. O arquivo `.env` não é commitado (está no .gitignore)

### 3. Use o arquivo `.env.example` como referência

### 4. Comando de start:
```bash
npm start
```

## Estrutura de Arquivos Necessários

```
dashboard-analytics/
├── .env (NÃO COMMITAR - criar no servidor)
├── .env.example (template)
├── package.json
├── server.js
├── database.js
├── public/
│   ├── index.html
│   ├── app.js
│   └── styles.css
└── node_modules/
```

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] .env criado no servidor (se necessário)
- [ ] npm install executado
- [ ] Porta configurada (PORT env var)
- [ ] Banco de dados acessível
- [ ] SSL habilitado para PostgreSQL

## Portas

- **Desenvolvimento**: 3001
- **Produção**: Usar variável PORT (geralmente 8080 ou 3000)

## Conexão com Banco

O aplicativo usa PostgreSQL com SSL.
Certifique-se de que o IP do servidor está autorizado no Railway.
