import { ClockAlgorithm } from "./ClockAlgorithm";
import { RAM } from "./RAM";
import { Disk } from "./Disk";
import { Process } from "./Process";

export class Page {
  pageNumber: number;
  size: number;
  referenced: number;
  modified: number;
  data: number[];

  constructor(pageNumber: number, size: number) {
    this.pageNumber = pageNumber;
    this.size = size;
    this.referenced = 0; // Bit de referencia (0/1)
    this.modified = 0; // Bit dirty (para write-back, pero simplificado)
    this.data = new Array(size).fill(0); // Datos simulados
  }
}

export class MMU {
  ram: RAM;
  disk: Disk;
  clock: ClockAlgorithm;
  pageTable: Map<number, Map<number, number | "disk">>;

  constructor(ram: RAM, disk: Disk) {
    this.ram = ram;
    this.disk = disk;
    // Filtrar solo frames no nulos y con page definido para el ClockAlgorithm
    const clockFrames = ram.frames.filter(
      (f) => f && (f.page as any) !== null
    ) as { page: { referenced: number } }[];
    this.clock = new ClockAlgorithm(clockFrames);
    this.pageTable = new Map(); // Map<processPid, Map<pageNumber, frameIndex or 'disk'>>
  }

  // Inicializar tabla de páginas para un proceso
  initializeProcess(process: Process) {
    const numPages = Math.ceil(process.memorySize / this.ram.pageSize);
    process.pages = [];
    const processPageTable = new Map<number, number | "disk">();

    for (let i = 0; i < numPages; i++) {
      const page = new Page(i, this.ram.pageSize);
      process.pages.push(page);
      // Inicialmente, todas las páginas en disco (paginación por demanda)
      this.disk.storePage(process.pid, page);
      processPageTable.set(i, "disk");
    }

    this.pageTable.set(process.pid, processPageTable);
  }

  // Manejar acceso a memoria para un proceso en ejecución
  accessMemory(process: Process, pageNumber: number): number {
    const processPageTable = this.pageTable.get(process.pid);
    if (!processPageTable) {
      throw new Error(`No page table for process ${process.pid}`);
    }

    const location = processPageTable.get(pageNumber);
    if (location === "disk") {
      // Page fault: Throw error to handle in caller (Processor will block)
      throw new Error(
        `Page fault on page ${pageNumber} for process ${process.pid}`
      );
    } else if (typeof location === "number") {
      // En RAM: Set referenced bit
      const frame = this.ram.getFrame(location);
      if (frame && frame.page) {
        frame.page.referenced = 1;
      }
      return location; // Frame index
    } else {
      throw new Error(`Invalid page location for page ${pageNumber}`);
    }
  }

  // Manejar page fault: Traer página de disco a RAM
  // This is called from Processor after catching the error and blocking the process.
  handlePageFault(process: Process, pageNumber: number) {
    // Encontrar víctima con Clock
    const victimIndex = this.clock.findVictim();

    // Si hay víctima ocupada, swap out
    const victimFrame = this.ram.getFrame(victimIndex);
    if (victimFrame && victimFrame.page) {
      const victimPid = victimFrame.processPid;
      const victimPage = victimFrame.page;
      const victimPageTable = this.pageTable.get(victimPid);

      if (victimPage.modified) {
        // Write-back si dirty (simulado: solo store)
      }
      this.disk.storePage(victimPid, victimPage);
      if (victimPageTable) {
        victimPageTable.set(victimPage.pageNumber, "disk");
      }
      this.ram.allocateFrame(victimIndex, null, null); // Clear frame temporarily
    }

    // Swap in la página requerida
    const page = this.disk.getPage(process.pid, pageNumber);
    if (!page) {
      throw new Error(
        `Page ${pageNumber} not found in disk for process ${process.pid}`
      );
    }
    page.referenced = 1; // Nueva página referenciada
    page.modified = 0;
    this.ram.allocateFrame(victimIndex, process.pid, page);
    const processPageTable = this.pageTable.get(process.pid);
    if (processPageTable) {
      processPageTable.set(pageNumber, victimIndex);
    }
    // Simular tiempo de I/O para page fault (bloquea el proceso)
    // Note: Processor should handle the blocking and timeout
  }

  // Liberar memoria al terminar proceso
  freeProcessMemory(process: Process) {
    this.ram.freeFrames(process.pid);
    // Limpiar disco si hay páginas allí
    this.disk.clearPages(process.pid);
    this.pageTable.delete(process.pid);
  }
}
