export class RDDError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RDDError";
  }
}
