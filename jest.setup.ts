import '@testing-library/jest-dom'

// jsdom doesn't expose Node's TextEncoder/TextDecoder; undici (used by @vercel/blob) needs them
const { TextEncoder, TextDecoder } = require('util') as typeof import('util')
Object.assign(global, { TextEncoder, TextDecoder })

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom implements requestAnimationFrame with setInterval (60 fps), which keeps the process alive
// after tests finish. Replace it with a one-shot setTimeout so handles are cleaned up.
global.requestAnimationFrame = (fn: FrameRequestCallback): number =>
  setTimeout(() => fn(performance.now()), 0) as unknown as number
global.cancelAnimationFrame = (id: number): void => clearTimeout(id)

// HeroUI's Select renders a hidden search TextField without an aria-label — React Aria warns
// about it but we can't add the label from outside the library.
const _warn = console.warn.bind(console)
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('visible label')) return
  _warn(...args)
}

Object.defineProperty(global.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'blob:mock-url'),
})

Object.defineProperty(global.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
})
