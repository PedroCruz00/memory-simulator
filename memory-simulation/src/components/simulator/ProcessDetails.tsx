import React from "react";
import { Process } from "../../models/Process";
import "../../styles/ProcessDetails.css";

interface ProcessDetailsProps {
  processes: Process[];
  selectedPid?: number;
}

export const ProcessDetails: React.FC<ProcessDetailsProps> = ({
  processes,
  selectedPid,
}) => {
  const selectedProcess = processes.find((p) => p.pid === selectedPid);

  return (
    <div className="process-details">
      <h3>Detalles de Procesos</h3>

      {!selectedProcess && processes.length === 0 && (
        <p className="placeholder">No hay procesos creados</p>
      )}

      {processes.length > 0 && (
        <div className="process-list">
          {processes.map((p) => (
            <div key={p.pid} className="process-item">
              <div className="process-header">
                <h4>Proceso {p.pid}</h4>
                <span className={`state-tag ${p.state.toLowerCase()}`}>
                  {p.state}
                </span>
              </div>

              <div className="process-info">
                <div className="info-grid">
                  <div className="info-cell">
                    <label>Prioridad:</label>
                    <span>{p.priority}/10</span>
                  </div>
                  <div className="info-cell">
                    <label>Tiempo Restante:</label>
                    <span>{p.remainingTime} ms</span>
                  </div>
                  <div className="info-cell">
                    <label>Tamaño de Memoria:</label>
                    <span>{p.memorySize / 1024} KB</span>
                  </div>
                  <div className="info-cell">
                    <label>Páginas:</label>
                    <span>{p.pages.length}</span>
                  </div>
                </div>

                <div className="process-stats">
                  <h5>Historial de Estados:</h5>
                  <div className="history">
                    {p.stateHistory.slice(-5).map((entry, idx) => (
                      <div key={idx} className="history-entry">
                        <span className="time">
                          {entry.timestamp.toLocaleTimeString()}
                        </span>
                        <span className="state">{entry.state}</span>
                        <span className="reason">{entry.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {p.systemCalls.length > 0 && (
                  <div className="system-calls">
                    <h5>Llamadas al Sistema:</h5>
                    <ul>
                      {p.systemCalls.slice(-3).map((call, idx) => (
                        <li key={idx}>{call}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
