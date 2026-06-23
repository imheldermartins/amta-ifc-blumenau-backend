import type { CorsOptions } from "cors";

// origin "*" por enquanto -- libera qualquer client. Quando for restringir
// (lista de domínios, env var, etc.), é só editar este arquivo, nada mais.
export const corsConfig: CorsOptions = {
  origin: "*",
};