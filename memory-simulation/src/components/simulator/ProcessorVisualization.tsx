import React from "react";
import { Processor } from "../../models/Processor";
import { Process } from "../../models/Process";
import "../../styles/ProcessorVisualization.css";

interface ProcessorVisualizationProps {
  processor: Processor | null;
  processes: Process[];
}

export const ProcessorVisualization: React.FC<ProcessorVisualizationProps> = ({
  processor,
  processes,
}) => {
  if (!processor) {
    return (
      <div className="processor-visualization">
        <p className="placeholder">Inicializa el simulador para ver Procesador</p>
      </div>
    );
  }

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      NEW: "#95A5A6",
      READY: "#3498DB",
      RUNNING: "#2ECC71",
      BLOCKED: "#E74C3C",
      TERMINATED: "#7F8C8D",
    };
    return colors[state] || "#95A5A6";
  };

  const readyCount = processor.readyQueue.length;
  const blockedCount = processor.blockedQueue.length;
  const runningProcess = processor.currentProcess;

  return (
    <div className="processor-visualization">
      <h3>Estado del Procesador</h3>

      <div className="processor-status">
        <div className="status-item current">
          <h4>Proceso en Ejecución</h4>
          {runningProcess ? (
            <div className="process-card">
              <p>
                <strong>PID:</strong> {runningProcess.pid}
              </p>
              <p>
                <strong>Estado:</strong> {runningProcess.state}
              </p>
              <p>
                <strong>Tiempo Restante:</strong> {runningProcess.remainingTime} ms
              </p>
              <p>
                <strong>Prioridad:</strong> {runningProcess.priority}
              </p>
            </div>
          ) : (
            <p className="empty">Sin proceso en ejecución</p>
          )}
        </div>

        <div className="status-item ready">
          <h4>Cola READY ({readyCount})</h4>
          <div className="queue-visual">
            {processor.readyQueue.map((p, idx) => (
              <div key={idx} className="queue-process">
                <span className="pid">P{p.pid}</span>
              </div>
            ))}
          </div>
          {readyCount === 0 && <p className="empty">Cola vacía</p>}
        </div>

        <div className="status-item blocked">
          <h4>Cola BLOCKED ({blockedCount})</h4>
          <div className="queue-visual">
            {processor.blockedQueue.map((p, idx) => (
              <div key={idx} className="queue-process blocked">
                <span className="pid">P{p.pid}</span>
              </div>
            ))}
          </div>
          {blockedCount === 0 && <p className="empty">Cola vacía</p>}
        </div>
      </div>

      <div className="process-states">
        <h4>Estados de Procesos</h4>
        <div className="states-grid">
          {processes.map((p) => (
            <div key={p.pid} className="state-badge" style={{
              backgroundColor: getStateColor(p.state),
              borderColor: p.pid === runningProcess?.pid ? "#FFD700" : "transparent"
            }}>
              <div className="badge-pid">P{p.pid}</div>
              <div className="badge-state">{p.state}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
