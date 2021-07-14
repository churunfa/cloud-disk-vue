<template>
  <div>
    <el-table
        ref="multipleTable"
        :data="fileData"
        tooltip-effect="dark"
        style ="width: 100%"
        height="610"
        :default-sort = "{prop: 'gmt_modified'}"
        @selection-change="handleSelectionChange">
      <el-table-column
          type="selection"
          width="55">
      </el-table-column>
      <el-table-column
          label="文件名"
          rop="file_name"
          sortable
          width="300">
        <template slot-scope="scope">
          <div v-if="scope.row.fileType == 'DIR'">
            <a href="javascript:void(0);" @click="changeDir(scope.$index, scope.row)" class="normal">
              <i class="el-icon-folder-opened"></i>
              {{ scope.row.file_name }}
            </a>
          </div>
          <div v-else>
            {{ scope.row.file_name }}
          </div>
        </template>
      </el-table-column>

      <el-table-column
          label="大小"
          rop="size"
          sortable
          width="120">
        <template slot-scope="scope">
          <div v-if="scope.row.fileType === 'FILE'">
            {{ getMemory(scope.row.size) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column
          label="修改时间"
          rop="gmt_modified"
          sortable
          width="200">
        <template slot-scope="scope"><i class="el-icon-time"></i>{{ getTime(scope.row.gmt_modified) }}</template>
      </el-table-column>

      <el-table-column
          :label="dir"
          width="200"
      >
      </el-table-column>

      <el-table-column
      >
        <template slot="header">
          <el-button size="mini" @click="back">
            <i class="el-icon-back"></i>返回上级目录
          </el-button>
        </template>
      </el-table-column>

      <el-table-column align="right" width="120">
        <template slot="header" slot-scope="scope">
          <el-button round @click="newDirHandle"><i class="el-icon-news">新建</i></el-button>
        </template>
        <template slot-scope="scope">
          <div v-if="scope.row.fileType == 'FILE'">
            <el-button
                size="mini"
                @click="download(scope.$index, scope.row)">
              <i class="el-icon-download">下载</i>
            </el-button>
          </div>
        </template>
      </el-table-column>

      <el-table-column align="right" width="120">
        <template slot="header" slot-scope="scope">
          <el-upload
              class="upload-demo"
              action
              :http-request="uploadAPI"
              multiple
              :on-success="upload_success"
              :on-error="upload_error"
              :show-file-list="false"
          >
            <el-button
                type="success"
                round
                size="medium"
            >
              <div>上传<i class="el-icon-upload"></i></div>
            </el-button>
          </el-upload>

        </template>
        <template slot-scope="scope">
          <el-button
              size="mini"
              @click="handleMove(scope.$index, scope.row)">
            <i class="el-icon-document-remove">移动</i>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
          align="right"
          width="200">
        <template slot="header" slot-scope="scope">
          <el-button type="success" icon="el-icon-download" @click="downloadPlus" circle></el-button>
          <el-button type="danger" round @click="deletePlus">
            删除选中<i class="el-icon-delete"></i>
          </el-button>
        </template>
        <template slot-scope="scope">
          <el-button
              size="mini"
              v-if="scope.row.fileType == 'FILE'"
              @click="handleShare(scope.$index, scope.row)">
            <i class="el-icon-share"></i>
          </el-button>
          <el-button
              size="mini"
              @click="handleEdit(scope.$index, scope.row)">
            <i class="el-icon-edit"></i>
          </el-button>
          <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
        title="创建文件夹"
        :visible.sync="newDirVisible"
        width="30%"
        center>
      <el-input v-model="dirName" placeholder="请输入文件夹名"></el-input>
      <span slot="footer" class="dialog-footer">
            <el-button @click="newDirVisible = false">取 消</el-button>
            <el-button type="primary" @click="newDirAPI">确 定</el-button>
          </span>
    </el-dialog>

    <el-dialog
        title="重命名"
        :visible.sync="editVisible"
        width="30%"
        center>
      <el-input v-model="filename" placeholder="请输入文件/文件夹名"></el-input>
      <span slot="footer" class="dialog-footer">
            <el-button @click="editVisible = false">取 消</el-button>
            <el-button type="primary" @click="renameAPI">确 定</el-button>
          </span>
    </el-dialog>

    <el-dialog
        title="移动到"
        :visible.sync="moveVisible"
        width="30%"
        center>
      <el-input v-model="newDir" placeholder="请输入需要移到的路径"></el-input>
      <span slot="footer" class="dialog-footer">
            <el-button @click="moveVisible = false">取 消</el-button>
            <el-button type="primary" @click="moveAPI">确 定</el-button>
          </span>
    </el-dialog>
    <el-dialog
        title="分享"
        :visible.sync="shareVisible"
        width="30%"
        center>
      <el-radio v-model="shareStatus" label="PUBLIC">公开</el-radio>
      <el-radio v-model="shareStatus" label="PASSWORD">加密</el-radio>
      <el-input v-model="sharePassword" placeholder="请输入密码" v-if="shareStatus == 'PASSWORD'"></el-input>
      <el-alert
          :title="shareMsg"
          :type="shareType">
        <span v-if="shareType == 'success'">
          <a :href="shareContent">{{shareContent}}</a>
        </span>
        <span v-if="shareType == 'ERROR'">
          {{shareContent}}
        </span>
      </el-alert>
      <span slot="footer" class="dialog-footer">
            <el-button @click="shareVisible = false">取 消</el-button>
            <el-button type="primary" @click="shareAPI">确 定</el-button>
          </span>
    </el-dialog>
    <div class="block">
      <el-pagination
          layout="prev, pager, next"
          :total="pageTotal"
          :page-size:="pageSize"
          :currentPage="pageNo"
          :pageCount="pageCount"
          @current-change="handleCurrentChange"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dir:'/',
      fileData: [],
      pageNo: 1,
      multipleSelection: [],
      newDirVisible: false,
      dirName: '',
      pageTotal: 1,
      pageCount: 1,
      pageSize: 10,
      editVisible: false,
      moveVisible: false,
      shareVisible: false,
      filename: '',
      fileId: '',
      newDir: '',
      sharePassword: '',
      shareStatus: 'PUBLIC',
      shareType: '',
      shareMsg: '',
      shareContent: '',
    }
  },

  methods: {
    handleCurrentChange(val) {
      this.$data.pageNo = val
      this.getListAPI(this.$data.dir)
    },
    newDirHandle() {
      this.dirName = ''
      this.newDirVisible = true
    },
    back(){
      let path = this.dir
      if (path == '/') {
        this.$message.warning("已经处于最上级目录了！")
        return
      }
      let len = path.length
      let count = 0
      let ed = 1
      for (ed = len - 1; ed >= 0; ed--) {
        if (count == 1 && path[ed] == '/') break
        if (path[ed] == '/') count++
      }

      path = path.slice(0, ed + 1)

      this.getListAPI(path)

    },
    getTime(data) {
      let moment = require('moment');
      return moment(data).format("yyyy-MM-DD HH:mm")
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleEdit(index, row) {
      console.log(row)
      this.fileId = row.id
      this.filename = row.file_name
      this.editVisible = true
    },
    handleDelete(index, row) {
      console.log(index, row);
      let app = this;
      this.$axios({
        method: 'post',
        url: '/api/service-user/file/delete/' + row.id,

      }).then(function (response){
        let dat = response.data
        if (!dat.success) {
          app.$message.error(dat.msg)
        }
        else {
          app.$message.success(dat.msg)
          app.getListAPI(app.$data.dir)
          app.$emit("checkLoginAPI")
        }
      }, function (){
        app.$message.error("服务器错误")
      })
    },
    deletePlus() {
      let data = this.multipleSelection
      let len = data.length

      let arr = new Array()

      for (let i = 0; i < len; i++) {
        let file = data[i]
        arr.push(file.id)
      }

      let app = this;
      this.$axios({
        method: 'post',
        url: '/api/service-user/file/deletes',
        data: arr
      }).then(function (response){
        let dat = response.data
        if (!dat.success) {
          app.$message.error(dat.msg)
        }
        else {
          app.$message.success(dat.msg)
          app.getListAPI(app.$data.dir)
          app.$emit("checkLoginAPI")
        }
      }, function (){
        app.$message.error("服务器错误")
      })

    },
    handleShare(index, row) {
      this.shareType = ''
      this.shareMsg = ''
      console.log(index, row);
      this.fileId = row.id
      this.shareVisible = true
    },
    handleMove(index, row) {
      console.log(index, row);
      this.fileId = row.id
      this.newDir = this.dir
      this.moveVisible = true
    },
    download(index, row) {
      let app = this
      this.$axios({
        method: 'post',
        url: '/api/service-upload-download/download/' + row.id,
        responseType: 'blob'
      }).then((res) => { // 处理返回的文件流
        let content = res.data
        let blob = new Blob([content])
        let fileName = res.headers['content-disposition']
        let pat = /filename="(.*?)"/
        let v = pat.exec(fileName)
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
        app.$message.error("服务器错误")
      })
    },
    downloadPlus() {
      let files = this.multipleSelection

      let len = files.length

      if (len == 0) {
        this.$message.warning("您未选择任何文件")
        return
      }

      let arr = new Array()

      for (let i = 0; i < len; i++) {
        let file = files[i]
        if (file.fileType == 'DIR') {
          this.$message.warning("文件夹不可下载！")
          return
        }
        arr.push(file.id)
      }

      console.log(arr)

      let app = this
      this.$axios({
        method: 'post',
        url: '/api/service-upload-download/downloads/',
        data: arr,
        responseType: 'blob'
      }).then((res) => { // 处理返回的文件流
        let content = res.data
        let blob = new Blob([content])
        let fileName = res.headers['content-disposition']
        let pat = /filename="(.*?)"/
        let v = pat.exec(fileName)
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
        app.$message.error("服务器错误")
      })

    },
    upload_success() {
      this.$message.success("上传成功")
    },
    upload_error() {
      this.$message.error("上传失败")
    },
    uploadAPI(param) {
      const formData = new FormData();
      formData.append("file", param.file)
      formData.append('dir', this.dir)

      if (formData == null) app.$message.error("请选择文件")


      let app = this

      this.$axios({
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        method: 'post',
        url: '/api/service-upload-download/upload',
        data: formData
      }).then(function (response){
        let dat = response.data
        if (dat.success) {
          app.$message.success("上传成功")
          app.getListAPI(app.$data.dir)
          app.$emit("checkLoginAPI")
        } else {
          app.$message.error("上传失败：" + dat.msg)
        }
      }, function (){
        app.$message.error("服务器错误")
      })
    },
    getListAPI(path) {

      let app = this;
      let data = this.$data
      this.$axios({
        method: 'post',
        url: '/api/service-user/file/list',
        data: {
          dir: path,
          pageNo: data.pageNo
        }

      }).then(function (response){
        let dat = response.data
        if (!dat.success) {
          app.$message.error(dat.msg)
        }
        else {
         data.fileData = dat.data.pageData
          app.dir = path
          data.pageCount = dat.data.totalPages
          data.pageTotal = dat.data.recordCount
        }
      }, function (){
        app.$message.error("服务器错误")
      })
    },
    moveAPI() {
      console.log(this.fileId)
      console.log(this.newDir)

      let path = this.newDir;
      console.log(path)

      if (path[path.length - 1] != '/') path = path + '/'

      let app = this
      this.$axios({
        method: 'post',
        url: '/api/service-user/file/move/',
        data: {
          id: app.fileId,
          path: path
        }
      }).then((res) => {
        if (res.data.success) {
          app.$message.success(res.data.msg)
          app.moveVisible = false
          app.getListAPI(app.$data.dir)
        } else {
          app.$message.error(res.data.msg)
        }
      }, function (){
        app.$message.error("服务器错误")
      })
    },
    renameAPI() {
      console.log(this.fileId)
      console.log(this.filename)
      let app = this
      this.$axios({
        method: 'post',
        url: '/api/service-user/file/rename/',
        data: {
          id: app.fileId,
          name: app.filename
        }
      }).then((res) => {
        if (res.data.success) {
          app.$message.success(res.data.msg)
          app.editVisible = false
          app.getListAPI(app.$data.dir)
        } else {
          app.$message.error(res.data.msg)
        }
      }, function (){
        app.$message.error("服务器错误")
      })
    },
    newDirAPI() {
      let app = this
      this.$axios({
        method: 'post',
        url: '/api/service-user/file/new/dir',
        data: {
          path: app.$data.dir,
          name: app.$data.dirName
        }

      }).then(function (response){
        let dat = response.data
        if (!dat.success) app.$message.error(dat.msg)
        else {
          app.$message.success(dat.msg)
          app.getListAPI(app.$data.dir)
        }
        app.$data.newDirVisible = false
        app.$data.dirName = ''
      }, function (){
        app.$message.error("服务器错误")
      })

      this.$data.newDirVisible = false
    },
    shareAPI() {
      console.log('share--->axios')
      console.log(this.sharePassword)
      console.log(this.shareStatus)
      console.log(this.fileId)
      let app = this
      this.$axios({
        method: 'post',
        url: '/api/service-user/file/share/',
        data: {
          id: app.fileId,
          password: app.sharePassword,
          status: app.shareStatus,
        }
      }).then((res) => {
        if (res.data.success) {
          app.shareMsg = res.data.url
          app.shareType = 'success'
          app.$message.success("分享成功")
        } else {
          app.shareType = 'error'
          app.shareMsg = res.data.msg
          app.$message.error("分享失败")
        }
      }, function (){
        app.$message.error("服务器错误")
      })
    },
    changeDir(index, row) {
      this.$data.dir = row.dir + row.file_name + '/'
      this.getListAPI(this.$data.dir)
    }
  },
  computed: {
    getMemory() {
      return function (memory){
        let v = memory / 1024 / 1024;
        if (v < 1024) return v.toFixed(1) + "M";
        if (v < 1024 * 1024) return (v / 1024).toFixed(1) + 'G';
        if (v < 1024 * 1024 * 1024) return (v / 1024 / 1024).toFixed(1) + 'T';
      }
    },
  },
  created() {
    this.getListAPI(this.$data.dir);
  }
}
</script>

<style>

.el-main {
  background-color: #e9eef3;
  color: #333;
  /* text-align: center; */
  line-height: 20px !important;
}

.normal {
  background-color:rgb(255, 255, 255)
}

.el-table__body tr:hover a {
  background-color:rgb(255, 255, 255)
}

.el-table__body tr:hover a{
  background-color:rgb(242, 242, 242)
}
</style>
