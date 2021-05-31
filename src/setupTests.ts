import { TextEncoder, TextDecoder } from 'util';

/**
 * Set up global TextEncoder and TextDecoder used by Textile hub
 */
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

jest.mock('./db');
