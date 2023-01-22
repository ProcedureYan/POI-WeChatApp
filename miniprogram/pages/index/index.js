// index.js
// const app = getApp()
const { envList } = require('../../envList.js');

Page({
  data: {
    isNotShowIntroduction:true,
  },

  onCloseIntroduction(){
    console.log("关闭新手引导");
    try {
      wx.setStorageSync("isNotShowIntroduction", true);
    } catch (e) {}
    wx.navigateTo({
      url: "../map/map",
    });
  },
  
});
