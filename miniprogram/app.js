// app.js
const config = require('config');
const Cloud = require('common/util/cloud-call');
App({
  onLaunch: function () {
    this.InitCloud(); //初始化云服务 / ESC
    this.InitCustom(); //初始化custom所需配置信息
  },
  InitCloud() {
    var that = this;
    wx.cloud.init({
      env: config.CloudID,
      traceUser: true
    })
    Cloud.GetOpenData().then(res => {
      console.log(res)
      that.globalData.openid = res.result.openid;
      //异步配置缓存
      wx.setStorageSync('openid', res.result.openid);
    })
  },
  InitCustom() {
    wx.getSystemInfo({
      success: e => {
        //console.log(e)
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        // console.log(custom)
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
        env:'cloud1-6gvo9lsida21f698'
      });
    }
    //获取屏幕高度
    let {windowHeight}=wx.getSystemInfoSync();
    let showAdmin=wx.getStorageSync('showAdmin');
    if (showAdmin==""){showAdmin=false;}
    const reject=wx.cloud.database().collection("reject");
    var UserID="";
    var QueryNumber=0;
    
    

    this.globalData = {windowHeight,is_administrator:false,showAdmin:showAdmin,infor:{},UserID:UserID,QueryNumber:QueryNumber};
  },
  globalData:{

  },
  config,
  Cloud,

})