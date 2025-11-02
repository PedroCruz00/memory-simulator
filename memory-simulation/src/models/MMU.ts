import { ClockAlgorithm } from "./ClockAlgorithm";
import { RAM } from "./RAM";
import { Disk } from "./Disk";
import { Process } from "./Process";

export interface MMUEvent {
  type: "PAGE_HIT" | "PAGE_FAULT" | "PAGE_SWAP" | "PAGE_LOAD";
  timestamp: number;
  processPid: number;
  pageNumber: number;
  frameNumber?: number;
  victimPid?: number;
  victimPageNumber?: number;
}

export class Page {
  pageNumber: number;
  size: number;
  referenced: number;
  modified: number;
  data: number[];
  loadTime: number;
  accessCount: number;

  constructor(pageNumber: number, size: number) {
    this.pageNumber = pageNumber;
    this.size = size;
    this.referenced = 0;
    this.modified = 0;
    this.data = new Array(size).fill(0);
    this.loadTime = Date.now();
    this.accessCount = 0;
  }
}

export class MMU {
  ram: RAM;
  disk: Disk;
  clock: ClockAlgorithm;
  pageTable: Map<number, Map<number, number | "disk">>;
  pageFaults: number;
  pageHits: number;
  swapCount: number;
  eventHistory: MMUEvent[];
  onEvent?: (event: MMUEvent) => void;

  constructor(ram: RAM, disk: Disk) {
    this.ram = ram;
    this.disk = disk;
    this.clock = new ClockAlgorithm(ram.frames.length);
    this.pageTable = new Map();
    this.pageFaults = 0;
    this.pageHits = 0;
    this.swapCount = 0;
    this.eventHistory = [];
  }

  private emitEvent(event: MMUEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > 100) {
      this.eventHistory.shift();
    }
    if (this.onEvent) {
      this.onEvent(event);
    }
  }

  initializeProcess(process: Process): void {
    const numPages = Math.ceil(process.memorySize / this.ram.pageSize);
    process.pages = [];
    const processPageTable = new Map<number, number | "disk">();

    for (let i = 0; i < numPages; i++) {
      const page = new Page(i, this.ram.pageSize);
      process.pages.push(page);

      // Cargar las primeras 2-3 páginas en RAM (código inicial del proceso)
      const shouldLoadToRAM = i < Math.min(3, numPages);
      let loadedToRAM = false;

      if (shouldLoadToRAM) {
        // Buscar frame libre
        for (let f = 0; f < this.ram.frames.length; f++) {
          const frame = this.ram.frames[f];
          if (frame === null) {
            // Frame libre encontrado
            page.referenced = 1;
            page.modified = 0;
            this.ram.allocateFrame(f, process.pid, page);
            processPageTable.set(i, f);
            loadedToRAM = true;

            this.emitEvent({
              type: "PAGE_LOAD",
              timestamp: Date.now(),
              processPid: process.pid,
              pageNumber: i,
              frameNumber: f,
            });
            break;
          }
        }
      }

      if (!loadedToRAM) {
        // Si no se cargó a RAM, almacenar en disco
        this.disk.storePage(process.pid, page);
        processPageTable.set(i, "disk");
      }
    }

    this.pageTable.set(process.pid, processPageTable);
  }

  accessMemory(process: Process, pageNumber: number): number {
    const processPageTable = this.pageTable.get(process.pid);
    if (!processPageTable) {
      throw new Error(`No page table for process ${process.pid}`);
    }

    const location = processPageTable.get(pageNumber);
    if (location === "disk") {
      this.pageFaults++;
      this.emitEvent({
        type: "PAGE_FAULT",
        timestamp: Date.now(),
        processPid: process.pid,
        pageNumber,
      });
      throw new Error(
        `Page fault on page ${pageNumber} for process ${process.pid}`
      );
    } else if (typeof location === "number") {
      this.pageHits++;
      const frame = this.ram.getFrame(location);
      if (frame && frame.page) {
        frame.page.referenced = 1;
        frame.page.accessCount++;

        this.emitEvent({
          type: "PAGE_HIT",
          timestamp: Date.now(),
          processPid: process.pid,
          pageNumber,
          frameNumber: location,
        });
      }
      return location;
    } else {
      throw new Error(`Invalid page location for page ${pageNumber}`);
    }
  }

  handlePageFault(process: Process, pageNumber: number): void {
    const victimIndex = this.clock.findVictim(
      this.ram.frames as Array<{ page: { referenced: number } | null }>
    );

    const victimFrame = this.ram.getFrame(victimIndex);
    let victimPid: number | undefined;
    let victimPageNumber: number | undefined;

    if (victimFrame && victimFrame.page) {
      victimPid = victimFrame.processPid;
      victimPageNumber = victimFrame.page.pageNumber;
      const victimPage = victimFrame.page;
      const victimPageTable = this.pageTable.get(victimPid);

      if (victimPage.modified) {
        // Write-back if dirty
      }
      this.disk.storePage(victimPid, victimPage);
      if (victimPageTable) {
        victimPageTable.set(victimPage.pageNumber, "disk");
      }
      this.swapCount++;

      this.emitEvent({
        type: "PAGE_SWAP",
        timestamp: Date.now(),
        processPid: process.pid,
        pageNumber,
        frameNumber: victimIndex,
        victimPid,
        victimPageNumber,
      });
    }

    // Load page from disk
    const page = this.disk.getPage(process.pid, pageNumber);
    if (!page) {
      throw new Error(
        `Page ${pageNumber} not found in disk for process ${process.pid}`
      );
    }

    page.referenced = 1;
    page.modified = 0;
    page.loadTime = Date.now();
    this.ram.allocateFrame(victimIndex, process.pid, page);

    const processPageTable = this.pageTable.get(process.pid);
    if (processPageTable) {
      processPageTable.set(pageNumber, victimIndex);
    }

    this.emitEvent({
      type: "PAGE_LOAD",
      timestamp: Date.now(),
      processPid: process.pid,
      pageNumber,
      frameNumber: victimIndex,
    });
  }

  freeProcessMemory(process: Process): void {
    this.ram.freeFrames(process.pid);
    this.disk.freeProcessPages(process.pid);
    this.pageTable.delete(process.pid);
  }

  getHitRatio(): number {
    const total = this.pageHits + this.pageFaults;
    return total === 0 ? 0 : this.pageHits / total;
  }

  resetStatistics(): void {
    this.pageFaults = 0;
    this.pageHits = 0;
    this.swapCount = 0;
    this.eventHistory = [];
  }
}
