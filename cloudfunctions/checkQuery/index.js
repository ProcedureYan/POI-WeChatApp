// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
    traceUser:true,
    env: "cloud1-6gvo9lsida21f698"
})
const db = cloud.database()
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    let openid=await cloud.callFunction({
        name:"getUserOpenId"
    })
    console.log(openid);
    const Reject = await db.collection('reject')
    var checkNumber=0;
    Reject.where({_Loadid:openid.result.openid}).count().then((res)=>{
        checkNumber=res.total;
    })
    return {
        event,
        checkNumber:checkNumber,
    }
}