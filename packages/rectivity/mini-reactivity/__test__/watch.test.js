
import { effect, reactive, watch } from '../index'
import { describe, it, expect, vi } from 'vitest'

describe('watch', () => {
    it('test watch: 基本测试', () => {
        let source = reactive({name: 'cola'})
        let count = 0
        /*watch默认是深度监听*/
        watch(
            source,
            () => {
                count++
                console.log('watch run')
            }
        )
        source.name = 'ccola'
        expect(count).toBe(1)
    })

    it('test watch: 属性监听测试', () => {
        let source = reactive({name: 'cola'})
        let count = 0
        watch(
            () => source.name,
            () => {
                count++
                console.log('watch run')
            }
        )
        source.name = 'ccola'
        expect(count).toBe(1)
    })
})
