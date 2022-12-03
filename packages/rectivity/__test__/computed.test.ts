import { describe, it, expect } from 'vitest'
import { reactive, effect, computed } from '../src/index.js'
describe('响应式测试>computed', () => {
    it('computed test: computed但是嵌套测试', () => {
        let count = 0
        let bar:any
        let proxyData = reactive({ bar:1, foo:2 })
        const sumRes = computed(() => proxyData.foo + proxyData.bar)
        effect(() => {
            console.log('我执行了')
            count++
            // 在该副作用函数中读取 sumRes.value
            console.log('result:', sumRes.value)
        })
        // 修改 obj.foo 的值
        proxyData.foo++
        expect(count).toBe(2)
    })
})


