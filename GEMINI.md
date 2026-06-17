# Cubs Server - Documentação do Backend

Este arquivo contém as instruções e regras para o sub-projeto `cubs-server`. 

## Estrutura de Diretórios e Responsabilidades

Abaixo está o detalhamento de como as pastas dentro de `src/` estão organizadas e o que deve ser colocado em cada uma:

### `src/server.ts`
- **Responsabilidade**: Ponto de entrada (entry point) da aplicação server.
- **Regras**: Contém as configurações iniciais, inicialização do servidor, registro de rotas e middlewares principais. Não deve conter lógica de negócios complexa.

### `src/core/`
- **Responsabilidade**: Camada de infraestrutura e abstração do banco de dados (o "coração" do gerenciamento de requisições do projeto).
- **Regras**: É aqui que reside a camada de desenvolvimento responsável por gerenciar as requests ao `raft > rqlite/sqlite`.
- **Sub-pastas**:
  - `database/`: Contém os geradores de SQL (`sql-builder.ts`), construção de tabelas/esquemas (`schema-builder.ts`), e a classe/modelo base de abstração de dados (`model.ts`). Responsável também pelas lógicas de migration e conexões subjacentes. As requisições diretas ao banco de dados não devem sair dessa camada.

### `src/models/`
- **Responsabilidade**: Modelos de domínio e schemas.
- **Regras**: Representam as entidades do negócio (ex: `user-model.ts`, `workspace-model.ts`). Os modelos estendem ou utilizam as funcionalidades expostas pela camada `core/` para interagir com o banco de dados. 
- **Sub-pastas**:
  - `schemas/`: Contém definições e validações mais estritas das entidades, como tipos esperados e formatos de dados.

### `src/services/`
- **Responsabilidade**: Lógica de negócios.
- **Regras**: As regras complexas da aplicação vivem aqui (ex: `users-service.ts`, `workspaces-service.ts`). Os services processam os dados, aplicam as regras de negócio e invocam os arquivos de `models/` para leitura e persistência. Services não devem possuir SQL raw, delegando essa tarefa para a abstração criada.

### `src/types/`
- **Responsabilidade**: Tipagens globais do TypeScript.
- **Regras**: Interfaces e Types genéricos (ex: `rqlite-response.d.ts`, `types.d.ts`) e definições de domínio como `user-types.ts` devem residir aqui para que fiquem acessíveis a todo o servidor e evitem problemas de referências circulares.

### `src/utils/`
- **Responsabilidade**: Funções auxiliares, helpers genéricos e integrações isoladas (como o `sendRequest.ts`).
- **Regras**: O código contido aqui deve ser genérico e reutilizável por diferentes partes do sistema, sem depender fortemente do domínio (models/services) do projeto.

## Convenções Adicionais
- **Banco de Dados**: Sempre respeite a camada criada em `src/core` ao invés de injetar código SQL direto no código das aplicações.
- **Estilo**: Siga os padrões locais, com separadores do tipo kebab-case para nomes de arquivo (ex: `users-service.ts`, `schema-builder.ts`) e o uso rigoroso de tipagem segura do TypeScript.

## Arquitetura de Containers (Docker)

O projeto contém uma pasta `docker/` dedicada a orquestrar os serviços externos (inicialmente o **rqlite**). Optamos por uma arquitetura flexível que suporta desde testes em desenvolvimento local (DEV) até implementações multi-nós em Produção (PROD), sem a necessidade de alterar os arquivos base.

### Fluxo de Variáveis de Ambiente

As inicializações de containers dependem do `.env` (baseado no `.env.example`). O arquivo `entrypoint.sh` gerencia de forma inteligente a definição do IP que o nó informa aos demais (`Advertise IP`):
- **Desenvolvimento Local (Única máquina):** Não defina a variável `RQLITE_ADVERTISE_IP`. O container descobrirá seu próprio IP da rede do Docker automaticamente.
- **Desenvolvimento (Múltiplas Máquinas) ou PROD:** Defina a variável `RQLITE_ADVERTISE_IP` com o IP roteável da máquina física. Isso garante que outros nós em máquinas diferentes consigam alcançar este serviço na porta 4001 e 4002.

### Inicialização Padrão

Para inicializar a infraestrutura, navegue para a pasta `cubs-server` e utilize o compose passando os parâmetros do `.env`.

#### Subindo o Nó Líder (Primeiro Nó)
Para o primeiro nó do banco, deixe as configurações assim no `.env` e suba o compose:

```env
# IP Externo se for PROD/Rede Externa. Vazio para testes locais
RQLITE_ADVERTISE_IP=
NODE_ID=1
JOIN_NODE=
```
```bash
docker-compose -f docker/docker-compose.yml up -d
```

#### Adicionando Nós Secundários (Workers)
Em uma **nova máquina ou instância**, ajuste as configurações no `.env` para informar quem é o líder:

```env
RQLITE_ADVERTISE_IP=192.168.1.101 # IP DESTA máquina
NODE_ID=2 # ID único e não repetido
JOIN_NODE=192.168.1.100:8000 # IP DO LÍDER:8000
```
E suba com o mesmo comando compose acima. O `entrypoint.sh` injetará automaticamente a flag `-join`.

---

## Testes e Execução Prática

Aqui está o guia passo a passo de como rodar e testar essa estrutura na prática, baseado no fluxo validado:

### 1. Ambiente DEV Local (Única Máquina)

Se você vai rodar o código do `cubs-server` no mesmo computador em que os containers estão subindo:

1. **Configuração:**
   Copie o arquivo `.env.example` para `.env` na raiz do `cubs-server`. Mantenha `RQLITE_ADVERTISE_IP` e `JOIN_NODE` em branco.
   ```bash
   cp .env.example .env
   ```
2. **Inicialização:**
   Navegue até a pasta `docker` e suba os containers referenciando o `.env`:
   ```bash
   cd docker
   docker compose --env-file ../.env up -d --build
   ```
3. **Validação:**
   Verifique se o nó LÍDER subiu corretamente batendo na API:
   ```bash
   curl -s http://localhost:8000/status
   ```
   Seu código Node (`cubs-server/src/...`) deverá se comunicar com o banco através da URL `http://localhost:8000`.

### 2. Adicionando Nós em Outras Máquinas (Ex: Nova VM na mesma rede)

Se você subir uma VM local para testar o cluster Raft (alta disponibilidade), precisará conectar a VM ao nó Líder (a sua máquina original).

#### Na sua máquina Host (O Líder)
Descubra o IP local da sua máquina (ex: `192.168.1.50`). Altere o `.env` para expor (advertir) esse IP:
```env
RQLITE_ADVERTISE_IP=192.168.1.50
NODE_ID=1
JOIN_NODE=
```
Derrube e suba o compose novamente.

#### Na sua VM (O Worker)
1. Clone o repositório e crie o `.env`.
2. Configure o `.env` para informar o IP da VM e se juntar ao Líder:
```env
# Exemplo assumindo que a VM pegou o IP 192.168.1.60
RQLITE_ADVERTISE_IP=192.168.1.60
NODE_ID=2
# Comunicação interna Raft e HTTP - aponte sempre para a porta anunciada pelo líder
JOIN_NODE=192.168.1.50:8000
```
3. Navegue até a pasta `docker` e inicie:
```bash
docker compose --env-file ../.env up -d --build
```
4. **Validando a Conexão:** Ao rodar `curl http://192.168.1.60:8000/status` na sua VM, na chave `cluster`, você verá que os dados do líder estarão apontando para o IP do seu Host Original (`192.168.1.50`).

### Comandos Úteis
- **Ver os logs do banco:** `docker compose logs -f rqlite`
- **Descer a infraestrutura limpando os dados salvos:** `docker compose down -v`

# Solução do Erro de Cluster (Resolvido)

O erro reportado por Helder foi causado por dois fatores principais:

1.  **Ordem dos Argumentos no `entrypoint.sh`**: O comando `rqlited` exige que o diretório de dados (`/rqlite/file`) seja o **último** argumento. No script original, o parâmetro `-join` estava sendo adicionado após o diretório, o que causava o erro `arguments after data directory (/rqlite/file) are not accepted`.
2.  **Porta no `JOIN_NODE`**: Ao conectar nós em máquinas diferentes (ou entre WSL e VM), é obrigatório informar a porta exposta (neste projeto, a **8000**). O rqlite não assume automaticamente a porta 8000 se você passar apenas o IP.

### Mudanças Realizadas:
-   **`docker/rqlite/entrypoint.sh`**: Refatorado para garantir que os argumentos sejam construídos dinamicamente e que `/rqlite/file` seja sempre o último parâmetro. Também adicionamos uma verificação para garantir o prefixo `http://` no endereço de join.

### Como configurar agora (Exemplo Corrigido):

**No Leader (WSL):**
```env
RQLITE_ADVERTISE_IP=172.29.22.198
NODE_ID=1
JOIN_NODE=
```

**Na VM (Worker):**
```env
RQLITE_ADVERTISE_IP=192.168.56.101
NODE_ID=2
# IMPORTANTE: Inclua a porta :8000
JOIN_NODE=172.29.22.198:8000
```

### Validação
Após as mudanças, ao subir o container na VM, o log deve mostrar:
`Juntando-se ao cluster pelo líder: http://172.29.22.198:8000`
E o comando `curl http://172.29.22.198:8000/status` (no Líder) deve listar dois nós no campo `nodes`.

