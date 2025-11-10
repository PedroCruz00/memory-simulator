/**
 * ProcessDetails
 *
 * Tabla detallada de todos los procesos mostrando:
 * - PID, Estado, Prioridad
 * - Páginas totales, en RAM, en Disco
 * - Memoria utilizada
 * - Tiempo restante
 * - Filtros por estado
 * - Historial completo de estados (expandible)
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

export const ProcessDetails: React.FC<ProcessDetailsProps> = ({
  processes,
  ram,
  disk,
}) => {
  const [filterState, setFilterState] = useState<string>("ALL");
  const [expandedProcess, setExpandedProcess] = useState<number | null>(null);

  const filteredProcesses =
    filterState === "ALL"
      ? processes
      : processes.filter((p) => p.state === filterState);

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

  const toggleProcessExpansion = (pid: number) => {
    setExpandedProcess(expandedProcess === pid ? null : pid);
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

  const filters = [
    { value: "ALL", label: "Todos" },
    { value: STATES.NEW, label: "New" },
    { value: STATES.READY, label: "Ready" },
    { value: STATES.RUNNING, label: "Running" },
    { value: STATES.BLOCKED, label: "Blocked" },
    { value: STATES.TERMINATED, label: "Terminated" },
  ];

  return <div className="process-details"></div>;
};
