# BankBin
按银行卡卡号检测该银行卡类型，银行名称，银行代码 银行卡信息库更新于（2019-08）

# 通过银行卡号查询银行类型和银行卡类型,修复在与阿里API，混用时，导致的返回结果有可能会被上一次的Promise覆盖。
# 在input事件中高频率调用时，如果开启async配置,出现多个promise 中，  上一次的xhr在未完成请求的情况下会被cancle掉



*采用 es6 class构造类    import导入 银行卡信息库*

# 安装
## npm install chinabankbin

#返回结果

### validated 为true时，验证成功
```js

{
    cardNo:"6217003810020275930"
    data: {
        cardType: "DC",
        cardTypeName: "储蓄卡",
        bankName: "中国建设银行",
        bankCode: "CCB"
    }
    validated:true
    msg:"匹配成功"
}

```


# 使用方式 new BankBin(cardNo,options)
### 成功获取银行卡信息后，返回一个对象.

### promise.then方式调用
```js
    import BankBin from 'bankbin';

    new BankBin(6217003810020275930).then(function(res){
            console.log(res)
    },function(res){
        console.log('验证失败')
    });

```

### async/await方式调用
```js
    import BankBin from 'bankbin';

    try{
        const res = await new BankBin(6217003810020275930);
        console.log(res)
    } catch (e){
        console.log('验证失败')
    }

```

# options 参数
```js

{
    async : false,              //默认false,  是否在内置银行卡信息中查询失败后，调用支付宝开放式银行卡查询API。
    timeout : 10000             //默认10000,  async参数为true时，生效.  API调用超时时间
}

//例：
try{
    const res = await new BankBin(6217003810020275930, { async : true });
    console.log(res)
} catch (e){
    console.log('验证失败')
}
```
## 小结

1. 优先使用内置的银行卡信息库进行规则匹配,当前内置123个银行信息，能满足国内众多银行卡信息识别。银行卡信息库更新于（2019-08）
2. 当系统自带的规则获取不到卡bin时，会调用支付宝的接口来获取，[测试地址](https://ccdcapi.alipay.com/validateAndCacheCardInfo.json?cardNo=6227003320232234322&cardBinCheck=true)
3. 支持 es6 import

## 捐赠

如果你觉得这写文章能帮助到了你，你可以帮作者买一杯果汁表示鼓励
![pay](https://github.com/burningmyself/bank/raw/master/bank.logo/resource/pay.png)

[Paypal Me](https://paypal.me/yangfubing)
