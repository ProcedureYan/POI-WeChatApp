// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    traceUser:true,
    env: "cloud1-6gvo9lsida21f698"
})
const db = cloud.database()
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
    // 先取出集合记录总数
  const countResult = await db.collection('store').count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('store').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  // 这里需要至少数据库中含有数据，否则reduce为空会一直加载，这里注意数据组织
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}