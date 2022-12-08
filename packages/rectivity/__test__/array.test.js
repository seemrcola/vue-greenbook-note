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

    it('reactive test: for in', () => {
        let count = 0
        const arr = reactive([1,2,3,4])
        effect(() => {
            count++
            for(let i in arr) void 0
         })
        arr.length = 8
        expect(count).toBe(2)
    })

    it('reactive test: for of', () => {
        let count = 0
        const arr = reactive([1,2,3,4])
        effect(() => {
            count++
            for(let i of arr) void 0
        })
        arr.length = 8
        expect(count).toBe(2)
    })

    it('reactive test: includes方法', () => {
        const obj = {}
        const arr = reactive([obj])

        console.log(arr.includes(arr[0]))  // false
        expect(arr.includes(arr[0])).toBe(true)
    })
})
