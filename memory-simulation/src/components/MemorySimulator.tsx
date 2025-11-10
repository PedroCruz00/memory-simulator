/**
 * MemorySimulator
 *
 * Componente principal del simulador de memoria virtual.
 * Muestra la interacción completa entre CPU, MMU, RAM y Disco
 * con animaciones fluidas y visualización en tiempo real.
 *
 * Features:
 * - Gestión de procesos con estados (NEW, READY, RUNNING, BLOCKED, TERMINATED)
 * - MMU con algoritmo Clock para reemplazo de páginas
 * - Visualización de RAM con frames y bits R/M
 * - Visualización de Disco con páginas almacenadas
 * - Métricas en tiempo real (Page Faults, Hit Ratio, etc.)
 * - Animaciones de flujo de datos entre componentes
 */

import React, { useEffect, useState } from "react";
import { useSimulator } from "../hooks/useSimulator";
import { Icons } from "./Icons";
import { SimulatorControls } from "./simulator/SimulatorControls";
import { RAMVisualization } from "./simulator/RAMVisualization";
import { ProcessorVisualization } from "./simulator/ProcessorVisualization";
import { DiskVisualization } from "./simulator/DiskVisualization";
import { MetricsDashboard } from "./simulator/MetricsDashboard";
import { ProcessDetails } from "./simulator/ProcessDetails";
import { DataFlowVisualization } from "./simulator/DataFlowVisualization";
import { ProcessFlowDiagram } from "./simulator/ProcessFlowDiagram";
import { EventHistory } from "./simulator/EventHistory";
import { ProcessHistoryLog } from "./simulator/ProcessHistoryLog";
import type { MMUEvent } from "../models/MMU";
import "../styles/SimulatorLayout.css";

export const MemorySimulator: React.FC = () => {
  const {
    state,
    initializeSimulator,
    addProcess,
    startSimulation,
    pauseSimulation,
    stepSimulation,
    resetSimulation,
  } = useSimulator();

  const [lastEvent, setLastEvent] = useState<MMUEvent | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initializeSimulator({
        ramFrames: 16,
        pageSize: 4096,
        processorQuantum: 1000,
        maxProcesses: 10,
      });
      setIsInitialized(true);
    }
  }, [isInitialized, initializeSimulator]);

  useEffect(() => {
    if (state.processor && state.processor.mmu) {
      state.processor.mmu.onEvent = (event: MMUEvent) => {
        setLastEvent(event);
        setTimeout(() => setLastEvent(null), 2000);
      };
    }
  }, [state.processor]);

  const handleInitialize = (config: {
    ramFrames: number;
    pageSize: number;
    processorQuantum: number;
    maxProcesses: number;
  }) => {
    initializeSimulator(config);
  };

  const handleAddProcess = () => {
    const canBeBlocked = Math.random() > 0.5;
    addProcess(canBeBlocked);
  };

  return (
    <div className="simulator-layout">
      <header className="simulator-header">
        <div className="header-content">
          <h1 className="simulator-title">
            <span className="title-gradient">Memory Simulator</span>
          </h1>
          <p className="simulator-subtitle">
            Simulación Interactiva de Memoria Virtual con Algoritmo Clock
          </p>
        </div>
      </header>

      <div className="simulator-controls-container">
        <SimulatorControls
          isRunning={state.isRunning}
          isInitialized={!!state.processor}
          onInitialize={handleInitialize}
          onStart={startSimulation}
          onPause={pauseSimulation}
          onStep={stepSimulation}
          onReset={resetSimulation}
          onAddProcess={handleAddProcess}
          config={state.config}
        />
      </div>

      {state.processor && state.ram && state.disk && (
        <>
          <div className="simulator-metrics-container">
            <MetricsDashboard
              ram={state.ram}
              processor={state.processor}
              processes={state.processes}
              currentTime={state.currentTime}
            />
          </div>

          <div className="simulator-main-grid">
            {/* Columna Izquierda: RAM */}
            <div className="simulator-column simulator-column--left">
              <RAMVisualization
                ram={state.ram}
                processes={state.processes}
                clockPointer={state.processor.mmu.clock.getPointer()}
                lastEvent={lastEvent}
              />
            </div>

            {/* Columna Central: CPU */}
            <div className="simulator-column simulator-column--center">
              <ProcessorVisualization
                processor={state.processor}
                currentTime={state.currentTime}
              />
            </div>

            {/* Columna Derecha: Disco y Diagrama */}
            <div className="simulator-column simulator-column--right">
              <DiskVisualization
                disk={state.disk}
                processes={state.processes}
              />
              <ProcessFlowDiagram processes={state.processes} />
            </div>
          </div>

          {/* DataFlow ocupa todo el ancho */}
          <div className="simulator-dataflow-container">
            <DataFlowVisualization
              lastEvent={lastEvent}
              processor={state.processor}
              ram={state.ram}
              disk={state.disk}
            />
          </div>

          {/* Historial de Eventos */}
          <div className="simulator-history-container">
            <EventHistory
              events={state.processor.mmu.eventHistory}
              maxEvents={100}
            />
          </div>

          {/* Registro Completo de Transiciones de Estados */}
          <div className="simulator-history-log-container">
            <ProcessHistoryLog processes={state.processes} />
          </div>

          <div className="simulator-details-container">
            <ProcessDetails
              processes={state.processes}
              ram={state.ram}
              disk={state.disk}
            />
          </div>
        </>
      )}

      {!state.processor && (
        <div className="simulator-empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <Icons.Settings />
            </div>
            <h2 className="empty-state-title">Inicializa el Simulador</h2>
            <p className="empty-state-message">
              Configura los parámetros del simulador y haz clic en "Inicializar"
              para comenzar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
