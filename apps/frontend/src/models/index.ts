export abstract class Model {
  public with(params: Partial<this>): this {
    return Object.assign(this, params);
  }
}
