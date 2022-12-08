const originMethod = Array.prototype.includes
const arrayInstrumentations = {
    includes: function (...args) {
        // this 是代理对象，先在代理对象中查找，将结果存储到 res 中
        let res = originMethod.apply(this, args)

        if (res === false) {
            // res 为 false 说明没找到，通过 this.raw 拿到原始数组，再去其中查找并更新 res 值
            res = originMethod.apply(this.raw, args)
        }
        // 返回最终结果
        return res
    }
}

export { arrayInstrumentations }
