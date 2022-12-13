// todo !!!!!

import { effect, reactive, ref } from '../index'
import { describe, it, expect, vi } from 'vitest'

describe('ref', () => {
    it('test ref: 基本测试', () => {
        let source = ref(100)
        let name
        effect(() => {
            name = source.value
        })
        source.value = 200
        expect(name).toBe(200)
    })
})
