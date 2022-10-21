import {matchLocation} from './location';

describe('matchLocation', () => {
  // beforeEach(() => {
  //   location = document.location;
  //   jest.spyOn(document, 'location', 'get').mockRestore();
  // });
  test('matchLocation', () => {
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
