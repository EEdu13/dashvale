# Configuração do Railway

## ⚠️ Problema Atual
O dashboard está rodando em https://dashvale-production.up.railway.app/ mas não está carregando dados porque as **variáveis de ambiente não estão configuradas**.

## 🔧 Solução - Configurar Variáveis de Ambiente no Railway

### Passo 1: Acessar o Dashboard do Railway
1. Acesse: https://railway.app/
2. Faça login
3. Selecione o projeto **dashvale**

### Passo 2: Configurar as Variáveis
1. Clique na aba **Variables** ou **Settings**
2. Adicione as seguintes variáveis de ambiente:

```
DB_HOST=ballast.proxy.rlwy.net
DB_PORT=21526
DB_USER=postgres
DB_PASSWORD=CqdPHkjnPksiOYxCKVZtFUUOIGDIlPNr
DB_NAME=railway
DB_SCHEMA=joaoafiune
PORT=8080
NODE_ENV=production
```

### Passo 3: Fazer Deploy Novamente
Após adicionar as variáveis, o Railway vai fazer um **redeploy automático**.

Se não fizer automaticamente:
1. Clique em **Deploy**
2. Ou faça um novo push no GitHub (qualquer alteração)

### Passo 4: Verificar Logs
1. Acesse a aba **Logs** ou **Deployments**
2. Verifique se aparece:
   - ✅ Conectado ao PostgreSQL Railway em: [timestamp]
3. Se aparecer erro de conexão, verifique se as variáveis foram salvas corretamente

## 🎯 Resultado Esperado
Após configurar, o dashboard em https://dashvale-production.up.railway.app/ deve:
- ✅ Carregar todos os 6 cards com dados
- ✅ Renderizar os 9 gráficos
- ✅ Mostrar as 3 tabelas com informações
- ✅ Conectar ao banco PostgreSQL da Railway

## 📝 Notas Importantes
- O servidor já está configurado para usar `process.env.PORT` (Railway define automaticamente)
- O arquivo `.env` local NÃO é enviado para o Railway (está no .gitignore)
- As variáveis precisam ser configuradas manualmente no painel do Railway
- O SSL está configurado para aceitar certificados autoassinados (`rejectUnauthorized: false`)

## 🐛 Troubleshooting
Se ainda não funcionar:
1. Verifique os logs no Railway para ver mensagens de erro
2. Confirme que todas as variáveis foram salvas (não tem espaços extras)
3. Teste a conexão do banco usando as credenciais fornecidas
4. Verifique se o schema `joaoafiune` existe no banco
