export class SqlParams {
  private values: Record<string, unknown> = {};
  private i = 0;

  add(value: unknown): string {
    const key = `p${++this.i}`;
    this.values[key] = value;
    return `$${key}`;
  }

  get(): Record<string, unknown> {
    return this.values;
  }

  merge(other: Record<string, unknown>): void {
    Object.assign(this.values, other);
  }
}
