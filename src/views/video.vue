<template>
  <div>
    <el-table
        :data="videos"
        style="width: 100%">
      <el-table-column
          rop="gmt_modified"
          label="日期"
          width="200">


        <template slot-scope="scope"><i class="el-icon-time"></i>{{ getTime(scope.row.gmt_modified) }}</template>


      </el-table-column>
      <el-table-column
          rop="name"
          label="视频名"
          width="180">

        <video-player class="video-player vjs-custom-skin"
                      ref="videoPlayer"
                      :playsinline="true"
                      :options="playerOptions">
        </video-player>

        <template slot-scope="scope">
          <a href="javascript:void(0);" @click="openVideo(scope.$index, scope.row)">{{ scope.row.name }}</a>
        </template>

      </el-table-column>
      <el-table-column
          rop="size"
          label="大小">
      </el-table-column>
    </el-table>
    <el-dialog
        :title="video.name"
        :visible.sync="viewVisible"
        width="30%"
        center>
    </el-dialog>
  </div>
</template>
<script>

import { videoPlayer } from 'vue-video-player'
import 'video.js/dist/video-js.css'

export default {
  name: "video",
  data() {
    return {
      videos: [{
        gmt_modified: 0,
        name: '视频',
        size: 0
      }],
      viewVisible: false,
      video: {
        name: '视频'
      },
      playerOptions: {
        playbackRates: [0.5, 1.0, 1.5, 2.0], // 可选的播放速度
        autoplay: false, // 如果为true,浏览器准备好时开始回放。
        muted: false, // 默认情况下将会消除任何音频。
        loop: false, // 是否视频一结束就重新开始。
        preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        language: 'zh-CN',
        aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [{
          type: "video/mp4", // 类型
          src: '' // url地址
        }],
        poster: '', // 封面地址
        notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controlBar: {
          timeDivider: true, // 当前时间和持续时间的分隔符
          durationDisplay: true, // 显示持续时间
          remainingTimeDisplay: false, // 是否显示剩余时间功能
          fullscreenToggle: true // 是否显示全屏按钮
        }
      }
    }
  },
  methods: {
    getTime(data) {
      let moment = require('moment');
      return moment(data).format("yyyy-MM-DD HH:mm")
    },
    getMemory() {
      return function (memory){
        let v = memory / 1024 / 1024;
        if (v < 1024) return v.toFixed(1) + "M";
        if (v < 1024 * 1024) return (v / 1024).toFixed(1) + 'G';
        if (v < 1024 * 1024 * 1024) return (v / 1024 / 1024).toFixed(1) + 'T';
      }
    },
    openVideo(index, row) {
      console.log(row);
      this.viewVisible = true
    },
  },
  components: {
    videoPlayer
  }
}
</script>

<style scoped>

</style>
