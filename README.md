# Deploy

MySQL db + NextJS app

Para buildar a imagem, tenha as variáveis de ambiente no `.env`, e rode o seguinte comando:

```bash
docker build .
```

## Atualizando o banco de dados

Gere as migrações necessárias usando

```bash
pnpm db:migrations
```

Escreva scripts de alterações de dados já existentes, caso as migrações possam causar percas de dados.

Rode esses scripts entrando no container mysql:

```bash
docker exec -it container_name_or_id /bin/bash
```

E aplicando os scripts no banco de dados:

```bash
mysql -u DB_USER -p DB_NAME < /path/to/scripts/script.sql
```
