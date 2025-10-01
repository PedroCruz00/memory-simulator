import { Page } from "./MMU";

export interface RAMFrame {
  processPid: number;
  page: Page | null;
}

export class RAM {
  numFrames: number;
  pageSize: number;
  frames: (RAMFrame | null)[];

  constructor(numFrames: number = 16, pageSize: number = 4096) {
    // Ejemplo: 16 frames, 4KB por página
    this.numFrames = numFrames;
    this.pageSize = pageSize;
    this.frames = new Array(numFrames).fill(null);
  }

  // Asignar un frame a una página
  allocateFrame(index: number, processPid: number | null, page: Page | null) {
    if (processPid === null) {
      this.frames[index] = null;
    } else {
      this.frames[index] = { processPid, page };
    }
  }

  // Liberar frames de un proceso (e.g., al terminar)
  freeFrames(processPid: number) {
    this.frames = this.frames.map((frame) =>
      frame && frame.processPid === processPid ? null : frame
    );
  }

  // Obtener frame por índice
  getFrame(index: number): RAMFrame | null {
    return this.frames[index];
  }

  // Contar frames ocupados por un proceso
  getProcessFrameCount(processPid: number): number {
    return this.frames.filter(
      (frame) => frame && frame.processPid === processPid
    ).length;
  }
}
