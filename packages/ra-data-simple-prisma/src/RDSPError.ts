export class RDSPError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RDSPError";
  }
}
