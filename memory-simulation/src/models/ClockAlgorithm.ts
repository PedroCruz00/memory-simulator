export class ClockAlgorithm {
  private frames: { page: { referenced: number } }[]; // Array de frames con páginas que tienen un bit de referencia
  private pointer: number; // Puntero circular

  constructor(frames: { page: { referenced: number } }[]) {
    this.frames = frames; // Array de frames en RAM
    this.pointer = 0; // Puntero circular
  }

  // Encuentra un frame víctima para reemplazo
  findVictim(): number {
    const maxIterations = this.frames.length * 2; // Evitar loops infinitos
    let iterations = 0;

    while (iterations < maxIterations) {
      const frame = this.frames[this.pointer];
      if (!frame) {
        // Frame vacío, usarlo directamente
        const victimIndex = this.pointer;
        this.pointer = (this.pointer + 1) % this.frames.length;
        return victimIndex;
      }

      if (frame.page.referenced === 0) {
        // Víctima encontrada
        const victimIndex = this.pointer;
        this.pointer = (this.pointer + 1) % this.frames.length;
        return victimIndex;
      } else {
        // Dar segunda oportunidad: resetear bit de referencia
        frame.page.referenced = 0;
        this.pointer = (this.pointer + 1) % this.frames.length;
      }
      iterations++;
    }

    // Fallback: reemplazar el actual si no se encuentra (raro)
    const victimIndex = this.pointer;
    this.pointer = (this.pointer + 1) % this.frames.length;
    return victimIndex;
  }
}
