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
JOIN_NODE=192.168.1.100:4002 # IP DO LÍDER:4002
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
JOIN_NODE=192.168.1.50:4002
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
# IMPORTANTE: Inclua a porta :4002 (Porta do Raft)
JOIN_NODE=172.29.22.198:4002
```

### Validação
Após as mudanças, ao subir o container na VM, o log deve mostrar:
`Juntando-se ao cluster pelo líder: 172.29.22.198:4002`
E o comando `curl http://172.29.22.198:8000/status` (no Líder) deve listar dois nós no campo `nodes`.

# Problema na VM

root@ifcblumenau:~# cd /home/ifcblumenau/cubs-students-ifc-blumenau/docker/
root@ifcblumenau:/home/ifcblumenau/cubs-students-ifc-blumenau/docker# docker compose --env-file ../.env up -d --build --force-recreate
WARN[0000] /home/ifcblumenau/cubs-students-ifc-blumenau/docker/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion 
[+] Building 3.6s (10/10) FINISHED                                                                                                                                                            
 => [internal] load local bake definitions                                                                                                                                               0.0s
 => => reading from stdin 566B                                                                                                                                                           0.0s
 => [internal] load build definition from Dockerfile                                                                                                                                     0.1s
 => => transferring dockerfile: 169B                                                                                                                                                     0.0s
 => [internal] load metadata for docker.io/rqlite/rqlite:latest                                                                                                                          1.4s
 => [internal] load .dockerignore                                                                                                                                                        0.0s
 => => transferring context: 2B                                                                                                                                                          0.0s
 => [internal] load build context                                                                                                                                                        0.0s
 => => transferring context: 35B                                                                                                                                                         0.0s
 => [1/3] FROM docker.io/rqlite/rqlite:latest@sha256:b247f5d1ddf8808f913ac46cc23f596ecaf96312f4d19528747e8b6480e05508                                                                    0.1s
 => => resolve docker.io/rqlite/rqlite:latest@sha256:b247f5d1ddf8808f913ac46cc23f596ecaf96312f4d19528747e8b6480e05508                                                                    0.1s
 => CACHED [2/3] COPY entrypoint.sh /entrypoint.sh                                                                                                                                       0.0s
 => CACHED [3/3] RUN chmod +x /entrypoint.sh                                                                                                                                             0.0s
 => exporting to image                                                                                                                                                                   0.7s
 => => exporting layers                                                                                                                                                                  0.0s
 => => exporting manifest sha256:9636486575e2b0aa6f9ca9ee5d2d67d13b1e7baf74427e062d6d1af2dae9196a                                                                                        0.0s
 => => exporting config sha256:e26f67321c063d2cfec6cbb0dca78b32beb8e4487d8ce25a603cc94eb73e748e                                                                                          0.0s
 => => exporting attestation manifest sha256:4606f4d3141b6a0a440d16fe4ebc7a9cd2bb442648aff771e7e00025c2250e1e                                                                            0.1s
 => => exporting manifest list sha256:996ed6a5e7a1a165440e16da4031982a27dbb50f9c6f2f1e22c3db9c06b8a20a                                                                                   0.1s
 => => naming to docker.io/library/docker-rqlite:latest                                                                                                                                  0.0s
 => => unpacking to docker.io/library/docker-rqlite:latest                                                                                                                               0.2s
 => resolving provenance for metadata file                                                                                                                                               0.0s
[+] up 3/3
 ✔ Image docker-rqlite       Built                                                                                                                                                        4.0s
 ✔ Volume docker_rqlite_data Created                                                                                                                                                      0.0s
 ✔ Container cubs-rqlite     Started                                                                                                                                                      1.9s
root@ifcblumenau:/home/ifcblumenau/cubs-students-ifc-blumenau/docker# docker ps
CONTAINER ID   IMAGE           COMMAND            CREATED         STATUS         PORTS                                                                                      NAMES
d0d27421aa83   docker-rqlite   "/entrypoint.sh"   8 seconds ago   Up 2 seconds   0.0.0.0:4002->4002/tcp, [::]:4002->4002/tcp, 0.0.0.0:8000->4001/tcp, [::]:8000->4001/tcp   cubs-rqlite
root@ifcblumenau:/home/ifcblumenau/cubs-students-ifc-blumenau/docker# docker ps
CONTAINER ID   IMAGE           COMMAND            CREATED          STATUS                         PORTS     NAMES
d0d27421aa83   docker-rqlite   "/entrypoint.sh"   16 seconds ago   Restarting (1) 2 seconds ago             cubs-rqlite
root@ifcblumenau:/home/ifcblumenau/cubs-students-ifc-blumenau/docker# docker logs cubs-rqlite
=== Iniciando Nó rqlite ===
IP Anunciado (Advertise IP): 192.168.56.101
Modo: WORKER
Juntando-se ao cluster pelo líder: 172.29.22.198:8000
Executando: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file

            _ _ _
           | (_) |
  _ __ __ _| |_| |_ ___
 | '__/ _  | | | __/ _ \   The lightweight, fault-tolerant,
 | | | (_| | | | ||  __/   relational database.
 |_|  \__, |_|_|\__\___|
         | |               www.rqlite.io
         |_|

[rqlited] 2026/06/17 22:45:51 rqlited starting, version v10.2.0, SQLite 3.53.0, commit 6809aa3b6f373b86aa4e1265b9c47bf5d09e1819, compiler (toolchain) gc, compiler (command) musl-gcc
[rqlited] 2026/06/17 22:45:51 go1.26.3, target architecture is amd64, operating system target is linux
[rqlited] 2026/06/17 22:45:51 launch command: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file
[rqlited] 2026/06/17 22:45:51 no preexisting node state detected in /rqlite/file, node may be bootstrapping
[cluster] 2026/06/17 22:45:51 service listening on 192.168.56.101:4002
[http] 2026/06/17 22:45:51 execute queue processing started with capacity 1024, batch size 128, timeout 50ms
[http] 2026/06/17 22:45:51 service listening on [::]:4001
[store] 2026/06/17 22:45:51 opening store with node ID 2, listening on 192.168.56.101:4002
[store] 2026/06/17 22:45:51 ensuring data directory exists at /rqlite/file
[mux] 2026/06/17 22:45:51 mux serving on [::]:4002, advertising 192.168.56.101:4002
[store] 2026/06/17 22:45:51 old v7 snapshot directory does not exist at /rqlite/file/snapshots, nothing to upgrade
[store] 2026/06/17 22:45:51 old v8 snapshot directory does not exist at /rqlite/file/rsnapshots, nothing to upgrade
[snapshot-store] 2026/06/17 22:45:51 store initialized using /rqlite/file/wsnapshots
[store] 2026/06/17 22:45:51 0 preexisting snapshots present
[store] 2026/06/17 22:45:51 raft log is 0 bytes at open, no entries present
[rqlited] 2026/06/17 22:45:51 checking that supplied join addresses don't serve HTTP(S)
[rqlited] 2026/06/17 22:45:51 clustering failure: join address 172.29.22.198:8000 appears to be serving HTTP when it should be Raft
=== Iniciando Nó rqlite ===
IP Anunciado (Advertise IP): 192.168.56.101
Modo: WORKER
Juntando-se ao cluster pelo líder: 172.29.22.198:8000
Executando: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file

            _ _ _
           | (_) |
  _ __ __ _| |_| |_ ___
 | '__/ _  | | | __/ _ \   The lightweight, fault-tolerant,
 | | | (_| | | | ||  __/   relational database.
 |_|  \__, |_|_|\__\___|
         | |               www.rqlite.io
         |_|

[rqlited] 2026/06/17 22:45:54 rqlited starting, version v10.2.0, SQLite 3.53.0, commit 6809aa3b6f373b86aa4e1265b9c47bf5d09e1819, compiler (toolchain) gc, compiler (command) musl-gcc
[rqlited] 2026/06/17 22:45:54 go1.26.3, target architecture is amd64, operating system target is linux
[rqlited] 2026/06/17 22:45:54 launch command: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file
[mux] 2026/06/17 22:45:54 mux serving on [::]:4002, advertising 192.168.56.101:4002
[rqlited] 2026/06/17 22:45:54 preexisting node state detected in /rqlite/file
[cluster] 2026/06/17 22:45:54 service listening on 192.168.56.101:4002
[http] 2026/06/17 22:45:54 execute queue processing started with capacity 1024, batch size 128, timeout 50ms
[http] 2026/06/17 22:45:54 service listening on [::]:4001
[store] 2026/06/17 22:45:54 opening store with node ID 2, listening on 192.168.56.101:4002
[store] 2026/06/17 22:45:54 ensuring data directory exists at /rqlite/file
[store] 2026/06/17 22:45:54 old v7 snapshot directory does not exist at /rqlite/file/snapshots, nothing to upgrade
[store] 2026/06/17 22:45:54 old v8 snapshot directory does not exist at /rqlite/file/rsnapshots, nothing to upgrade
[snapshot-store] 2026/06/17 22:45:54 store initialized using /rqlite/file/wsnapshots
[store] 2026/06/17 22:45:54 0 preexisting snapshots present
[store] 2026/06/17 22:45:54 raft log is 33 kB, first index is 0, last index is 0
[rqlited] 2026/06/17 22:45:54 checking that supplied join addresses don't serve HTTP(S)
[rqlited] 2026/06/17 22:45:54 clustering failure: join address 172.29.22.198:8000 appears to be serving HTTP when it should be Raft
=== Iniciando Nó rqlite ===
IP Anunciado (Advertise IP): 192.168.56.101
Modo: WORKER
Juntando-se ao cluster pelo líder: 172.29.22.198:8000
Executando: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file

            _ _ _
           | (_) |
  _ __ __ _| |_| |_ ___
 | '__/ _  | | | __/ _ \   The lightweight, fault-tolerant,
 | | | (_| | | | ||  __/   relational database.
 |_|  \__, |_|_|\__\___|
         | |               www.rqlite.io
         |_|

[rqlited] 2026/06/17 22:45:57 rqlited starting, version v10.2.0, SQLite 3.53.0, commit 6809aa3b6f373b86aa4e1265b9c47bf5d09e1819, compiler (toolchain) gc, compiler (command) musl-gcc
[rqlited] 2026/06/17 22:45:57 go1.26.3, target architecture is amd64, operating system target is linux
[rqlited] 2026/06/17 22:45:57 launch command: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file
[rqlited] 2026/06/17 22:45:57 preexisting node state detected in /rqlite/file
[cluster] 2026/06/17 22:45:57 service listening on 192.168.56.101:4002
[http] 2026/06/17 22:45:57 execute queue processing started with capacity 1024, batch size 128, timeout 50ms
[http] 2026/06/17 22:45:57 service listening on [::]:4001
[store] 2026/06/17 22:45:57 opening store with node ID 2, listening on 192.168.56.101:4002
[store] 2026/06/17 22:45:57 ensuring data directory exists at /rqlite/file
[store] 2026/06/17 22:45:57 old v7 snapshot directory does not exist at /rqlite/file/snapshots, nothing to upgrade
[store] 2026/06/17 22:45:57 old v8 snapshot directory does not exist at /rqlite/file/rsnapshots, nothing to upgrade
[snapshot-store] 2026/06/17 22:45:57 store initialized using /rqlite/file/wsnapshots
[store] 2026/06/17 22:45:57 0 preexisting snapshots present
[mux] 2026/06/17 22:45:57 mux serving on [::]:4002, advertising 192.168.56.101:4002
[store] 2026/06/17 22:45:57 raft log is 33 kB, first index is 0, last index is 0
[rqlited] 2026/06/17 22:45:57 checking that supplied join addresses don't serve HTTP(S)
[rqlited] 2026/06/17 22:45:57 clustering failure: join address 172.29.22.198:8000 appears to be serving HTTP when it should be Raft
=== Iniciando Nó rqlite ===
IP Anunciado (Advertise IP): 192.168.56.101
Modo: WORKER
Juntando-se ao cluster pelo líder: 172.29.22.198:8000
Executando: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file

            _ _ _
           | (_) |
  _ __ __ _| |_| |_ ___
 | '__/ _  | | | __/ _ \   The lightweight, fault-tolerant,
 | | | (_| | | | ||  __/   relational database.
 |_|  \__, |_|_|\__\___|
         | |               www.rqlite.io
         |_|

[rqlited] 2026/06/17 22:46:00 rqlited starting, version v10.2.0, SQLite 3.53.0, commit 6809aa3b6f373b86aa4e1265b9c47bf5d09e1819, compiler (toolchain) gc, compiler (command) musl-gcc
[rqlited] 2026/06/17 22:46:00 go1.26.3, target architecture is amd64, operating system target is linux
[rqlited] 2026/06/17 22:46:00 launch command: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file
[rqlited] 2026/06/17 22:46:00 preexisting node state detected in /rqlite/file
[cluster] 2026/06/17 22:46:00 service listening on 192.168.56.101:4002
[http] 2026/06/17 22:46:00 execute queue processing started with capacity 1024, batch size 128, timeout 50ms
[http] 2026/06/17 22:46:00 service listening on [::]:4001
[store] 2026/06/17 22:46:00 opening store with node ID 2, listening on 192.168.56.101:4002
[store] 2026/06/17 22:46:00 ensuring data directory exists at /rqlite/file
[store] 2026/06/17 22:46:00 old v7 snapshot directory does not exist at /rqlite/file/snapshots, nothing to upgrade
[store] 2026/06/17 22:46:00 old v8 snapshot directory does not exist at /rqlite/file/rsnapshots, nothing to upgrade
[snapshot-store] 2026/06/17 22:46:00 store initialized using /rqlite/file/wsnapshots
[store] 2026/06/17 22:46:00 0 preexisting snapshots present
[mux] 2026/06/17 22:46:00 mux serving on [::]:4002, advertising 192.168.56.101:4002
[store] 2026/06/17 22:46:00 raft log is 33 kB, first index is 0, last index is 0
[rqlited] 2026/06/17 22:46:00 checking that supplied join addresses don't serve HTTP(S)
[rqlited] 2026/06/17 22:46:00 clustering failure: join address 172.29.22.198:8000 appears to be serving HTTP when it should be Raft
=== Iniciando Nó rqlite ===
IP Anunciado (Advertise IP): 192.168.56.101
Modo: WORKER
Juntando-se ao cluster pelo líder: 172.29.22.198:8000
Executando: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file

            _ _ _
           | (_) |
  _ __ __ _| |_| |_ ___
 | '__/ _  | | | __/ _ \   The lightweight, fault-tolerant,
 | | | (_| | | | ||  __/   relational database.
 |_|  \__, |_|_|\__\___|
         | |               www.rqlite.io
         |_|

[rqlited] 2026/06/17 22:46:03 rqlited starting, version v10.2.0, SQLite 3.53.0, commit 6809aa3b6f373b86aa4e1265b9c47bf5d09e1819, compiler (toolchain) gc, compiler (command) musl-gcc
[rqlited] 2026/06/17 22:46:03 go1.26.3, target architecture is amd64, operating system target is linux
[rqlited] 2026/06/17 22:46:03 launch command: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file
[mux] 2026/06/17 22:46:03 mux serving on [::]:4002, advertising 192.168.56.101:4002
[rqlited] 2026/06/17 22:46:03 preexisting node state detected in /rqlite/file
[cluster] 2026/06/17 22:46:03 service listening on 192.168.56.101:4002
[http] 2026/06/17 22:46:03 execute queue processing started with capacity 1024, batch size 128, timeout 50ms
[http] 2026/06/17 22:46:03 service listening on [::]:4001
[store] 2026/06/17 22:46:03 opening store with node ID 2, listening on 192.168.56.101:4002
[store] 2026/06/17 22:46:03 ensuring data directory exists at /rqlite/file
[store] 2026/06/17 22:46:03 old v7 snapshot directory does not exist at /rqlite/file/snapshots, nothing to upgrade
[store] 2026/06/17 22:46:03 old v8 snapshot directory does not exist at /rqlite/file/rsnapshots, nothing to upgrade
[snapshot-store] 2026/06/17 22:46:03 store initialized using /rqlite/file/wsnapshots
[store] 2026/06/17 22:46:03 0 preexisting snapshots present
[store] 2026/06/17 22:46:03 raft log is 33 kB, first index is 0, last index is 0
[rqlited] 2026/06/17 22:46:03 checking that supplied join addresses don't serve HTTP(S)
[rqlited] 2026/06/17 22:46:03 clustering failure: join address 172.29.22.198:8000 appears to be serving HTTP when it should be Raft
=== Iniciando Nó rqlite ===
IP Anunciado (Advertise IP): 192.168.56.101
Modo: WORKER
Juntando-se ao cluster pelo líder: 172.29.22.198:8000
Executando: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file

            _ _ _
           | (_) |
  _ __ __ _| |_| |_ ___
 | '__/ _  | | | __/ _ \   The lightweight, fault-tolerant,
 | | | (_| | | | ||  __/   relational database.
 |_|  \__, |_|_|\__\___|
         | |               www.rqlite.io
         |_|

[rqlited] 2026/06/17 22:46:06 rqlited starting, version v10.2.0, SQLite 3.53.0, commit 6809aa3b6f373b86aa4e1265b9c47bf5d09e1819, compiler (toolchain) gc, compiler (command) musl-gcc
[rqlited] 2026/06/17 22:46:06 go1.26.3, target architecture is amd64, operating system target is linux
[rqlited] 2026/06/17 22:46:06 launch command: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file
[rqlited] 2026/06/17 22:46:06 preexisting node state detected in /rqlite/file
[cluster] 2026/06/17 22:46:06 service listening on 192.168.56.101:4002
[http] 2026/06/17 22:46:06 execute queue processing started with capacity 1024, batch size 128, timeout 50ms
[http] 2026/06/17 22:46:06 service listening on [::]:4001
[store] 2026/06/17 22:46:06 opening store with node ID 2, listening on 192.168.56.101:4002
[store] 2026/06/17 22:46:06 ensuring data directory exists at /rqlite/file
[mux] 2026/06/17 22:46:06 mux serving on [::]:4002, advertising 192.168.56.101:4002
[store] 2026/06/17 22:46:06 old v7 snapshot directory does not exist at /rqlite/file/snapshots, nothing to upgrade
[store] 2026/06/17 22:46:06 old v8 snapshot directory does not exist at /rqlite/file/rsnapshots, nothing to upgrade
[snapshot-store] 2026/06/17 22:46:06 store initialized using /rqlite/file/wsnapshots
[store] 2026/06/17 22:46:06 0 preexisting snapshots present
[store] 2026/06/17 22:46:06 raft log is 33 kB, first index is 0, last index is 0
[rqlited] 2026/06/17 22:46:06 checking that supplied join addresses don't serve HTTP(S)
[rqlited] 2026/06/17 22:46:06 clustering failure: join address 172.29.22.198:8000 appears to be serving HTTP when it should be Raft
=== Iniciando Nó rqlite ===
IP Anunciado (Advertise IP): 192.168.56.101
Modo: WORKER
Juntando-se ao cluster pelo líder: 172.29.22.198:8000
Executando: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file

            _ _ _
           | (_) |
  _ __ __ _| |_| |_ ___
 | '__/ _  | | | __/ _ \   The lightweight, fault-tolerant,
 | | | (_| | | | ||  __/   relational database.
 |_|  \__, |_|_|\__\___|
         | |               www.rqlite.io
         |_|

[rqlited] 2026/06/17 22:46:11 rqlited starting, version v10.2.0, SQLite 3.53.0, commit 6809aa3b6f373b86aa4e1265b9c47bf5d09e1819, compiler (toolchain) gc, compiler (command) musl-gcc
[rqlited] 2026/06/17 22:46:11 go1.26.3, target architecture is amd64, operating system target is linux
[rqlited] 2026/06/17 22:46:11 launch command: rqlited -node-id 2 -http-addr 0.0.0.0:4001 -raft-addr 0.0.0.0:4002 -http-adv-addr 192.168.56.101:8000 -raft-adv-addr 192.168.56.101:4002 -join 172.29.22.198:8000 /rqlite/file
[rqlited] 2026/06/17 22:46:11 preexisting node state detected in /rqlite/file
[cluster] 2026/06/17 22:46:11 service listening on 192.168.56.101:4002
[mux] 2026/06/17 22:46:11 mux serving on [::]:4002, advertising 192.168.56.101:4002
[http] 2026/06/17 22:46:11 execute queue processing started with capacity 1024, batch size 128, timeout 50ms
[http] 2026/06/17 22:46:11 service listening on [::]:4001
[store] 2026/06/17 22:46:11 opening store with node ID 2, listening on 192.168.56.101:4002
[store] 2026/06/17 22:46:11 ensuring data directory exists at /rqlite/file
[store] 2026/06/17 22:46:11 old v7 snapshot directory does not exist at /rqlite/file/snapshots, nothing to upgrade
[store] 2026/06/17 22:46:11 old v8 snapshot directory does not exist at /rqlite/file/rsnapshots, nothing to upgrade
[snapshot-store] 2026/06/17 22:46:11 store initialized using /rqlite/file/wsnapshots
[store] 2026/06/17 22:46:11 0 preexisting snapshots present
[store] 2026/06/17 22:46:11 raft log is 33 kB, first index is 0, last index is 0
[rqlited] 2026/06/17 22:46:11 checking that supplied join addresses don't serve HTTP(S)
[rqlited] 2026/06/17 22:46:11 clustering failure: join address 172.29.22.198:8000 appears to be serving HTTP when it should be Raft
root@ifcblumenau:/home/ifcblumenau/cubs-students-ifc-blumenau/docker# ls
docker-compose.yml  rqlite
root@ifcblumenau:/home/ifcblumenau/cubs-students-ifc-blumenau/docker# cd rqlite/
root@ifcblumenau:/home/ifcblumenau/cubs-students-ifc-blumenau/docker/rqlite# ls
Dockerfile  entrypoint.sh
root@ifcblumenau:/home/ifcblumenau/cubs-students-ifc-blumenau/docker/rqlite# docker exec -it cubs-rqlite rqlite
Error response from daemon: Container d0d27421aa83e4c8eb6a32a4b2deeb025ad68852f1c1547b85305f57cb544545 is restarting, wait until the container is running


---

# Configuração do Rqlite

# [RQLITE_ADVERTISE_IP]
# - Em DEV local na mesma máquina: Pode deixar vazio. O container pegará seu próprio IP interno (172.x.x.x)
# - Em DEV (múltiplas máquinas) ou PROD: Coloque o IP externo/roteável da máquina.
RQLITE_ADVERTISE_IP=192.168.56.101 

# [NODE_ID]
# ID único do nó no cluster Raft.
# Se for subir um cluster, garanta que cada máquina tenha um NODE_ID diferente (1, 2, 3...)
NODE_ID=2

# [JOIN_NODE]
# - Se este for o nó LÍDER: Deixe em branco.
# - Se este nó for um WORKER: Informe o IP_DO_LIDER:PORTA_HTTP (Ex: 192.168.0.10:8000) para se juntar ao cluster.
JOIN_NODE=172.29.22.198:4002
