import { reactive, effect, computed } from '../src/index.js'
import {describe, expect, it} from "vitest";
describe('reactive缺陷测试', () => {
    it('reactive test: 非reflect情况下存在的问题', () => {
        let count = 0
        let obj = {
            foo: 1,
            get bar() {
                return this.foo
            }
        }
        let p = reactive(obj)
        effect(() => {
            count++
            console.log(p.bar)
        })
        //因为p.bar中会用到obj.foo，所以我们希望属性foo也会收集到该effect函数。
        p.foo++
        expect(count).toBe(2)
    })
})
