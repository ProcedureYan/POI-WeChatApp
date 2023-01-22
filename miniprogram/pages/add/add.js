const app = getApp();
const db = wx.cloud.database();
const store = db.collection("store");
const userInfo = db.collection("userInfo");
const _ = db.command;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    problemLabel: "",
    images: [],
    content: "",
    iconPath: "",
    titleColor: {
      address: "black",
      problemLabel: "black",
      images: "black",
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  chooseLocation: function (event) {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting["scope.userLocation"]) {
          wx.authorize({
            scope: "scope.userLocation",
            success: (res) => {
              wx.chooseLocation({
                success: (res) => {
                  this.setData({
                    // address: `${res.address} ${res.name}`,
                    address: `${res.name}`,
                    latitude: res.latitude,
                    longitude: res.longitude,
                  });
                },
              });
            },
          });
        } else {
          wx.chooseLocation({
            success: (res) => {
              this.setData({
                // address: `${res.address} ${res.name}`,
                address: `${res.name}`,
                latitude: res.latitude,
                longitude: res.longitude,
              });
            },
          });
        }
      },
    });
  },

  createUserInfo: async function () {
    const openId = wx.getStorageSync("openId");
    const res = await userInfo.where({
      _openid: openId
    }).count();
    // 不存在就创建用户并设置用编号
    if (!res.total) {
      const res2 = await userInfo.where({
        _openid: _.exists(true)
      }).count();
      console.log("当前总用户数", res2.total);
      userInfo
        .add({
          data: {
            id: res2.total + 1,
            nickName: wx.getStorageSync("nickName") || "",
            avatarUrl: wx.getStorageSync("avatarUrl") || "",
            openId,
          },
        })
        .then((res) => {
          console.log("创建用户成功", res);
        });
    }
  },

  createItem: function (event) {
    this.setData({
      titleColor: {
        address: (!this.data.address || !this.data.longitude) ? "red" : "black",
        problemLabel: !this.data.problemLabel ? "red" : "black",
        images: !this.data.images.length ? "red" : "black",
      }
    })
    if (!this.data.address || !this.data.longitude || !this.data.problemLabel || !this.data.images.length) {
      wx.showToast({
        title: "缺少必填项",
        icon: "error",
      });
    } else {
      wx.showLoading({
        title: "上传数据中...",
      });
      this.createUserInfo();
      store
        .add({
          data: {
            createTime: new Date(),
            address: this.data.address,
            longitude: this.data.longitude,
            latitude: this.data.latitude,
            problemLabel: this.data.problemLabel,
            iconPath: this.data.iconPath,
            images: this.data.images,
            content: event.detail.value.content,
            userName: wx.getStorageSync('nickName')
          },
        })
        .then((res) => {
          wx.hideLoading();
          wx.showToast({
            title: "创建成功！",
            icon: "success",
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  },

  uploadImage: function (e) {
    wx.chooseImage({
      count: 2,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {

        wx.showLoading({
          title: '上传中'
        })
        let tempFilePaths = res.tempFilePaths
        let items = [];
        const promiseArr=[];
        for (const tempFilePath of tempFilePaths) {
          console.log(tempFilePath)
          promiseArr.push(new Promise((reslove,reject)=>{
            wx.cloud.uploadFile({
              cloudPath: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.png`,
              filePath:tempFilePath,
            }).then(res=>{
              console.log(res.fileID)
              this.data.images.push(res.fileID)
              reslove()
            }).catch(error=>{
              console.log(error)
            })
          }))
          console.log("here")
        }
       console.log("herre")
       
        Promise.all(promiseArr).then(result => {
          let urls = this.data.images;
          console.log(urls)
          this.setData({
            images: urls
          }, res => {
            wx.hideLoading();
            wx.showToast({
              title: '上传图片成功',
              icon: 'success'
            })
          })
        }).catch(error => {
          console.log(error)
          wx.hideLoading()
          wx.showToast({
            title: '上传图片错误',
            icon: 'error'
          })
        })

        this.setData({
          tempPhoto: items
        })
      }
    })
  },
  async uploadPhoto(filePath) {
    try {
      return wx.cloud.uploadFile({
        cloudPath: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.png`,
        filePath,
      });
    } catch (error) {
      console.log(error);
    }
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.images,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '确定要删除这个图片吗？',
      cancelText: '保留',
      confirmText: '删除',
      success: res => {
        if (res.confirm) {
          this.data.images.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            images: this.data.images
          })
        }
      }
    })
  },

  onChangeRadio(event) {
    const problemLabel = event.detail.value;
    let iconPath = "";
    switch (problemLabel) {
      case "餐饮":
        iconPath = "../../images/home/occupy.png";
        break;

      case "交通":
        iconPath = "../../images/home/design.png";
        break;

      default:
        iconPath = "../../images/home/error.png";
        break;
    }
    this.setData({
      problemLabel,
      iconPath,
    });
    console.log(iconPath)
  },
  
  goToArticle: function () {
    wx.navigateTo({
      url: '../article/article',
    })
  }
});