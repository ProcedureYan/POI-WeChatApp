// pages/info/info.js
const app = getApp();
const db = wx.cloud.database();
const store = db.collection("store");
const config = require("../../config.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
      infor:{},
      UserID:"",
      is_myself:false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: "加载中...",
          });
           // 获取url页面参数
    console.log("id", options.id);
    wx.cloud
          .callFunction({
            name: "getUserOpenId",
          })
          .then((res) => {
            try {
              this.setData({
                UserID:res.result.openid,
              });
              console.log("openID储存成功", res.result.openid)
              console.log(this.data.UserID)
            } catch (e) {
              console.log("openID储存成功", res);
            }
          });
    store
      .where({_id:options.id})
      .get()
      .then((res) => {
        console.log(options.id)
        this.setData(
          {
            infor: res.data[0],
            is_administrator: app.globalData.is_administrator,
          },
          (res) => {
            wx.hideLoading();
          }
        );
        console.log(this.data.is_administrator)
        console.log(res)
      });

    },

    tapImage: function (e) {
        wx.previewImage({
          urls: this.data.infor.images,
          current: e.currentTarget.dataset.url,
        });
    },

    copyPath: function (e) {
        let path = this.route + "?id=" + this.data.infor._id;
        wx.setClipboardData({
          data: path,
          success: (res) => {
            wx.showToast({
              title: "路径复制成功",
              icon: "success",
            });
          },
        });
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
        return {
            title: "我在POI地图上标记了一处兴趣点问题，你也快来加入我们吧",
            path: "/pages/map/map",
            imageUrl:
              "https://6d61-map-4g0ciu1x80002ab0-1305236624.tcb.qcloud.la/share/share-pre.jpg?sign=d0236b01a9f4f1255d06109ef4a3fa91&t=1618313697",
          };
    },

    callContact: function (event) {
        wx.makePhoneCall({
          phoneNumber: this.data.store.contact,
        });
      },
      navigate: function (e) {
        wx.openLocation({
          latitude: this.data.infor.latitude,
          longitude: this.data.infor.longitude,
          address: this.data.infor.address,
        });
      },

      deleteItem: function (e) {
        wx.showModal({
          title: "删除确认",
          content: "您真的要删除么？",
          success: (res) => {
            if (res.confirm) {
              store
                .doc(this.data.infor._id)
                .remove()
                .then((res) => {
                  wx.showToast({
                    title: "删除成功",
                    icon: "success",
                    success: (res) => {
                      wx.navigateBack({
                        delta: 2,
                      });
                    },
                  });
                })
                .catch((error) => {
                  wx.showToast({
                    title: "删除失败！请添加微信 todo 排查问题",
                  });
                });
            } else if (res.cancel) {
              console.log("用户点击取消");
            }
          },
        });
      },

      solution:function(){
        var that=this;
        app.globalData.infor=that.data.infor;
        app.globalData.UserID=that.data.UserID;
        console.log(app.globalData)
        wx.redirectTo({
          url: '../../pages/query/query',
        })
      }

})