/**
 * Error thrown for invalid requests (bad pagination, disallowed filters,
 * unknown resources...). `status` is the HTTP status a route should respond
 * with; it defaults to 400.
 */
export class RDSPError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "RDSPError";
    this.status = status;
  }
}
