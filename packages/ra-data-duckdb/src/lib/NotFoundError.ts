/** Thrown by getOne/update when no row matches the requested id. */
export class NotFoundError extends Error {
  readonly status = 404;

  constructor(message = "Record not found") {
    super(message);
    this.name = "NotFoundError";
  }
}
