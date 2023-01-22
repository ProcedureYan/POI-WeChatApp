// pages/search/search.js
const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        numbers:0,
        stores:[],
        focus:false,
        searched:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        this.setData({
            focus:true
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
        this.setData({
            numbers:0,
            stores:[],
            focus:false,
            searched:false
        })
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
        this.loadData();
    },

    loadData:function(keywords){
        this.onShow()
        store.skip(this.data.numbers).where({
            problemLabel:db.RegExp({
                regexp:this.data.keywords,
                options:'i',
            })
        }).get().then(res=>{
            if(res.data.length==0){
                this.setData({
                    searched:true
                })
            }
            this.setData({
                stores:this.data.stores.concat(res.data),
                numbers:this.data.numbers+res.data.length
            });
        })
    },

    search:function(e){
        this.setData({
            keywords: e.detail.value
          },res => {
            this.loadData();
          }) 
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})