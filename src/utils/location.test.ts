import {describe, it} from 'node:test';
import {expect} from 'playwright/test';

import {jsdomHook} from '@tests/test_utils/jsdom/hooks';
import {matchLocation} from './location';

describe('matchLocation', () => {
  // beforeEach(() => {
  //   location = document.location;
  //   jest.spyOn(document, 'location', 'get').mockRestore();
  // });
  jsdomHook();
  it('matchLocation', () => {
    expect(matchLocation('^https://example.com/.*')).toBe(false);
    // const mockedLocation = {
    //   ...location,
    //   protocol: 'https:',
    //   host: 'example.com',
    // };
    // jest.spyOn(document, 'location', 'get').mockReturnValue(mockedLocation);
    // expect(matchLocation('^https://example.com/.*')).toBe(true);
  });
});
