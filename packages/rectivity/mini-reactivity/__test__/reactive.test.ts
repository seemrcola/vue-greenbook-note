
import { effect, reactive } from '../index'
import { describe, it, expect, vi } from 'vitest'

describe('响应式测试', () => {
    it('test reactive: 基本测试', () => {
        let myname
        let proxyData = reactive({name: 'seemr'})
        effect(
            //这个函数相当于是一个执行修改操作的用户函数
            () => {
                myname = proxyData.name
            }
        )
        expect(myname).toBe('seemr')
        proxyData.name = 'cola' //proxyData改变，需要通知myname改变
        expect(myname).toBe('cola')
    })

    it('test reactive: 添加不存在的属性测试', () => {
        /*基本测试测试用例*/
        let myname:string | undefined
        let myage: number = 0

        let proxyData = reactive({name: 'seemr'})

        effect(
            () => {
                myname = proxyData.name
            }
        )

        proxyData.name = 'cola'
        expect(myname).toBe('cola')

        proxyData.age = 18
        expect(myage).toBe(0)
    })

    it('test reactive: 分支切换与cleanup', () => {
        let obj = reactive({
            dep: true,
            name: 'seemr'
        })
        let message
        let fn = vi.fn(() => {
            message = obj.dep ? obj.name : 'helloworld'
        })
        effect(fn)
        expect(fn).toHaveBeenCalledTimes(1)
        obj.name = 'cola'
        expect(fn).toHaveBeenCalledTimes(2)
        obj.dep = false //此时再次改动obj.name不应该触发effect
        expect(fn).toHaveBeenCalledTimes(3)
        obj.name = 'test'
        expect(fn).toHaveBeenCalledTimes(3)
    })
})



