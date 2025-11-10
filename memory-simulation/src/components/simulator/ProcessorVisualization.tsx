/**
 * ProcessorVisualization
 *
 * Visualiza el estado del procesador mostrando:
 * - Proceso en ejecución actual o estado IDLE
 * - Cola de procesos READY
 * - Cola de procesos BLOCKED
 * - Quantum restante
 * - Registros del proceso actual
 */

import React from "react";
import { Icons } from "../Icons";
import { Processor } from "../../models/Processor";
import "../../styles/ProcessorVisualization.css";

interface ProcessorVisualizationProps {
  processor: Processor;
  currentTime: number;
}

export const ProcessorVisualization: React.FC<ProcessorVisualizationProps> = ({
  processor,
  currentTime,
}) => {
  const { currentProcess, readyQueue, blockedQueue } = processor;

  // Debug: Verificar el historial del proceso actual
  React.useEffect(() => {
    if (currentProcess) {
      console.log(`[ProcessorVisualization] Process P${currentProcess.pid}:`, {
        state: currentProcess.state,
        historyLength: currentProcess.stateHistory.length,
        history: currentProcess.stateHistory,
      });
    }
  }, [currentProcess]);

  return (
    <div className="processor-visualization">
      <div className="processor-visualization__header">
        <div className="processor-visualization__title-group">
          <Icons.CPU />
          <h3 className="processor-visualization__title">CPU</h3>
        </div>
        <div className="processor-visualization__time">
          <Icons.Clock />
          <span>Ciclo {currentTime}</span>
        </div>
      </div>

      {/* Current Process */}
      <div className="processor-visualization__current">
        <div className="processor-visualization__current-header">
          <span>Proceso en Ejecución</span>
          {currentProcess && (
            <span className="processor-visualization__status processor-visualization__status--running">
              <Icons.Activity />
              RUNNING
            </span>
          )}
        </div>

        {currentProcess ? (
          <div
            className="processor-visualization__process-card processor-visualization__process-card--current"
            style={{ borderColor: currentProcess.color }}
          >
            <div className="processor-visualization__process-header">
              <span
                className="processor-visualization__process-pid"
                style={{ background: currentProcess.color }}
              >
                P{currentProcess.pid}
              </span>
              <span className="processor-visualization__process-priority">
                Prioridad: {currentProcess.priority}
              </span>
            </div>

            <div className="processor-visualization__process-info">
              <div className="processor-visualization__info-item">
                <span className="processor-visualization__info-label">PC:</span>
                <span className="processor-visualization__info-value">
                  {currentProcess.pc}
                </span>
              </div>
              <div className="processor-visualization__info-item">
                <span className="processor-visualization__info-label">
                  Tiempo restante:
                </span>
                <span className="processor-visualization__info-value">
                  {currentProcess.remainingTime}ms
                </span>
              </div>
            </div>

            <div className="processor-visualization__registers">
              <div className="processor-visualization__register">
                <span>AX</span>
                <span>{currentProcess.registers.AX}</span>
              </div>
              <div className="processor-visualization__register">
                <span>BX</span>
                <span>{currentProcess.registers.BX}</span>
              </div>
              <div className="processor-visualization__register">
                <span>CX</span>
                <span>{currentProcess.registers.CX}</span>
              </div>
            </div>

            <div className="processor-visualization__memory-info">
              <Icons.Memory />
              <span>{(currentProcess.memorySize / 1024).toFixed(1)} KB</span>
              <span className="processor-visualization__separator">|</span>
              <span>{currentProcess.pages.length} páginas</span>
            </div>

            {/* Timeline del historial de estados */}
            <div className="processor-visualization__state-timeline">
              <div className="processor-visualization__timeline-header">
                <Icons.Clock />
                <span>
                  Historial de Estados ({currentProcess.stateHistory.length})
                </span>
              </div>
              <div className="processor-visualization__timeline-items">
                {currentProcess.stateHistory.length === 0 ? (
                  <div className="processor-visualization__timeline-empty">
                    Sin historial disponible
                  </div>
                ) : (
                  currentProcess.stateHistory.map((entry, index) => {
                    const stateColor =
                      entry.state === "NEW"
                        ? "var(--state-new)"
                        : entry.state === "READY"
                        ? "var(--state-ready)"
                        : entry.state === "RUNNING"
                        ? "var(--state-running)"
                        : entry.state === "BLOCKED"
                        ? "var(--state-blocked)"
                        : "var(--state-terminated)";

                    return (
                      <div
                        key={index}
                        className="processor-visualization__timeline-item"
                      >
                        <div
                          className="processor-visualization__timeline-marker"
                          style={{ backgroundColor: stateColor }}
                        />
                        <div className="processor-visualization__timeline-content">
                          <div className="processor-visualization__timeline-state">
                            {entry.state}
                          </div>
                          <div className="processor-visualization__timeline-meta">
                            <span className="processor-visualization__timeline-time">
                              {entry.timestamp.toLocaleTimeString()}
                            </span>
                            {entry.timeInPreviousState !== undefined && (
                              <span className="processor-visualization__timeline-duration">
                                ({Math.round(entry.timeInPreviousState / 1000)}
                                s)
                              </span>
                            )}
                          </div>
                          {entry.reason && (
                            <div className="processor-visualization__timeline-reason">
                              {entry.reason}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="processor-visualization__idle">
            <div className="processor-visualization__idle-icon">
              <Icons.CPU />
            </div>
            <span>IDLE</span>
          </div>
        )}
      </div>

      {/* Ready Queue */}
      <div className="processor-visualization__queue">
        <div className="processor-visualization__queue-header">
          <span>Cola READY</span>
          <span className="processor-visualization__queue-count">
            {readyQueue.length}
          </span>
        </div>
        <div className="processor-visualization__queue-list">
          {readyQueue.length === 0 ? (
            <div className="processor-visualization__queue-empty">
              Sin procesos
            </div>
          ) : (
            readyQueue.map((process, index) => (
              <div
                key={process.pid}
                className="processor-visualization__queue-item"
                style={{
                  borderColor: process.color,
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <span
                  className="processor-visualization__queue-item-pid"
                  style={{ background: process.color }}
                >
                  P{process.pid}
                </span>
                <div className="processor-visualization__queue-item-info">
                  <span>Pri: {process.priority}</span>
                  <span>{process.remainingTime}ms</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Blocked Queue */}
      <div className="processor-visualization__queue">
        <div className="processor-visualization__queue-header">
          <span>Cola BLOCKED</span>
          <span className="processor-visualization__queue-count processor-visualization__queue-count--blocked">
            {blockedQueue.length}
          </span>
        </div>
        <div className="processor-visualization__queue-list">
          {blockedQueue.length === 0 ? (
            <div className="processor-visualization__queue-empty">
              Sin procesos
            </div>
          ) : (
            blockedQueue.map((process, index) => (
              <div
                key={process.pid}
                className="processor-visualization__queue-item processor-visualization__queue-item--blocked"
                style={{
                  borderColor: process.color,
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <span
                  className="processor-visualization__queue-item-pid"
                  style={{ background: process.color }}
                >
                  P{process.pid}
                </span>
                <div className="processor-visualization__queue-item-info">
                  <Icons.Warning />
                  <span>Page Fault</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
