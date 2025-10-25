import React from "react";
import { RAM } from "../../models/RAM";
import { Process } from "../../models/Process";
import "../../styles/RAMVisualization.css";

interface RAMVisualizationProps {
  ram: RAM | null;
  processes: Process[];
}

export const RAMVisualization: React.FC<RAMVisualizationProps> = ({
  ram,
  processes,
}) => {
  if (!ram) {
    return (
      <div className="ram-visualization">
        <p className="placeholder">Inicializa el simulador para ver RAM</p>
      </div>
    );
  }

  const getProcessColor = (pid: number | null) => {
    if (pid === null) return "#e0e0e0";
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
      "#F8B88B",
      "#ABEBC6",
    ];
    return colors[pid % colors.length];
  };

  const getFrameUsage = (frameIndex: number) => {
    const frame = ram.frames[frameIndex];
    if (!frame) return { used: false, pid: null, page: null };
    return {
      used: true,
      pid: frame.processPid,
      page: frame.page?.pageNumber,
    };
  };

  return (
    <div className="ram-visualization">
      <h3>Visualización de RAM</h3>
      <div className="ram-stats">
        <p>
          <strong>Tamaño total:</strong> {(ram.numFrames * ram.pageSize) / 1024}{" "}
          KB
        </p>
        <p>
          <strong>Frames:</strong> {ram.numFrames} (Tamaño: {ram.pageSize} bytes)
        </p>
      </div>

      <div className="ram-frames-container">
        {Array.from({ length: ram.numFrames }).map((_, index) => {
          const usage = getFrameUsage(index);
          return (
            <div
              key={index}
              className="ram-frame"
              style={{
                backgroundColor: getProcessColor(usage.pid),
                borderColor: usage.used ? "#333" : "#999",
              }}
              title={
                usage.used
                  ? `PID: ${usage.pid}, Página: ${usage.page}`
                  : "Frame vacío"
              }
            >
              <div className="frame-index">F{index}</div>
              {usage.used && (
                <div className="frame-content">
                  <small>P{usage.pid}</small>
                  <small>Pg{usage.page}</small>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="legend">
        <h4>Procesos Activos:</h4>
        {processes.map((p) => (
          <div key={p.pid} className="legend-item">
            <div
              className="color-box"
              style={{ backgroundColor: getProcessColor(p.pid) }}
            ></div>
            <span>PID {p.pid}: {p.state}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
