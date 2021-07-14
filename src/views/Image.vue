<template>
  <div v-infinite-scroll="load">

    <el-row :gutter="10">
      <el-col :span="2" v-for="(url, index) in urls">
        <el-image
            style="width: 100px; height: 100px"
            :src="url"
            :preview-src-list="getSrcList(index)">
        </el-image>
        <div style="height: 50px"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Image",
  data() {
    return {
      urls: [
        // 'http://localhost:8080/api/service-upload-download/download/220',
        // 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
        ],
      count: 0,
      status: false
    }
  },
  methods: {
    getSrcList(index){
      return this.urls.slice(index).concat(this.urls.slice(0,index))
    },
    load () {
      if (this.status) return
      this.getVerify()
      // this.urls.push("https://fuss10.elemecdn.com/1/8e/aeffeb4de74e2fde4bd74fc7b4486jpeg.jpeg")
    },
    getVerify() {
      let app = this
      this.$axios({
        url: '/api/service-upload-download/getImage/' + app.count,
        responseType: 'arraybuffer',
      }).then(res => {
        if (res.data.byteLength == 0) {
          app.$message.success("已加载全部")
          this.status = true
          return
        }
        const src =
            "data:image/png;base64," +
            btoa(
                new Uint8Array(res.data).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    ""
                )
            );
        app.urls.push(src)
        app.count++
      })
      .catch(error => {
        console.log(error);
      });
      },
  },
  created() {
    console.log(this.status)
  }
}
</script>

<style scoped>

</style>
