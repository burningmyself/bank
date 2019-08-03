import BankList from './bank';

const CARDTYPE = {
    DC: "储蓄卡",
    CC: "信用卡",
    SCC: "准贷记卡",
    PC: "预付费卡",
};

const ALIPAYAPI = (cardNo)=>{
    return `https://ccdcapi.alipay.com/validateAndCacheCardInfo.json?cardNo=${cardNo}&cardBinCheck=true`;
};

const que = [];     //队列

export default class BankBin {
    constructor(cardNo,options){
        //实例ID
        this.instanceId = Number(Math.random().toString().substr(3,length) + Date.now()).toString(36);
        this.cardNo = cardNo;
        this.options  = {
            async : false,           //是否开启API检测
            timeout: 10000,          //api调用超时
        };
        this.validated = false;
        if(options && options !== null && typeof options === 'object' && !Array.isArray(options)){
            Object.keys(options).forEach(key=>{
                this.options[key] = options[key];
            });
        }
        if(que.length){
            que[0].xhr && que[0].xhr.abort();
            que[0].reject({});
        }
        return new Promise((resolve, reject) => {
            this.resolve = resolve ;
            this.reject = reject ;
            que.unshift({
                resolve,
                reject,
                instanceId : this.instanceId,
            });
            this.init();
        });
    }
    init (){
        this.checkCard() &&  this.matchCard();
    }
    //检测卡号
    checkCard (){
        if(!/^\d{15,19}$/g.test(this.cardNo)){
            this.reject({
                validated : this.validated,
                msg : '银行卡号必须是15至19位数字'
            });
            return false;
        }
        return true;
    }
    //开始匹配
    matchCard (){
        BankList.forEach( bank => {
            const patterns = bank.patterns ;
            patterns.forEach( it => {
                if ((new RegExp(it.reg)).test(this.cardNo)) {
                    const res = Object.assign({
                        cardType : it.cardType ,
                        cardTypeName : CARDTYPE[it.cardType],
                    }, bank) ;
                    delete res.patterns;
                    this.validated = true;
                    this.resolve({
                        validated : this.validated,
                        msg : '匹配成功',
                        cardNo : this.cardNo,
                        data : res
                    })
                }
            })
        });

        //内置银行配置，检测失败，是否调用支付宝API，检测
        if(!this.validated){
            if( this.options.async ) {
                this.initAsyncApi();
            }else{
                this.reject({
                    validated : this.validated,
                    cardNo : this.cardNo,
                    msg : '不匹配',
                })
            }
        }

    }
    //调用支付宝开放式接口匹配
    initAsyncApi (){
        console.log('开始调用支付宝开放式检测接口....');
        const xhr = new XMLHttpRequest();
        const method = 'GET';
        const url = ALIPAYAPI(this.cardNo);
        const instance = que.find(it=>it.instanceId ===this.instanceId );
        instance.xhr = xhr;
        xhr.timeout = this.options.timeout;
        xhr.open(method, url);
        xhr.onreadystatechange = ()=> {
            if(xhr.readyState === XMLHttpRequest.DONE){
                if(xhr.status === 200){
                    const responseText = xhr.responseText;
                    try{
                        const res = JSON.parse(responseText);
                        if(res.validated) {
                            const data = {
                                bankName : CARDTYPE[res.cardType],
                                bankCode : res.bank,
                                cardType : res.cardType,
                                cardTypeName : CARDTYPE[res.cardType]
                            };
                            this.validated = res.validated;
                            this.resolve({
                                validated : this.validated,
                                msg : '成功',
                                cardNo : this.cardNo,
                                apiStatus : true,
                                data
                            })
                        }else{
                            this.validated = res.validated;
                            this.reject({
                                validated : this.validated,
                                apiStatus : false,
                                msg : '验证失败'
                            })
                        }
                    }catch (e) {
                        this.reject({
                            validated : this.validated,
                            apiStatus : false,
                            msg : e,
                        })
                    }
                }else{
                    this.reject({
                        validated : this.validated,
                        cardNo : this.cardNo,
                        status : xhr.status,
                        apiStatus : false,
                        msg : '网络请求错误',
                    })
                }
            }
        };
        xhr.ontimeout = ()=>{
            this.validated = false;
            this.reject({
                validated : this.validated,
                cardNo : this.cardNo,
                timeout : true,
                apiStatus : false,
                msg : '超时',
            })
        };
        xhr.send();
    }
}

