#!/bin/sh

ADV_IP=${RQLITE_ADVERTISE_IP:-$(hostname -i | awk '{print $1}')}

echo "=== Iniciando Nó rqlite ==="
echo "IP Anunciado (Advertise IP): $ADV_IP"

NODE_ID=${NODE_ID:-1}
HTTP_ADDR="0.0.0.0:4001"
RAFT_ADDR="0.0.0.0:4002"

HTTP_ADV_ADDR="${ADV_IP}:8000"
RAFT_ADV_ADDR="${ADV_IP}:4002"

# Build arguments list
ARGS="-node-id ${NODE_ID} -http-addr ${HTTP_ADDR} -raft-addr ${RAFT_ADDR} -http-adv-addr ${HTTP_ADV_ADDR} -raft-adv-addr ${RAFT_ADV_ADDR}"

if [ -n "$JOIN_NODE" ]; then
    echo "Modo: WORKER"
    JOIN_ADDR=$JOIN_NODE
    
    echo "Juntando-se ao cluster pelo líder: $JOIN_ADDR"
    ARGS="$ARGS -join $JOIN_ADDR"
else
    echo "Modo: LEADER"
fi

# The data directory MUST be the last argument
echo "Executando: rqlited $ARGS /rqlite/file"
exec rqlited $ARGS /rqlite/file
