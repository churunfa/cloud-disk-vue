<template>
  <div>
    <el-table
        ref="multipleTable"
        :data="fileData"
        tooltip-effect="dark"
        style ="width: 100%"
        height="730"
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
          width="500">
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
          label="删除时间"
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

      <el-table-column
          align="right"
          width="200">
        <template slot="header" slot-scope="scope">
          <el-button type="success" round @click="recoveryPlus" v-if="dir == '/'">
            恢复选中<i class="el-icon-refresh-right"></i>
          </el-button>
        </template>
        <template slot-scope="scope">
          <el-button
              type="success"
              @click="handleRecovery(scope.$index, scope.row)" round  v-if="dir == '/'">恢复<i class="el-icon-refresh-right"></i></el-button>
        </template>
      </el-table-column>

      <el-table-column
          align="right"
          width="200">
        <template slot="header" slot-scope="scope">
          <el-button type="danger" round @click="deletePlus">
            删除选中<i class="el-icon-delete"></i>
          </el-button>
        </template>
        <template slot-scope="scope">
          <el-button
              type="danger"
              @click="handleDelete(scope.$index, scope.row)" round>彻底删除<i class="el-icon-delete"></i></el-button>
        </template>
      </el-table-column>
    </el-table>
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
      pageTotal: 1,
      pageCount: 1,
      pageSize: 10,
      filename: '',
      fileId: '',
    }
  },

  methods: {
    handleCurrentChange(val) {
      this.$data.pageNo = val
      this.getListAPI(this.$data.dir)
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
    handleDelete(index, row) {
      console.log(index, row);
      let app = this;
      this.$axios({
        method: 'post',
        url: '/api/service-user/recycle/delete/' + row.id,

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
        url: '/api/service-user/recycle/deletes',
        data: arr
      }).then(function (response){
        let dat = response.data
        if (!dat.success) {
          app.$message.error(dat.msg)
        }
        else {
          app.$message.success(dat.msg)
          app.getListAPI(app.$data.dir)
        }
      }, function (){
        app.$message.error("服务器错误")
      })

    },
    handleRecovery(index, row) {
      console.log(index, row)

      let app = this;
      let data = this.$data
      this.$axios({
        method: 'post',
        url: '/api/service-user/recycle/recovery/' + row.id,

      }).then(function (response){
        let dat = response.data
        if (!dat.success) {
          app.$message.error(dat.msg)
        }
        else {
          app.$message.success(dat.msg)
          app.getListAPI(app.$data.dir);
          app.$emit("checkLoginAPI")
        }
      },function (){
        app.$message.error("服务器错误")
      })

    },
    recoveryPlus() {
      console.log(this.multipleSelection)
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
        url: '/api/service-user/recycle/recoveries',
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
    changeDir(index, row) {
      console.log(index, row)
      this.$data.dir = row.dir + row.file_name + '/'
      this.getListAPI(this.$data.dir)
    },
    getListAPI(path) {
      let app = this;
      let data = this.$data
      this.$axios({
        method: 'post',
        url: '/api/service-user/recycle/list',
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
      },function (){
        app.$message.error("服务器错误")
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
