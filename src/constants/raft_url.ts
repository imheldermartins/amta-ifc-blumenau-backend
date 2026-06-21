const RQLITE_ADVERTISE_IP = process.env.RQLITE_ADVERTISE_IP;
const RQLITE_PORT = process.env.RQLITE_PORT || 4001;

export const RAFT_URL = RQLITE_ADVERTISE_IP ? `http://${RQLITE_ADVERTISE_IP}:${RQLITE_PORT}` : `http://localhost:${RQLITE_PORT}`;