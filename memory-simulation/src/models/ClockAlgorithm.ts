export class ClockAlgorithm {
  private numFrames: number;
  private pointer: number;

  constructor(numFrames: number) {
    this.numFrames = numFrames;
    this.pointer = 0;
  }

  getPointer(): number {
    return this.pointer;
  }

  findVictim(frames: Array<{ page: { referenced: number } | null }>): number {
    const maxIterations = this.numFrames * 2;
    let iterations = 0;

    while (iterations < maxIterations) {
      const frame = frames[this.pointer];

      // Frame vacío o sin página, usarlo directamente
      if (!frame || !frame.page) {
        const victimIndex = this.pointer;
        this.pointer = (this.pointer + 1) % this.numFrames;
        return victimIndex;
      }

      // Si el bit de referencia es 0, víctima encontrada
      if (frame.page.referenced === 0) {
        const victimIndex = this.pointer;
        this.pointer = (this.pointer + 1) % this.numFrames;
        return victimIndex;
      }

      // Segunda oportunidad: resetear bit de referencia
      frame.page.referenced = 0;
      this.pointer = (this.pointer + 1) % this.numFrames;
      iterations++;
    }

    // Fallback: retornar el frame actual
    const victimIndex = this.pointer;
    this.pointer = (this.pointer + 1) % this.numFrames;
    return victimIndex;
  }

  reset(): void {
    this.pointer = 0;
  }
}
