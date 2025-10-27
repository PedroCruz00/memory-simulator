import { STATES } from "./states";

export const STATE_COLORS = {
  [STATES.NEW]: "#94a3b8",
  [STATES.READY]: "#22c55e",
  [STATES.RUNNING]: "#3b82f6",
  [STATES.BLOCKED]: "#f59e0b",
  [STATES.TERMINATED]: "#ef4444",
};

// Colores para procesos individuales
export const PROCESS_COLORS = [
  "#3b82f6", // Azul
  "#10b981", // Verde
  "#f59e0b", // Naranja
  "#8b5cf6", // Morado
  "#ec4899", // Rosa
  "#14b8a6", // Turquesa
  "#f97316", // Naranja oscuro
  "#6366f1", // Índigo
  "#84cc16", // Lima
  "#06b6d4", // Cian
];
