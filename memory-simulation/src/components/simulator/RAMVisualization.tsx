/**
 * RAMVisualization
 *
 * Visualiza el estado de la RAM mostrando:
 * - Frames ocupados y libres
 * - Páginas asignadas por proceso
 * - Bits R (Referenced) y M (Modified)
 * - Puntero del algoritmo Clock
 * - Estadísticas de uso
 */

import React from "react";
import { Icons } from "../Icons";
import { RAM } from "../../models/RAM";
import { Process } from "../../models/Process";
import "../../styles/RAMVisualization.css";

interface RAMVisualizationProps {
  ram: RAM;
  processes: Process[];
  clockPointer: number;
}

export const RAMVisualization: React.FC<RAMVisualizationProps> = ({
  ram,
  processes,
  clockPointer,
}) => {
  const occupiedFrames = ram.frames.filter((f) => f !== null).length;
  const utilizationPercent = (occupiedFrames / ram.numFrames) * 100;

  const getProcessColor = (pid: number): string => {
    const process = processes.find((p) => p.pid === pid);
    return process?.color || "var(--neutral-gray)";
  };

  return (
    <div className="ram-visualization">
      <div className="ram-visualization__header">
        <div className="ram-visualization__title-group">
          <Icons.Memory />
          <h3 className="ram-visualization__title">RAM</h3>
        </div>
        <div className="ram-visualization__stats">
          <span className="ram-visualization__stat">
            {occupiedFrames}/{ram.numFrames} frames
          </span>
          <span
            className="ram-visualization__utilization"
            style={{
              color:
                utilizationPercent > 80
                  ? "var(--danger-red)"
                  : "var(--success-green)",
            }}
          >
            {utilizationPercent.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="ram-visualization__utilization-bar">
        <div
          className="ram-visualization__utilization-fill"
          style={{
            width: `${utilizationPercent}%`,
            background:
              utilizationPercent > 80
                ? "var(--gradient-danger)"
                : utilizationPercent > 50
                ? "var(--gradient-secondary)"
                : "var(--gradient-success)",
          }}
        />
      </div>

      <div className="ram-visualization__frames-container">
        <div className="ram-visualization__frames-grid">
          {ram.frames.map((frame, index) => {
            const isPointed = index === clockPointer;
            const isOccupied = frame !== null;

            return (
              <div
                key={index}
                className={`ram-visualization__frame ${
                  isOccupied
                    ? "ram-visualization__frame--occupied"
                    : "ram-visualization__frame--free"
                } ${
                  isPointed ? "ram-visualization__frame--clock-pointer" : ""
                }`}
                style={{
                  borderColor: isOccupied
                    ? getProcessColor(frame.processPid)
                    : "var(--border-primary)",
                  background: isOccupied
                    ? `${getProcessColor(frame.processPid)}20`
                    : "var(--bg-tertiary)",
                  animationDelay: `${index * 0.02}s`,
                }}
              >
                {isPointed && (
                  <div className="ram-visualization__clock-indicator">
                    <Icons.Clock />
                  </div>
                )}

                <div className="ram-visualization__frame-header">
                  <span className="ram-visualization__frame-number">
                    {index}
                  </span>
                  {isOccupied && (
                    <span
                      className="ram-visualization__frame-pid"
                      style={{ color: getProcessColor(frame.processPid) }}
                    >
                      P{frame.processPid}
                    </span>
                  )}
                </div>

                {isOccupied && frame.page && (
                  <div className="ram-visualization__frame-content">
                    <div className="ram-visualization__page-info">
                      <span className="ram-visualization__page-label">Pág</span>
                      <span className="ram-visualization__page-number">
                        {frame.page.pageNumber}
                      </span>
                    </div>

                    <div className="ram-visualization__bits">
                      <div
                        className={`ram-visualization__bit ${
                          frame.page.referenced === 1
                            ? "ram-visualization__bit--active"
                            : ""
                        }`}
                        title="Bit de Referencia"
                      >
                        R: {frame.page.referenced}
                      </div>
                      <div
                        className={`ram-visualization__bit ${
                          frame.page.modified === 1
                            ? "ram-visualization__bit--active"
                            : ""
                        }`}
                        title="Bit de Modificación"
                      >
                        M: {frame.page.modified}
                      </div>
                    </div>

                    <div className="ram-visualization__access-count">
                      <Icons.Activity />
                      <span>{frame.page.accessCount}</span>
                    </div>
                  </div>
                )}

                {!isOccupied && (
                  <div className="ram-visualization__frame-empty">Libre</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ram-visualization__legend">
        <div className="ram-visualization__legend-item">
          <div className="ram-visualization__legend-box ram-visualization__legend-box--clock">
            <Icons.Clock />
          </div>
          <span>Puntero Clock</span>
        </div>
        <div className="ram-visualization__legend-item">
          <div className="ram-visualization__legend-box ram-visualization__legend-box--r-active" />
          <span>R=1 (Referenciado)</span>
        </div>
        <div className="ram-visualization__legend-item">
          <div className="ram-visualization__legend-box ram-visualization__legend-box--m-active" />
          <span>M=1 (Modificado)</span>
        </div>
      </div>
    </div>
  );
};
