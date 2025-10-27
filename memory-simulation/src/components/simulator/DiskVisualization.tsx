import React from "react";
import { Disk } from "../../models/Disk";
import { Process } from "../../models/Process";
import "../../styles/DiskVisualization.css";

interface DiskVisualizationProps {
  disk: Disk | null;
  processes: Process[];
}

export const DiskVisualization: React.FC<DiskVisualizationProps> = ({
  disk,
  processes,
}) => {
  if (!disk) {
    return (
      <div className="disk-visualization">
        <h3>💾 Disco (Swap Space)</h3>
        <p className="disk-empty">Disco no inicializado</p>
      </div>
    );
  }

  // Obtener páginas en disco por proceso
  const diskPages = processes
    .map((p) => {
      const processPages = disk.getProcessPages(p.pid);
      if (processPages && processPages.size > 0) {
        return {
          process: p,
          pageCount: processPages.size,
          pageNumbers: Array.from(processPages.keys()) as number[],
        };
      }
      return null;
    })
    .filter(Boolean);

  const totalPagesInDisk = diskPages.reduce(
    (sum, item) => sum + (item?.pageCount || 0),
    0
  );

  return (
    <div className="disk-visualization">
      <div className="disk-header">
        <h3>💾 Disco (Swap Space)</h3>
        <div className="disk-stats">
          <span className="disk-stat">
            📄 {totalPagesInDisk} páginas en disco
          </span>
        </div>
      </div>

      <div className="disk-content">
        {diskPages.length === 0 ? (
          <p className="disk-empty">✨ Sin páginas en disco (todo en RAM)</p>
        ) : (
          <div className="disk-pages">
            {diskPages.map(
              (item) =>
                item && (
                  <div
                    key={item.process.pid}
                    className="disk-process-block"
                    style={{
                      borderLeft: `4px solid ${item.process.color}`,
                    }}
                  >
                    <div className="disk-process-header">
                      <strong>Proceso P{item.process.pid}</strong>
                      <span className="disk-page-count">
                        {item.pageCount} página{item.pageCount > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="disk-page-numbers">
                      {item.pageNumbers.map((pageNum) => (
                        <span key={pageNum} className="disk-page-number">
                          P{pageNum}
                        </span>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
