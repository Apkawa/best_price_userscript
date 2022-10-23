type sortArg<T> = keyof T | `-${string & keyof T}`;

/**
 * Returns a comparator for objects of type T that can be used by sort
 * functions, were T objects are compared by the specified T properties.
 *
 * @param sortBy - the names of the properties to sort by, in precedence order.
 *                 Prefix any name with `-` to sort it in descending order.
 */
export function byPropertiesOf<T extends Record<string, unknown>>(
  sortBy: Array<sortArg<T>>,
): (a: T, b: T) => number {
  function compareByProperty(arg: sortArg<T>) {
    let key: keyof T;
    let sortOrder = 1;
    if (typeof arg === 'string' && arg.startsWith('-')) {
      sortOrder = -1;
      // Typescript is not yet smart enough to infer that substring is keyof T
      key = arg.substr(1) as keyof T;
    } else {
      // Likewise it is not yet smart enough to infer that arg here is keyof T
      key = arg as keyof T;
    }
    return function (a: T, b: T): number {
      const result = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;

      return result * sortOrder;
    };
  }

  return function (obj1: T, obj2: T) {
    let i = 0;
    let result = 0;
    const numberOfProperties = sortBy?.length;
    while (result === 0 && i < numberOfProperties) {
      result = compareByProperty(sortBy[i])(obj1, obj2);
      i++;
    }

    return result;
  };
}

/**
 * Sorts an array of T by the specified properties of T.
 *
 * @param arr - the array to be sorted, all of the same type T
 * @param sortBy - the names of the properties to sort by, in precedence order.
 *                 Prefix any name with `-` to sort it in descending order.
 */
export function sort<T extends Record<string, unknown>>(
  arr: T[],
  ...sortBy: Array<sortArg<T>>
): void {
  arr.sort(byPropertiesOf<T>(sortBy));
}
