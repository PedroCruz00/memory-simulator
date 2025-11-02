/**
 * DiskVisualization
 *
 * Visualiza el estado del disco mostrando:
 * - Páginas almacenadas organizadas por proceso
 * - Capacidad total y utilizada
 * - Información de cada página en disco
 */

import React from "react";
import { Icons } from "../Icons";
import { Disk } from "../../models/Disk";
import { Process } from "../../models/Process";
import "../../styles/DiskVisualization.css";

interface DiskVisualizationProps {
  disk: Disk;
  processes: Process[];
}

export const DiskVisualization: React.FC<DiskVisualizationProps> = ({
  disk,
  processes,
}) => {
  const diskInfo = disk.getAllPagesInfo();
  const totalPages = diskInfo.reduce((sum, info) => sum + info.pageCount, 0);

  const getProcessColor = (pid: number): string => {
    const process = processes.find((p) => p.pid === pid);
    return process?.color || "var(--neutral-gray)";
  };

  return (
    <div className="disk-visualization">
      <div className="disk-visualization__header">
        <div className="disk-visualization__title-group">
          <Icons.Disk />
          <h3 className="disk-visualization__title">Disco</h3>
        </div>
        <div className="disk-visualization__stats">
          <span className="disk-visualization__stat">{totalPages} páginas</span>
        </div>
      </div>

      <div className="disk-visualization__content">
        {diskInfo.length === 0 ? (
          <div className="disk-visualization__empty">
            <div className="disk-visualization__empty-icon">
              <Icons.Disk />
            </div>
            <span>Sin páginas en disco</span>
          </div>
        ) : (
          <div className="disk-visualization__processes">
            {diskInfo.map((info, index) => (
              <div
                key={info.processPid}
                className="disk-visualization__process"
                style={{
                  borderColor: getProcessColor(info.processPid),
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="disk-visualization__process-header">
                  <span
                    className="disk-visualization__process-pid"
                    style={{ background: getProcessColor(info.processPid) }}
                  >
                    P{info.processPid}
                  </span>
                  <span className="disk-visualization__process-count">
                    {info.pageCount} pág.
                  </span>
                </div>

                <div className="disk-visualization__pages">
                  {info.pageNumbers.slice(0, 12).map((pageNum) => (
                    <div key={pageNum} className="disk-visualization__page">
                      {pageNum}
                    </div>
                  ))}
                  {info.pageNumbers.length > 12 && (
                    <div className="disk-visualization__page disk-visualization__page--more">
                      +{info.pageNumbers.length - 12}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
