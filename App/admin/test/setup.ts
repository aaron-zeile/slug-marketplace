import 'reflect-metadata';
import '@testing-library/jest-dom/vitest';

process.env.SESSION_SECRET = 'test-secret-must-be-at-least-32-characters-long!!';
process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
