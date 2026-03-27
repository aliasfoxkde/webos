import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = () => {};
  disconnect = () => {};
  unobserve = () => {};
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = () => {};
  disconnect = () => {};
  unobserve = () => {};
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock DOMMatrix for pdfjs-dist
class MockDOMMatrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;
  is2D = true;
  isIdentity = true;
  static fromMatrix() { return new MockDOMMatrix(); }
  static fromFloat32Array() { return new MockDOMMatrix(); }
  static fromFloat64Array() { return new MockDOMMatrix(); }
  inverse() { return this; }
  multiply() { return this; }
  toString() { return 'matrix(1, 0, 0, 1, 0, 0)'; }
}

globalThis.DOMMatrix = MockDOMMatrix;
