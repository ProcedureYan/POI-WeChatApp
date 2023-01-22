const app=getApp();
const config = require("../../config.js");
const db=wx.cloud.database();
const store=db.collection("store");
const reject=db.collection("reject");
const trun_down=db.collection("trun-down");
// pages/map/map.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        stores:{},
        occurpyProblemNumber:2,
        errorProblemNumber:1,
        designProblemNumber:3,
        solutionProblemNumber:0,
        longitude:config.center_longitude,
        latitude:config.center_latitude,
        windowHeight:600,
        mapSubKey:config.mapSubKey,
        hideMe:true,
        showAdmin:true,
        windowHeight:app.globalData.windowHeight,
        defaultScale:config.default_scale,
        UserID:"",
        QueryNumber:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      console.log(app.globalData)
        this.goToIntro()
        let showAdmin=config.show_admin ? true : false;
        if(app.globalData.showAdmin){
            showAdmin=true;
        }
        this.setData({
            showAdmin:showAdmin,
        });
        this.getOpenID();
        this.getCenterLocation();
        this.getMarkerData();
        this.checkQuery();
        this.checkResult();
        this.data.mapCtx=wx.createMapContext("map");
        wx.showToast({
          title: '双指缩放可以调整地图可视区域',
          icon:"none"
        });
    },


    checkQuery:function(){
      wx.cloud.callFunction({
        name:"getUserOpenId"
      }).then((res)=>{
        this.data.UserID=res.result.openid;
        reject.where({_Loadid:app.globalData.openid}).get().then((res)=>{
          console.log(app.globalData.openid)
          var number=0;
          res.data.forEach((item)=>{
            if(!item.whetherFinish){
              console.log(number)
              wx.showModal({
                showCancel:false,
                title:"您有一条被质疑的兴趣点",
                confirmText:"查看",
                success(res){
                  wx.navigateTo({
                    url: '../solutionQuery/solutionQuery?number='+number,
                  })
                }
              })
            }
            number++;
          })
      })
    })
    },

    checkResult:function(){
      wx.cloud.callFunction({
        name:"getUserOpenId"
      }).then((res)=>{
        var length=0;
        console.log(app.globalData.openid)
        trun_down.where({_rejectid:app.globalData.openid}).count().then((res)=>{
          length=res.total;
          console.log(res.total)
          if(length>0){
            trun_down.where({_rejectid:app.globalData.openid}).get().then((res)=>{
              console.log(app.globalData.openid)
              console.log(res.data)
              var num=0;
              res.data.forEach((item)=>{
                if(!item.whetherlook)  {
                  if(res.data[num].result){
                    wx.showModal({
                      showCancel:false,
                      title:"您对"+res.data[num].peopleName+"的质疑成功",
                      success(){
                        trun_down.where({_rejectid:app.globalData.openid}).update({data:{whetherlook:true}})
                      }
                    })
                  }else{
                    wx.showModal({
                      showCancel:false,
                      title:"您对"+res.data[num].peopleName+"的质疑被驳回",
                      success(){
                        trun_down.where({_rejectid:app.globalData.openid}).update({data:{whetherlook:true}})
                      }
                    })
                  }
                }
                num++;
              })
 
            })
          }
        })
        console.log(length)
    })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.getMarkerData();
    },
    goToIntro: function() {
        try{
            const res=wx.getStorageSync('isNostShowIntroduction');
            console.log("isNotShowIntroduction",res);
            if(res){
                console.log("不需要展示引导");
            }else{
                console.log("需要展示引导");
                wx.navigateTo({
                  url: '../index/index.js',
                });
            }
        }catch(e){
            console.log("缓存不支持",e);
        }
    } ,

    getMarkerData:function(){
        wx.showLoading({
          title: '数据加载中',
        });
        wx.cloud
        .callFunction({
            name:"getStore",
        })
        .then((res)=>{
            console.log("云函数获取store",res.result)
            if(res.result.errMsg="collection.get:ok"){
                let data=res.result.data;
                /**
                * 处理 occurpyProblemNumber,errorProblemNumber,designProblemNumber
                */
               let occurpyProblemNumber = 0;
               let errorProblemNumber = 0;
               let designProblemNumber = 0;
               res.result.data.forEach((item) => {
                 // 这里将盲道改成兴趣点 可能出现bug和其他修改需求
                 if (item.problemLabel === "娱乐") {
                   errorProblemNumber++;
                 } else if (item.problemLabel === "餐饮") {
                   occurpyProblemNumber++;
                 } else if (item.problemLabel === "交通") {
                   designProblemNumber++;
                 }else if(item.problemLabel==="争议"){
                   solutionProblemNumber++;
                 }
                 console.log(item.problemLabel.value)
                });
                this.setData({
                    occurpyProblemNumber,
                    errorProblemNumber,
                    designProblemNumber,
                });
                /*处理marker,将ID赋给ID，保障marker事件的正确触发*/
                data.map((item,index)=>{
                    item.id=index;
                    item.width=20;
                    item.height=25;
                    item.title=item.problemLabel;
                });
                this.setData({
                    stores:data,
                },
                ()=>{wx.hideLoading();}
                );
                console.log(this.data.QueryNumber)
                if(this.data.QueryNumber){
                  wx.showModal({
                    showCancel:false,
                    title:"您有一条被质疑的兴趣点",
                    confirmText:"查看",
                    success(res){
                      wx.navigateTo({
                        url: 'url',
                      })
                    }
                  })
                }
            }else{
                ()=>{
                    wx.showToast({
                      title: '获取数据失败',
                    })
                    wx.hideLoading();
                }
            }
        });
    
    },
    getUserInfo: function (e) {
      console.log(e.detail.userInfo)
        if (e.detail.userInfo) {
          wx.cloud
            .callFunction({
              name: "checkUserAuth",
            })
            .then((res) => {
              console.log(res.result.data.is_administrator)
              if (res.result.data.is_administrator) {
                app.globalData.is_administrator = true;
                wx.showModal({
                  title: "管理员登陆成功",
                  content: "管理员您好，是否要进入新增界面？",
                  success: (res) => {
                    if (res.cancel == false && res.confirm == true) {
                      wx.navigateTo({
                        url: "../add/add",
                      });
                    } else {
                      wx.showToast({
                        title: "您可以点击下方查看全部按钮管理已有数据",
                        icon: "none",
                      });
                    }
                  },
                });
              } else {
                wx.showToast({
                  title: "您不是管理员，无法进入管理入口！",
                  icon: "none",
                });
              }
            });
        } else {
          // 处理未授权的场景
          wx.showModal({
            title: "授权失败",
            content: "您尚未授权获取您的用户信息，是否开启授权界面？",
            success: (res) => {
              if (res.confirm) {
                wx.openSetting({});
              }
            },
          });
        }
      },
    
      /**
       * 获取用户经纬度
       */
      getCenterLocation: function () {
        wx.getLocation({
          type: "gcj02",
          success: (res) => {
            this.setData({
              longitude: res.longitude,
              latitude: res.latitude,
            });
            console.log(
              "当前中心点的位置：",
              this.data.longitude,
              this.data.latitude
            );
          },
          fail: (err) => {
            wx.showToast({
              title: "请确认你的手机GPS定位已经打开",
              icon: "fail",
            });
            console.log("err", err);
          },
        });
      },
      getOpenID: function (event) {
        wx.cloud
          .callFunction({
            name: "getUserOpenId",
          })
          .then((res) => {
            try {
              wx.setStorageSync("openId", res.result.openid);
              this.setData({
                UserID:res.result.openid,
              })
              console.log("openID储存成功", this.data.UserID)
            } catch (e) {
              console.log("openID储存", res);
            }
          });
      },
      hideMe: function (res) {
        this.setData({
          hideMe: true,
        });
      },
      showAdmin: function (res) {
        wx.setStorage({
          key: "showAdmin",
          data: !this.data.showAdmin,
        });
        this.setData({
          showAdmin: !this.data.showAdmin,
        });
        console.log(this.showAdmin)
      },
      search: function () {
        wx.navigateTo({
          url: "../search/search",
        });
      },
      /**
       * 一些页面跳转
       */
      onMarkerTap: function (event) {
        console.log("marker点击", event);
        const index = event.detail.markerId;
        const _id = this.data.stores[index]._id;
        wx.navigateTo({
          url: "../info/info?id=" + _id,
        });
      },
      viewAll: function () {
        wx.navigateTo({
          url: "../list/list",
        });
      },
    
      viewMyList: function () {
        wx.navigateTo({
          url: "../myList/myList",
        });
      },
    
      addMarker: async function () {
        const nickName = wx.getStorageSync('nickName')
        if (!nickName) {
          wx.getUserProfile({
            desc: '用于记录上传者信息',
            success: (res) => {
              this.setData({
                nickName: res.userInfo.nickName,
                avatarUrl: res.userInfo.avatarUrl,
              })
              wx.setStorageSync("avatarUrl", res.userInfo.avatarUrl);
              wx.setStorageSync("nickName", res.userInfo.nickName);
              wx.navigateTo({
                url: "../add/add",
              });
            }
          })
        } else {
          wx.navigateTo({
            url: "../add/add",
          });
        }
      },
    
      goArticle: function () {
        wx.navigateTo({
          url: "../article/article",
        });
      },
    
      searchLocation: function () {
        wx.navigateTo({
          url: "../search/search",
        });
      },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return{
            title:"我在POI地图上标记了兴趣点问题，来加入我们吧",
            path:"/pages/map/map",
            imageUrl:"https://6d61-map-4g0ciu1x80002ab0-1305236624.tcb.qcloud.la/share/share-pre.jpg?sign=d0236b01a9f4f1255d06109ef4a3fa91&t=1618313697",
        }
    },
    gotoChat:function(){
    wx.navigateTo({
    url: '../../pages/Chat/Chat',
  })
}


}  
)