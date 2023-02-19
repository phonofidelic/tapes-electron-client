import { TextEncoder, TextDecoder } from 'util';
import 'jest-canvas-mock';
/**
 * Set up global TextEncoder and TextDecoder used by Textile hub
 */
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

jest.mock('react-router', () => ({
  // @ts-ignore
  ...jest.requireActual('react-router'),
  useLocation: () => ({
    pathname: '/',
  }),
}));

jest.mock('./db/OrbitConnection', () => ({
  Instance: jest.fn().mockImplementation(() => ({
    orbitdb: jest.fn().mockImplementation(() => ({
      docs: jest.fn().mockImplementation(() => ({ load: jest.fn() })),
      kvstore: jest.fn(),
    })),
    node: jest.fn().mockResolvedValue(() => ({
      id: jest.fn().mockResolvedValue(() => 'test123'),
    })),
  })),
}));
