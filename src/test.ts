import { Listen, execute, Command } from './decorators/command';
import { AbstractCommand } from './command/AbstractCommand';
import { ListenerType } from './enum/listenerType';

@Command
export class CreateUserCommand extends AbstractCommand {

  constructor(private data: string) {
    super('testEvent');
  }

  getData(): string {
    return this.data;
  }
}

export class Test {

  @Listen(CreateUserCommand, 500)
  public async createUser(command: CreateUserCommand, next: Function): Promise<any> {
    try {
      console.log(command.getData());
      await next();

      return 'b';
    } catch (e) {
      throw e;
    }
  }

  @Listen(ListenerType.ALL, 100)
  public async a(command: CreateUserCommand, next: Function): Promise<any> {
    try {
      console.log(command.getData().toUpperCase())
      await next();

      return 'a';
    } catch (e) {
      throw e;
    }
  }

}


export class EventSourcing {
  @Listen(ListenerType.ALL, 100000)
  public async doSomething2(command: CreateUserCommand, next: Function): Promise<string> {
    try {
      console.log('LOGAR COMANDO');
      await next();

      return 'logou!';
    } catch (e) {
      throw e;
    }
  }

}

(async () => {
  const result = await execute(new CreateUserCommand('chupa'));
  console.log(result);
})()