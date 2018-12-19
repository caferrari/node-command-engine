import { ICommand } from './IEvent';

export abstract class AbstractCommand implements ICommand {

  static __name: string;

  constructor(protected name: string) { }

  public getName(): string {
    return this.name;
  }

}