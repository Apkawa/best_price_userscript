import {deepEqual} from 'node:assert';


export class Expect<T = unknown> {
  private value: T;
  private message?: string;

  constructor(value: T, message?: string) {
    this.value = value;
    this.message = message;
  }

  toStrictEqual(expected: T) {
    deepEqual(this.value, expected, this.message);
  }
}


export function expect<T=unknown> (value: T, message?: string): Expect<T> {
  return new Expect(value, message);
};
