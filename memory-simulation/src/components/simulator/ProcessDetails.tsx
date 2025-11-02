/**
 * ProcessDetails
 *
 * Tabla detallada de todos los procesos mostrando:
 * - PID, Estado, Prioridad
 * - Páginas totales, en RAM, en Disco
 * - Memoria utilizada
 * - Tiempo restante
 * - Filtros por estado
 */

import React, { useState } from "react";
import { Icons } from "../Icons";
import { Process } from "../../models/Process";
import { RAM } from "../../models/RAM";
import { Disk } from "../../models/Disk";
import { STATES } from "../../constants/states";
import "../../styles/ProcessDetails.css";

interface ProcessDetailsProps {
  processes: Process[];
  ram: RAM;
  disk: Disk;
}

export const ProcessDetails: React.FC<ProcessDetailsProps> = ({ processes, ram, disk }) => {
  const [filterState, setFilterState] = useState<string>("ALL");

  const filteredProcesses =
    filterState === "ALL" ? processes : processes.filter((p) => p.state === filterState);

  const getProcessPagesInRAM = (pid: number): number => {
    return ram.frames.filter((f) => f?.processPid === pid).length;
  };

  const getProcessPagesInDisk = (pid: number): number => {
    const diskPages = disk.getProcessPages(pid);
    return diskPages?.size || 0;
  };

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

  const filters = [
    { value: "ALL", label: "Todos" },
    { value: STATES.NEW, label: "New" },
    { value: STATES.READY, label: "Ready" },
    { value: STATES.RUNNING, label: "Running" },
    { value: STATES.BLOCKED, label: "Blocked" },
    { value: STATES.TERMINATED, label: "Terminated" },
  ];

  return (
    <div className="process-details">
      <div className="process-details__header">
        <div className="process-details__title-group">
          <Icons.List />
          <h3 className="process-details__title">Detalle de Procesos</h3>
        </div>
        <div className="process-details__filters">
          {filters.map((filter) => (
            <button
              key={filter.value}
              className={`process-details__filter ${
                filterState === filter.value ? "process-details__filter--active" : ""
              }`}
              onClick={() => setFilterState(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="process-details__table-container">
        <table className="process-details__table">
          <thead className="process-details__thead">
            <tr>
              <th>PID</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Memoria</th>
              <th>Páginas</th>
              <th>En RAM</th>
              <th>En Disco</th>
              <th>Tiempo Rest.</th>
            </tr>
          </thead>
          <tbody className="process-details__tbody">
            {filteredProcesses.length === 0 ? (
              <tr>
                <td colSpan={8} className="process-details__empty">
                  No hay procesos {filterState !== "ALL" && `en estado ${filterState}`}
                </td>
              </tr>
            ) : (
              filteredProcesses.map((process) => {
                const pagesInRAM = getProcessPagesInRAM(process.pid);
                const pagesInDisk = getProcessPagesInDisk(process.pid);

                return (
                  <tr key={process.pid} className="process-details__row">
                    <td>
                      <span
                        className="process-details__pid"
                        style={{ background: process.color }}
                      >
                        P{process.pid}
                      </span>
                    </td>
                    <td>
                      <span
                        className="process-details__state"
                        style={{ color: getStateColor(process.state) }}
                      >
                        {process.state}
                      </span>
                    </td>
                    <td className="process-details__priority">{process.priority}</td>
                    <td className="process-details__memory">
                      {(process.memorySize / 1024).toFixed(1)} KB
                    </td>
                    <td className="process-details__pages">{process.pages.length}</td>
                    <td className="process-details__ram">
                      <span className="process-details__badge process-details__badge--success">
                        {pagesInRAM}
                      </span>
                    </td>
                    <td className="process-details__disk">
                      <span className="process-details__badge process-details__badge--info">
                        {pagesInDisk}
                      </span>
                    </td>
                    <td className="process-details__time">
                      {process.state === STATES.TERMINATED
                        ? "—"
                        : `${process.remainingTime}ms`}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="process-details__footer">
        <span className="process-details__count">
          Mostrando {filteredProcesses.length} de {processes.length} procesos
        </span>
      </div>
    </div>
  );
};
