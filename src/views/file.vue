<template>
  <div>
    <div style="position: absolute; width: 550px;z-index: 2; bottom: 0px; right: 0;">
      <el-collapse v-model="activeName" accordion v-if="chunkUploadList.length != 0">
        <el-collapse-item :title="chunkUploadTitle" name="1">

          <template>
            <el-table
                :data="chunkUploadList"
                style="width: 100%">
              <el-table-column
                  prop="uf.file_name"
                  label="文件名">
              </el-table-column>
              <el-table-column
                  label="下载进度">
                <template slot-scope="scope">
                  {{ getMemory(scope.row.upload_chunk_size) }} / {{ getMemory(scope.row.tot_size) }}
                </template>
              </el-table-column>

              <el-table-column
                  label="选择文件">
                <template slot-scope="scope">
                  <el-upload
                      v-if="fileMp.get(scope.row.uf.id) == null"
                      class="upload-demo"
                      action
                      :data="scope"
                      :http-request="getChunkFile"
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
                  <div v-else>文件已选择</div>
                </template>
              </el-table-column>

              <el-table-column
                  prop="tot_size">
                <template slot-scope="scope">
                  <el-button
                      size="mini"
                      style="font-size: large"
                      @click="uploadPause(scope.$index, scope.row)"
                      v-if="isUploading.get(scope.row.uf.id)"
                  >
                    <i class="el-icon-video-pause"></i>
                  </el-button>
                  <el-button
                      size="mini"
                      style="font-size: large"
                      @click="uploadContinue(scope.$index, scope.row)"
                      v-else
                  >
                    <i class="el-icon-video-play" ></i>
                  </el-button>
                  <el-button
                      size="mini"
                      style="font-size: large"
                      @click="uploadClose(scope.$index, scope.row)"><i class="el-icon-circle-close"></i>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-collapse-item>
      </el-collapse>
    </div>
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
              multiple
              :http-request="startUpload"
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
      activeName: '',
      chunkUploadList: [],
      chunkUploadTitle: '',
      fileMp: new Map,
      isUploading: new Map,
      uploadingCount: 0,
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
    uploadPause(index, row) {
      let fid = row.uf.id
      this.isUploading.set(fid, false)
      this.isUploading = new Map(this.isUploading)
    },
    uploadContinue(index, row) {
      let fid = row.uf.id
      if (!this.fileMp.get(fid)) {
        this.$message.warning("请选择文件后再进行操作")
        return
      }
      this.chunkUpload(fid, this.fileMp.get(fid))
    },
    uploadClose(index, row) {
      console.log(row)
      let fid = row.uf.id
      let app = this
      this.$axios({
        method: "post",
        url: '/api/service-upload-download/chunk/cancel/' + fid,
      }).then(res=>{
        console.log(res)
        if (res.data.code == 200) {
          app.$message.success('取消成功')
          app.getChunkUploadListAPI()
          app.$emit("checkLoginAPI")
        } else {
          app.$message.error(res.data.message)
        }
      }, res=>{
        app.$message.error(res.data.message)
      })
    },
    open() {
      this.$notify({
        title: '自定义位置',
        dangerouslyUseHTMLString: true,
        message: '右下角弹出的消息',
        position: 'bottom-right',
        duration: 0
      });
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
      document.cookie="token=" + localStorage.getItem('jwt_token');

      let elink = document.createElement('a')
      elink.download = row.file_name

      elink.style.display = 'none'
      elink.href = '/api/service-upload-download/chunk/download/' + row.id
      document.body.appendChild(elink)
      elink.click()
      URL.revokeObjectURL(elink.href) // 释放URL 对象
      document.body.removeChild(elink)

      return

      let app = this
      this.$axios({
        method: 'post',
        // url: '/api/service-upload-download/download/' + row.id,
        url: '/api/service-upload-download/chunk/download/' + row.id,
        responseType: 'blob'
      }).then((res) => { // 处理返回的文件流
        return
        let content = res.data
        let blob = new Blob([content])
        let fileName = res.headers['content-disposition']
        let pat = /filename=(.*?)$/
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

      let filename = this.$root.$children[0].user.username + "的打包下载"

      let url = '/api/service-upload-download/chunk/downloads?files=' + arr[0]

      for (let i = 1; i < arr.length; i++) url = url + '&files=' + arr[i];

      document.cookie="token=" + localStorage.getItem('jwt_token');

      let elink = document.createElement('a')
      elink.download = filename
      elink.style.display = 'none'
      elink.href = url
      document.body.appendChild(elink)
      elink.click()
      URL.revokeObjectURL(elink.href) // 释放URL 对象
      document.body.removeChild(elink)

      return

      let app = this
      this.$axios({
        method: 'post',
        url: url,
        responseType: 'blob'
      }).then((res) => { // 处理返回的文件流
        let content = res.data
        let blob = new Blob([content])
        let fileName = res.headers['content-disposition']
        let pat = /filename=(.*?)$/
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
    getChunkFile(param) {
      let row = param.data.row
      console.log(param.file)
      console.log(row)

      if (param.file.name != row.uf.file_name || param.file.size != row.uf.size) {
        this.$message.error('您选择的文件不匹配，请重新选择')
        return
      }

      // this.$set(this.fileMp, row.uf.id, param.file)
      this.fileMp.set(row.uf.id, param.file)
      this.fileMp = new Map(this.fileMp)
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
      let jwt_token = localStorage.getItem('jwt_token');

      if (jwt_token == null) return

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
    getChunkUploadListAPI() {
      let app = this

      this.$axios({
        method: "post",
        url: '/api/service-upload-download/chunk/getUploading'
      }).then(res=>{
        let data = res.data
        if (data.code == 200) {
          app.chunkUploadList = data.data
          app.chunkUploadTitle = data.data.length + '个文件正在上传'

          if (data.data.length != app.uploadingCount) app.getListAPI(app.$data.dir)

          app.uploadingCount = data.data.length
        }
      })

    },
    changeDir(index, row) {
      this.$data.dir = row.dir + row.file_name + '/'
      this.getListAPI(this.$data.dir)
    },
    startUpload(file) { //!!
      let app = this
      app.getFidAPI(file.file).then(res=>{
        // console.log(res)
        if (res.data.code == 200) {
          // app.chunkUploadAPI(file.file, 0, res.data.data)
          app.chunkUpload(res.data.data, file.file)
        }
      })
    },
    getFidAPI(file) {
      let app = this
      let path = this.dir
      let fid;
      return new Promise(function (resolve, reject){
        app.$axios({
          method: "post",
          url: '/api/service-upload-download/chunk/getFid',
          data: {
            file_name: file.name,
            size: file.size,
            dir: path
          }
        }).then(res=>{
          let data = res.data
          if (data.code == 200) {
            app.$message.success('提交成功')
            app.fileMp.set(data.data, file)
            app.getChunkUploadListAPI()
            app.$emit("checkLoginAPI")
            fid = data.data
          } else {
            app.$message.error(data.message)
          }
          resolve(res)
        },res=>{
          app.$message.error(res.data.message)
          reject(res)
        })
      })

    },
    marge(id) {
      let app = this
      app.$axios({
        url: '/api/service-upload-download/chunk/marge/' + id
      }).then(res=>{})
    },
    async chunkUpload(fid, file) {
      this.isUploading.set(fid, true)
      let blockId;
      let res = await this.getNextAPI(fid)
      blockId = res.data.data

      let tot_size = file.size
      let block_size = 5 * 1024 * 1024
      let count = Math.floor((tot_size + block_size - 1) / block_size)

      for (let i = blockId; i < count; i++) {
        if (!this.isUploading.get(fid)) break;
        let res = await this.chunkUploadAPI(file, i, fid)
      }

    },
    chunkUploadAPI(file, chunkNo, user_file_id) {
      let app = this
      let chunkSize = 5 * 1024 * 1024
      let st = chunkNo * chunkSize
      let ed = Math.min(file.size, st + chunkSize)

      let f = file.slice(st, ed)
      let fileRead = new FileReader()

      return new Promise(resolve => {
        fileRead.readAsArrayBuffer(f)
        fileRead.onload = ev => {
          const formData = new FormData();
          let ff = new File([ev.target.result], file.name);
          formData.append("file", ff)
          formData.append("user_file_id", user_file_id)
          formData.append("chunkNo", chunkNo)

          app.$axios({
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            method: 'post',
            url: '/api/service-upload-download/chunk/upload',
            data: formData
          }).then(function (response){
            if (response.data.code == 200) {
              app.marge(user_file_id)
            }
            resolve(response)
          }, function (){
            app.$message.error("服务器错误")
          })

        }
      })
    },
    getNextAPI(id) {
      let app = this
      return new Promise(function (resolve){
        app.$axios({
          url: '/api/service-upload-download/chunk/next/' + id,
        }).then(res=>{
          resolve(res)
        })
      })
    },
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
  mounted() {
    //定时器
    let app = this
    const timer = setInterval(() => {
      app.getChunkUploadListAPI()
    }, 1000)
    //销毁定时器
    this.$once('hook:beforeDestroy', () => {
      clearInterval(timer)
    })
  },
  created() {
    this.getListAPI(this.$data.dir)
    this.getChunkUploadListAPI()
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
  background-color:rgba(255, 255, 255, 0)
}

.el-table__body tr:hover a{
  background-color:rgba(242, 242, 242, 0)
}
</style>
