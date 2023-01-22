// pages/query/query.js
const app=getApp();
const db=wx.cloud.database();
const reject=db.collection('reject')
const userInfo = db.collection("userInfo");
const _ = db.command;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        problemLabel:"",
        images: [],
        Rejectcontent: "",
        Nowcontent:"",
        iconPath: "",
        titleColor: {
            problemLabel:"black",
            Rejecttextdes:"black",
            images: "black",
            Nowtextdes:"balck",
        },
        infor:{},
        UserID:""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            infor:app.globalData.infor,
            UserID:app.globalData.UserID,
        })
        console.log(this.data)
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
            Nowcontent:event.detail.value.Nowcontent,
            Rejectcontent:event.detail.value.Rejectcontent,
        })
        console.log(this.data)
        this.setData({
          titleColor: {
            images: !this.data.images.length ? "red" : "black",
            //Nowtextdes:!this.data.Nowcontent.length?"red":"black",
            //Rejecttextdes:!this.data.Rejectcontent.length?"red":"black",
            problemLabel:!this.data.problemLabel.length?"red":"black",
          }
        })
        console.log(event.detail.value)
        if (!this.data.images.length||!this.data.problemLabel.length) {
          wx.showToast({
            title: "缺少必填项",
            icon: "error",
          });
        } else {
          wx.showLoading({
            title: "上传数据中...",
          });
          this.createUserInfo();
          reject
            .add({
              data: {
                createTime: new Date(),
                _Beforid:this.data.infor._id,
                _Loadid:this.data.infor._openid,
                address: this.data.infor.address,
                longitude: this.data.infor.longitude,
                latitude: this.data.infor.latitude,
                iconPath: this.data.iconPath,
                Beforeimages: this.data.infor.images,
                Nowimages:this.data.images,
                BeforeProblemLabel:this.data.infor.problemLabel,
                NowProblemLabel:this.data.problemLabel,
                Rejectcontent: event.detail.value.Rejectcontent,
                Nowcontent:event.detail.value.Nowcontent,
                userName: wx.getStorageSync('nickName'),
                whetherFinish:false,
              },
            })
            .then((res) => {
              wx.hideLoading();
              wx.showToast({
                title: "创建成功！",
                icon: "success",
                success: (res) => {
                  wx.showModal({
                    showCancel:false,
                    title:"发送质疑成功",
                    success(res){
                        wx.navigateBack({
                            delta: 0,
                          })
                    }
                  })
                },
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

    }
})