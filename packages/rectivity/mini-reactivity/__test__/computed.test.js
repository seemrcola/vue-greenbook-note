
import { effect, reactive, computed } from '../index'
import { describe, it, expect, vi } from 'vitest'

describe('computed', () => {
    it('test computed: 基本测试', () => {
        let obj = reactive({ name: 'seemr' })
        let count = 0
        let name = computed(() => {
            count++
            return obj.name + 100
        })
        name.value
        name.value
        name.value
        console.log(count)
    })
})



