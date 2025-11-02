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
            <span
              className="processor-visualization__status processor-visualization__status--running"
            >
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
                <span className="processor-visualization__info-value">{currentProcess.pc}</span>
              </div>
              <div className="processor-visualization__info-item">
                <span className="processor-visualization__info-label">Tiempo restante:</span>
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
            <div className="processor-visualization__queue-empty">Sin procesos</div>
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
            <div className="processor-visualization__queue-empty">Sin procesos</div>
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
