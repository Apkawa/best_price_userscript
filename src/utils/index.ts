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
