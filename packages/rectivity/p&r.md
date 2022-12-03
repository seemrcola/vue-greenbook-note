## Proxy与Reflect

### 理解Proxy和Reflect
这部分具体可以看书上5.1的讲解。  
这里简单描述一下：  
对象(函数也是对象)有一些最基本的操作， proxy可以拦截这些最基本的操作，让我们对这些基本操作做一些处理。 
- 基本操作可以看ecma规范或者阮一峰老师的ES6教程
- 多个基本操作结合的教复合操作(如对象的方法调用)
- Reflect中的方法和Proxy的traps(traps即基本操作)一一对应

我们举个例子：
```js
const obj = {name : 100}
// 直接读取
obj.name
// Reflect读取
Reflect.get(obj, 'name')
```
这两个操作等价。
那么既然操作等价，我们还有没有必要将reactive函数中的直接读取优化成Reflect读取呢。是有必要的。  
见：__test__/reactive.test.ts

原因分析：  
我们在reactive函数的代码中，可以看到，我们返回得是 target[key],这个target[key]中的**target**实际上值的是
对象obj，而不是p。而我们可以知道p.bar中的this指向的是p。  
也就是说，我们并没有读取到p.foo，也就没有触发foo的读取，就不会让该effect函数被foo收集。

那么reflect可以改变this指向吗。可以。只需要用上第三个参数，即 <reciever>。详情参见阮一峰es6。



