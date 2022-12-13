
import { effect, reactive, shallowReactive } from '../index'
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

    it('test reactive: effect嵌套', () => {
        /*嵌套渲染是非常常见的，vue模板里面的组件就时常嵌套渲染*/
        const foo = reactive({ name: 'foo' })
        const bar = reactive({ name: 'bar' })
        let name1 , name2
        effect(
            () => {
                effect(() => {
                    name2 = bar.name
                })
                name1 = foo.name
            }
        )
        foo.name = 'ffoo'
        bar.name = 'bbar'
        expect(name1).toBe('ffoo')
        expect(name2).toBe('bbar')
    })

    it('test reactive: effect浅层与深层', () => {
        const obj = reactive({ person: {name: 'cola'} })
        let name
        effect(() => { name = obj.person.name })
        obj.person.name = 'seemr'
        expect(name).toBe('seemr')

        const shallow = shallowReactive({ person: {name: 'cola'} })
        let leo
        effect(() => { leo = shallow.person.name })
        shallow.person.name = 'seemr'
        expect(leo).toBe('cola')
    })

    it('test reactive: effect调度', () => {
        /*我们希望可以自行控制一些调度逻辑*/
        const obj = reactive({name: 'seemr'})
        let name
        effect(
            () => name = obj.name,
            {
                scheduler: (fn) => {
                    console.log(100)
                    fn()
                }
            }
        )
        obj.name = 'xxx'
        expect(name).toBe('xxx')
    })
})



