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

    it('reactive test: in 运算', () => {
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
            "foo" in p
        })
         p.foo++
        expect(count).toBe(2)
    })

    it('reactive test: for in 运算', () => {
        let count = 0
        let obj = {
            foo: 1,
            get bar() {
                return this.foo
            }
        }
        let obj2 = {...obj}
        let p = reactive(obj)
        let p2 = reactive(obj2)
        effect(() => {
            console.log('执行了')
            count++
            for(let i in p) 0
        })
        effect(() => {
            console.log('执行了2')
            for(let i in p2) 0
        })
        p.name = 'cola'
        p2.name = 'cola'
        p.name = 'ccc'
        delete p.name
        expect(count).toBe(3)
    })
})
