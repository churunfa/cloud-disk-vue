<template>
<div v-if="success">

  <el-col>
    <el-card shadow="always">
      <div slot="header" class="clearfix">
        <span>{{this.$data.share.file_name}}</span>
        <el-button style="float: right; padding: 3px 0" type="text"
        @click="download"
        >
          <i class="el-icon-download"></i>下载
        </el-button>
      </div>
    </el-card>
  </el-col>
  <el-col>
    <el-card shadow="always">
      分享用户：{{this.$data.share.user_name}}
    </el-card>
  </el-col>

  <el-col>
    <el-card shadow="always">
      文件类型：{{this.$data.share.status}}
    </el-card>
  </el-col>

  <el-col>
    <el-card shadow="always">
      文件大小：{{this.getMemory(this.$data.share.file_size)}}
    </el-card>
  </el-col>

  <el-col>
    <el-card shadow="always">
      失效时间：{{getTime(this.$data.share.invalid_time)}}
    </el-card>
  </el-col>

  <el-col>
    <el-card shadow="always">
      请输入密码，没有密码请无视：<el-input style="width: 10%" v-model="password" placeholder="请输入密码"></el-input>
    </el-card>
  </el-col>

</div>
</template>

<script>
export default {
  name: "ShareDownload",
  data() {
    return {
      share: {
        user_id: 4,
        user_name: '用户名',
        file_name: '文件名',
        file_size: 2040000,
        status: 'PUBLIC',
        password: '',
        invalid_time: '2020-1-1',
      },
      success: false,
      password: '',
    }
  },
  methods: {
    getMemory(memory){
      let v = memory / 1024 / 1024;
      if (v < 1024) return v.toFixed(1) + "M";
      if (v < 1024 * 1024) return (v / 1024).toFixed(1) + 'G';
      if (v < 1024 * 1024 * 1024) return (v / 1024 / 1024).toFixed(1) + 'T';
      return v
    },
    download() {
      console.log(this.share.id)
      console.log(this.password)
      console.log(this.share.file_name)
      let shareId = this.$route.params.id;
      let app = this
      this.$axios({
        method: 'post',
        url: '/api/service-upload-download/share/download/',
        responseType: 'blob',
        data: {
          id: shareId,
          password: app.password,
          filename: app.share.file_name,
        }
      }).then((res) => { // 处理返回的文件流
        let content = res.data
        let blob = new Blob([content])
        let fileName = res.headers['content-disposition']

        let pat = /filename="(.*?)"/
        let v = pat.exec(fileName)

        if (v == null) {
          this.$message.error("下载失败，请检查密码是否正确")
          return
        }

        fileName = v[1]
        fileName = decodeURIComponent(fileName)
        if ('download' in document.createElement('a')) { // 非IE下载
          let elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href) // 释放URL 对象
          document.body.removeChild(elink)
        } else { // IE10+下载
          navigator.msSaveBlob(blob, fileName)
        }
      }, function (){
        this.$message.error("下载失败，请检查密码是否正确")
      })
    },
    getTime(data) {
      let moment = require('moment');
      return moment(data).format("yyyy-MM-DD HH:mm")
    },
  },
  created() {
    let shareId = this.$route.params.id;

    let app = this;
    this.$axios({
      method: 'post',
      url: '/api/service-user/file/shareInfo',
      data: {
        id: shareId
      }
    }).then(function (response){
      let dat = response.data
      console.log(dat)
      if (dat.success) {
        app.$data.share = dat.data
        app.$data.success = true
      }
      else {
        app.$message.error(dat.msg)
        app.$data.success = false
      }
    }, function() {
      // app.$message.error("请检查是否登陆")
    })

  }
}
</script>

<style scoped>

</style>
