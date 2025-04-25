import {after, before} from 'node:test';
import {getLocalStorageMock} from '@tests/test_utils/localStorage/localStorage';

function globalHook(): void {
  before(() => {
    global['localStorage'] = getLocalStorageMock()
  });
  after(() => {
    global['localStorage'].clear()
  });
}

globalHook()
