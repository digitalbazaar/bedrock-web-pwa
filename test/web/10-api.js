/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {initialize, showInstallPrompt, state} from '@bedrock/web-pwa';

describe('bedrock-web-pwa', () => {
  beforeEach(() => {
    // clear initialized state
    state._initialized = false;
  });
  describe('initialize', () => {
    it('should pass', async () => {
      let error;
      try {
        initialize();
      } catch(e) {
        error = e;
      }
      should.not.exist(error);
      should.equal(state.deferredInstallPrompt, null);
      should.equal(state.installCapabilities.inApp, false);
      should.equal(state.installCapabilities.manual, false);
    });
    it('should fail', async () => {
      let error;
      try {
        initialize();
      } catch(e) {
        error = e;
      }
      should.not.exist(error);

      try {
        initialize();
      } catch(e) {
        error = e;
      }
      should.exist(error);
      error.message.should.include('already initialized');
    });
  });
  describe('showInstallPrompt', () => {
    beforeEach(() => {
      // clear initialized state
      state._initialized = false;
    });
    it('should fail', async () => {
      let error;
      try {
        initialize();
        showInstallPrompt();
      } catch(e) {
        error = e;
      }
      should.exist(error);
      error.message.should.include('No PWA install prompt available');
    });
  });
});
