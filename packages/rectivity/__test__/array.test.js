import { reactive, effect, computed } from '../src/index.js'
import { describe, expect, it } from "vitest";
describe('reactive代理数组', () => {
    it('reactive test: 代理数组', () => {
        let count = 0
        const arr = reactive(['foo']) // 数组的原长度为 1
        effect(() => {
            count ++
            console.log(arr.length) // 1
        })
        // 设置索引 1 的值，会导致数组的长度变为 2
        arr[1] = 'bar'
        expect(count).toBe(2)
    })
})
