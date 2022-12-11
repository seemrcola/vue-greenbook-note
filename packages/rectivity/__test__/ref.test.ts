import { describe, it, expect } from 'vitest'
import { reactive, effect, computed, ref, proxyRefs } from '../src/index.js'
describe('ref test', () => {
    it('ref test: base', () => {
        const a = ref(100)
        const c = ref({ a: 100 })
        const cc = proxyRefs(c)
        a.value = 200
        c.value.a = 2300
        cc.a = 0
        expect(a.value).toBe(200)
        expect(cc.a).toBe(0)
        console.log(100)
    })
})


