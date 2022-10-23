export {
  getElementByXpath,
  getElementsByXpath,
  E,
  markElementHandled,
  waitElement,
  waitCompletePage,
} from './dom';

export {parseSearch, mapLocation, matchLocation} from './location';

export {GM_addStyle} from './GM';

export default function isRegexp(value: unknown): value is RegExp {
  return toString.call(value) === '[object RegExp]';
}

export function mRegExp(regExps: (RegExp | string)[]): RegExp {
  return RegExp(
    regExps
      .map(function (r) {
        if (isRegexp(r)) {
          return r.source;
        }
        return r;
      })
      .join(''),
  );
}

export function round(n: number, parts = 2): number {
  const i = Math.pow(10, parts);
  return Math.round(n * i) / i;
}

export const keys = Object.keys as <T>(o: T) => Extract<keyof T, string>[];
export const entries = Object.entries as <T>(
  o: T,
) => [Extract<keyof T, string>, Exclude<T[keyof T], undefined>][];
