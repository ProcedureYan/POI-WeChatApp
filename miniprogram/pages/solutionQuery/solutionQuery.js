// pages/solutionQuery/solutionQuery.js
const app=getApp();
const db = wx.cloud.database();
const store = db.collection("store");
const config = require("../../config.js");
const reject=db.collection("reject");
const turn_down=db.collection("trun-down")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        number:0,
        Beforinfor:{},
        Nowinfor:{},
        UserID:"",
        is_myself:false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            number:options.number-1,
        })
        console.log(this.data.number)
        wx.showLoading({
            title: "加载中...",
          });
           // 获取url页面参数
    console.log("id", options.id);
    reject.where({_Loadid:app.globalData.openid}).get()
    .then((res)=>{
        this.setData({
            Nowinfor:res.data[this.data.number],
        })
        store
        .where({_id:this.data.Nowinfor._Beforid})
        .get()
        .then((res) => {
          console.log(options.id)
          this.setData(
            {
              Beforinfor: res.data[0],
            },
            (res) => {
              wx.hideLoading();
            }
          );
          console.log(this.data.is_administrator)
          console.log(res)
        });
    })


    },
    tapNowImage: function (e) {
        wx.previewImage({
          urls: this.data.Nowinfor.Nowimages,
          current: e.currentTarget.dataset.url,
        });
    },
    tapBeforImage: function (e) {
        wx.previewImage({
          urls: this.data.Beforinfor.images,
          current: e.currentTarget.dataset.url,
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

    },

    attain:function(){
        store.where({_id:this.data.Nowinfor._Beforid}).update({data:{
            iconPath:this.data.Nowinfor.iconPath,
            content:this.data.Nowinfor.Nowcontent,
            images:this.data.Nowinfor.Nowimages,
            problemLabel:this.data.Nowinfor.NowProblemLabel
        }})
        turn_down.add({data:{
            whetherlook:false,
            _rejectid:this.data.Nowinfor._openid,
            result:true,
            peopleName:this.data.Beforinfor.userName
        }})
        reject.where({_id:this.data.Nowinfor._id}).update({data:{
            whetherFinish:true,
        }}).then((res)=>{
            wx.showToast({
              title: '修改成功',
              icon:"success"
            })
            console.log(this.data.Nowinfor._id)
        })
    },

    turndown:function(){
        turn_down.add({data:{
            whetherlook:false,
            _rejectid:this.data.Nowinfor._openid,
            result:false,
            peopleName:this.data.Beforinfor.userName
        }})
        reject.where({_id:this.data.Nowinfor._id}).update({data:{
            whetherFinish:true,
        }}).then((res)=>{
            wx.showToast({
              title: '驳回成功',
              icon:"success"
            })
        })
    }

})