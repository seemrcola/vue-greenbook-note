import { describe, it, expect } from 'vitest'
import { reactive, effect, computed, readonly } from '../src/index.js'

describe('响应式测试', () => {
  it('test reactive: 基本测试', () => {
    /*基本测试测试用例*/
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
  //-------------------------------------------------------------

  it('test reactive: 添加不存在的属性测试', () => {
    /*基本测试测试用例*/
    let myname:string | undefined
    let myage: number = 0
    let myheight: number = 0

    let proxyData = reactive({name: 'seemr'})
    let proxyData2 = reactive({height: 1.77})

    effect(
      () => {
        myname = proxyData.name
        myheight = proxyData2.height
      }
    )

    proxyData.name = 'cola'
    expect(myname).toBe('cola')

    proxyData.age = 18
    expect(myage).toBe(0)

    proxyData2.height = 1.80
    expect(myheight).toBe(1.80)
  })
  // //------------------------------------------------------------------

  it('test reactive: 分支切换与cleanup测试', () => {
    /**
     * bug 原因
     * 当ifName变为false之后，之前收集的依赖并没有被清除掉
     * 而此时name属性已经不会再被读取到
     * /
    /*分支切换基本测试测试用例*/
    let myname:string | undefined
    let proxyData = reactive({name: 'seemr',ifName: true})
    let count = 0

    effect(
      () => {
        count ++
        myname = proxyData.ifName ? proxyData.name : 'cola'
      }
    )

    expect(myname).toBe('seemr')
    expect(count).toBe(1)

    proxyData.name = 'name'
    expect(myname).toBe('name')
    expect(count).toBe(2)

    proxyData.ifName = false
    proxyData.name = 'test'
    proxyData.name = 'test'
    proxyData.name = 'test'
    proxyData.name = 'test'
    expect(myname).toBe('cola')
    expect(count).toBe(3)
  })
  //---------------------------------------------------------------------

  it('reactive test: effect嵌套', () => {
    /**
     * bug 原因：
     * 我们用全局变量 activeEffect 来存储通过 effect 函数注册的 副作用函数，
     * 这意味着同一时刻 activeEffect 所存储的副作用函数 只能有一个。
     * 当副作用函数发生嵌套时，内层副作用函数的执行会覆 盖 activeEffect 的值，
     * 并且永远不会恢复到原来的值。
     * 这时如果再 有响应式数据进行依赖收集，即使这个响应式数据是在外层副作用函数中读取的，
     * 它们收集到的副作用函数也都会是内层副作用函数，这就是问题所在。
    */
    let temp1:any
    let temp2:any
    let proxyData = reactive({name: 'seemr', age: 22})
    effect(
      () => {
        effect( () => {
          console.log('inner effect run')
          temp1 = proxyData.name
        } )
        console.log('outer effect run')
        temp2 = proxyData.age
      }
    )
    proxyData.age = 23
    expect(temp2).toBe(23)
  })
  //--------------------------------------------------------------------

  /**
   * 如果读取操作和设置操作在同一个副作用函数触发，则有可能造成栈溢出
   * 如 obj.pointer += 1
  */

  it('computed test: readonly测试', () => {
    let obj = {
      name: 100
    }
    const p = readonly(obj)
    p.name = 999
  })
})


