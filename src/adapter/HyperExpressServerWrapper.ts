import { Server } from 'hyper-express';

export class HyperExpressServerWrapper {
  readonly #instance: Server;

  public constructor(instance: Server) {
    this.#instance = instance;
  }

  public address(): string {
    return '';
  }

  public once(): void {}
}
