import "reflect-metadata";

import { ICommand } from '../command/IEvent';
import { ListenerType } from '../enum/listenerType';

declare type commandsType = {
  [key: string]: Array<{
    priority: number;
    command: string;
    target: Object;
    descriptor: PropertyDescriptor;
  }>
}

const commands: commandsType = {
  _ALL: []
};

export function Command<T extends Function>(target: any) {

  if (commands[target.name]) {
    throw new Error("This comand already exists");
  }

  commands[target.name] = [];
  target.prototype.__name = target.name;
}

export function Listen(command: Function | ListenerType, priority: number = 1000) {

  if (typeof command === 'function') {

    const cmd = command;
    return function(target: any, key: string, descriptor: PropertyDescriptor) {

      const types = Reflect.getMetadata("design:paramtypes", target, key);

      if (types[0].name != cmd.name) {
        throw new Error(`Attribute 0 must be of type ${cmd.name}`);
      }

      if (!commands[cmd.name]) {
        throw new Error(`Invalid command`);
      }

      commands[cmd.name].push({
        priority,
        command: types[0].name,
        target,
        descriptor
      })

      return descriptor;
    }
  }

  const cmd = command;

  if (cmd === ListenerType.ALL) {
    return function(target: any, key: string, descriptor: PropertyDescriptor) {
      commands['_ALL'].push({
        priority,
        command: null,
        target,
        descriptor
      });
    }
  }

}

async function generateNext(listeners: any[], command: any, results: any[]): Promise<any> {

  const listener = listeners.shift();

  if (!listener) {
    return async () => { }
  }

  return async () => {
    const next = await generateNext(listeners, command,results);
    const result = await listener.descriptor.value.call(listener.target, command, next, results);
    results.unshift(result);
  }
}

export async function execute<T extends ICommand>(command: T) {

  const type = (command as any).__name;

  const listeners = (commands[type] || []).filter(c => c.command = type);

  listeners.push(...commands['_ALL']);

  listeners.sort((a, b) => a.priority - b.priority);

  if (listeners.length === 0) {
    return;
  }

  const results = [];

  const next = await generateNext(listeners, command, results);

  await next();

  return results;
}