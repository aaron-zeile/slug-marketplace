import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../src/auth/service';

describe('AuthService', () => {
  const originalLoginServiceUrl = process.env.LOGIN_SERVICE_URL;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalLoginServiceUrl === undefined) {
      delete process.env.LOGIN_SERVICE_URL;
    } else {
      process.env.LOGIN_SERVICE_URL = originalLoginServiceUrl;
    }
  });

  describe('normalizeLoginServiceBaseUrl', () => {
    it('throws when LOGIN_SERVICE_URL is not set', async () => {
      delete process.env.LOGIN_SERVICE_URL;

      await expect(new AuthService().check('Bearer token')).rejects.toThrow(
        'LOGIN_SERVICE_URL is required for authenticated operations',
      );
    });
  });

  describe('authorizationFromHeaders', () => {
    it('returns the first value when authorization is an array', () => {
      const token = AuthService.authorizationFromHeaders({
        authorization: ['Bearer first-token', 'Bearer second-token'],
      });

      expect(token).toBe('Bearer first-token');
    });

    it('returns the header when authorization is a string', () => {
      const token = AuthService.authorizationFromHeaders({
        authorization: 'Bearer only-token',
      });

      expect(token).toBe('Bearer only-token');
    });

    it('returns undefined when authorization is missing', () => {
      expect(AuthService.authorizationFromHeaders({})).toBeUndefined();
    });
  });

  describe('check', () => {
    it('throws when the login service returns an invalid session payload', async () => {
      process.env.LOGIN_SERVICE_URL = 'http://localhost:4010/api/v0';

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'only-id' }),
      } as Response);

      await expect(new AuthService().check('Bearer bad-payload')).rejects.toThrow(
        'Invalid session payload from login service',
      );
    });

    it('returns the user when the login service returns a valid session payload', async () => {
      process.env.LOGIN_SERVICE_URL = 'http://localhost:4010/api/v0/';

      const sessionUser = {
        id: 'user-id',
        email: 'user@example.com',
        name: 'User Name',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => sessionUser,
      } as Response);

      await expect(new AuthService().check('Bearer good-token')).resolves.toEqual(
        sessionUser,
      );

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:4010/api/v0/login/check',
        expect.objectContaining({
          method: 'GET',
          headers: { Authorization: 'Bearer good-token' },
        }),
      );
    });
  });
});
