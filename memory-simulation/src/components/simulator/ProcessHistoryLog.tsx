/**
 * ProcessHistoryLog
 *
 * Muestra un log completo y detallado de todos los cambios de estado
 * de todos los procesos en formato de registro de auditoría.
 * Cada transición se muestra con timestamp, proceso, estado origen y destino.
 */

import React, { useState } from "react";
import { Icons } from "../Icons";
import { Process } from "../../models/Process";
import { STATES } from "../../constants/states";
import "../../styles/ProcessHistoryLog.css";

interface ProcessHistoryLogProps {
  processes: Process[];
}

interface LogEntry {
  pid: number;
  state: string;
  timestamp: Date;
  reason: string;
  timeInPreviousState?: number;
  color: string;
}

export const ProcessHistoryLog: React.FC<ProcessHistoryLogProps> = ({
  processes,
}) => {
  const [filterPid, setFilterPid] = useState<number | null>(null);
  const [filterState, setFilterState] = useState<string | null>(null);

  // Obtener todas las entradas del historial de todos los procesos
  const getAllLogEntries = (): LogEntry[] => {
    const entries: LogEntry[] = [];

    processes.forEach((process) => {
      process.stateHistory.forEach((entry) => {
        entries.push({
          pid: process.pid,
          state: entry.state,
          timestamp: entry.timestamp,
          reason: entry.reason,
          timeInPreviousState: entry.timeInPreviousState,
          color: process.color,
        });
      });
    });

    // Ordenar por timestamp (más reciente primero)
    return entries.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  };

  const logEntries = getAllLogEntries();

  // Filtrar entradas
  const filteredEntries = logEntries.filter((entry) => {
    if (filterPid !== null && entry.pid !== filterPid) return false;
    if (filterState !== null && entry.state !== filterState) return false;
    return true;
  });

  const getStateColor = (state: string): string => {
    switch (state) {
      case STATES.NEW:
        return "var(--state-new)";
      case STATES.READY:
        return "var(--state-ready)";
      case STATES.RUNNING:
        return "var(--state-running)";
      case STATES.BLOCKED:
        return "var(--state-blocked)";
      case STATES.TERMINATED:
        return "var(--state-terminated)";
      default:
        return "var(--neutral-gray)";
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  const formatDuration = (ms?: number): string => {
    if (!ms) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const uniquePids = Array.from(new Set(processes.map((p) => p.pid))).sort(
    (a, b) => a - b
  );
  const allStates = Object.values(STATES);

  return (
    <div className="process-history-log">
      <div className="process-history-log__header">
        <div className="process-history-log__title-group">
          <Icons.Activity />
          <h3 className="process-history-log__title">
            Registro de Transiciones de Estados
          </h3>
        </div>
        <div className="process-history-log__count">
          {filteredEntries.length} transiciones
        </div>
      </div>

      {/* Filtros */}
      <div className="process-history-log__filters">
        <div className="process-history-log__filter">
          <label>Proceso:</label>
          <select
            value={filterPid ?? ""}
            onChange={(e) =>
              setFilterPid(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Todos</option>
            {uniquePids.map((pid) => (
              <option key={pid} value={pid}>
                P{pid}
              </option>
            ))}
          </select>
        </div>

        <div className="process-history-log__filter">
          <label>Estado:</label>
          <select
            value={filterState ?? ""}
            onChange={(e) => setFilterState(e.target.value || null)}
          >
            <option value="">Todos</option>
            {allStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {(filterPid !== null || filterState !== null) && (
          <button
            className="process-history-log__clear-filters"
            onClick={() => {
              setFilterPid(null);
              setFilterState(null);
            }}
          >
            <Icons.Reset />
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Log Entries */}
      <div className="process-history-log__entries">
        {filteredEntries.length === 0 ? (
          <div className="process-history-log__empty">
            <Icons.Info />
            <span>No hay transiciones registradas</span>
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
            <div
              key={`${entry.pid}-${index}`}
              className="process-history-log__entry"
              style={{ animationDelay: `${Math.min(index * 0.02, 1)}s` }}
            >
              <div className="process-history-log__entry-time">
                <Icons.Clock />
                <span>{formatTimestamp(entry.timestamp)}</span>
              </div>

              <div className="process-history-log__entry-process">
                <span
                  className="process-history-log__entry-pid"
                  style={{ background: entry.color }}
                >
                  P{entry.pid}
                </span>
              </div>

              <div className="process-history-log__entry-arrow">
                <Icons.Arrow />
              </div>

              <div className="process-history-log__entry-state">
                <span
                  className="process-history-log__entry-badge"
                  style={{ background: getStateColor(entry.state) }}
                >
                  {entry.state}
                </span>
              </div>

              <div className="process-history-log__entry-details">
                <span className="process-history-log__entry-reason">
                  {entry.reason}
                </span>
                {entry.timeInPreviousState !== undefined && (
                  <span className="process-history-log__entry-duration">
                    Duración anterior:{" "}
                    {formatDuration(entry.timeInPreviousState)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
