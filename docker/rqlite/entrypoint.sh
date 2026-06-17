#!/bin/sh

ADV_IP=${RQLITE_HOST:-$(hostname -i | awk '{print $1}')}

echo "=== Iniciando Nó rqlite ==="
echo "IP Anunciado (Advertise IP): $ADV_IP"

NODE_ID=${NODE_ID:-1}
HTTP_ADDR="0.0.0.0:4001"
RAFT_ADDR="0.0.0.0:4002"

HTTP_ADV_ADDR="${ADV_IP}:8000"
RAFT_ADV_ADDR="${ADV_IP}:4002"

BASE_CMD="rqlited -node-id ${NODE_ID} -http-addr ${HTTP_ADDR} -raft-addr ${RAFT_ADDR} -http-adv-addr ${HTTP_ADV_ADDR} -raft-adv-addr ${RAFT_ADV_ADDR} /rqlite/file"

if [ -n "$JOIN_NODE" ]; then
    echo "Modo: WORKER"
    echo "Juntando-se ao cluster pelo líder: $JOIN_NODE"
    exec $BASE_CMD -join "http://${JOIN_NODE}"
else
    echo "Modo: LEADER"
    exec $BASE_CMD
fi
