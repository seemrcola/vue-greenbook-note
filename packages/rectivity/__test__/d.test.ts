import {describe, it, expect} from 'vitest'

function add(a: number, b: number) {
  return a + b
}

describe('vitset测试', () => {
  it('test add',() => {
    expect(add(1, 2)).toBe(3)
  })
})
