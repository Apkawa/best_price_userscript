import {isFunction} from 'rxjs/internal-compatibility';

type MatchPattern = string | RegExp | ((s: Location) => boolean);

export function buildPatternPrefixFromDomain(domain: string): string {
  return `^https://(www.|)${domain}`;
}

export function matchLocation(...patterns: MatchPattern[]): boolean {
  const s = document.location;
  for (let p of patterns) {
    if (isFunction(p) && p(s)) {
      return true;
    }
    if (typeof p === 'string') {
      p = p.replace(/[.]/g, '\\.');
    }
    if (RegExp(p as string).test(s.href)) {
      return true;
    }
  }
  return false;
}

type MapUrlType = {[K: string]: () => void};

/**
 * mapLocation({
 *   '^foo.bar/': () => { // some code },
 * })
 * @param map
 */
export function mapLocation(map: MapUrlType): void {
  const s = document.location.hostname + document.location.pathname;
  for (const [k, v] of Object.entries(map)) {
    if (RegExp(k).test(s)) {
      v();
    }
  }
}

export function parseSearch(): {[key: string]: string} {
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}
