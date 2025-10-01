import { Page } from "./MMU";

export class Disk {
  private pages: Map<number, Map<number, Page>>; // Map<processPid, Map<pageNumber, Page>>

  constructor() {
    this.pages = new Map(); // Map<processPid, Map<pageNumber, Page>>
  }

  // Almacenar una página en disco
  storePage(processPid: number, page: Page): void {
    if (!this.pages.has(processPid)) {
      this.pages.set(processPid, new Map());
    }
    this.pages.get(processPid)!.set(page.pageNumber, page);
  }

  // Recuperar una página del disco
  getPage(processPid: number, pageNumber: number): Page | null {
    const processPages = this.pages.get(processPid);
    if (processPages && processPages.has(pageNumber)) {
      const page = processPages.get(pageNumber)!;
      processPages.delete(pageNumber);
      if (processPages.size === 0) {
        this.pages.delete(processPid);
      }
      return page;
    }
    return null;
  }

  // Verificar si un proceso tiene páginas en disco
  hasPages(processPid: number): boolean {
    return this.pages.has(processPid) && this.pages.get(processPid)!.size > 0;
  }

  // Limpiar todas las páginas de un proceso
  clearPages(processPid: number): void {
    this.pages.delete(processPid);
  }
}
