<template>
  <div>
    <el-table
        :data="share"
        style="width: 100%;">
      <el-table-column
          label="创建日期">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ getTime(scope.row.gmt_modified) }}</span>
        </template>
      </el-table-column>
      <el-table-column
          label="文件">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p>大小: {{ getMemory(scope.row.size) }}</p>
            <p v-if="scope.row.status == 'PASSWORD'">密码: {{ scope.row.password }}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag size="medium">{{ scope.row.filename }}</el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column
          label="状态">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.status }}</span>
        </template>
      </el-table-column>

      <el-table-column
          label="失效日期">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ getTime(scope.row.invalid_time) }}</span>
        </template>
      </el-table-column>

      <el-table-column
          label="分享链接">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.url }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
              size="mini"
              @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
        title="编辑"
        :visible.sync="editVisible"
        width="30%"
        center>
      <el-radio v-model="shareStatus" label="PUBLIC">公开</el-radio>
      <el-radio v-model="shareStatus" label="PASSWORD">加密</el-radio>
      <el-input v-model="sharePassword" placeholder="请输入密码" v-if="shareStatus == 'PASSWORD'"></el-input>

      <span slot="footer" class="dialog-footer">
            <el-button @click="editVisible = false">取 消</el-button>
            <el-button type="primary" @click="editAPI">确 定</el-button>
          </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      share: [],
      editVisible: false,
      id: 1,
      shareStatus: '',
      sharePassword: '',
    }
  },
  methods: {
    getTime(data) {
      let moment = require('moment');
      return moment(data).format("yyyy-MM-DD HH:mm")
    },
    getMemory(memory){
      let v = memory / 1024 / 1024;
      if (v < 1024) return v.toFixed(1) + "M";
      if (v < 1024 * 1024) return (v / 1024).toFixed(1) + 'G';
      if (v < 1024 * 1024 * 1024) return (v / 1024 / 1024).toFixed(1) + 'T';
      return v
    },
    handleEdit(index, row) {
      console.log(index, row);
      this.id = row.id
      this.shareStatus = row.status
      this.sharePassword = row.password
      this.editVisible = true
    },
    handleDelete(index, row) {
      console.log(index, row);
      this.deleteAPI(row.id)
    },
    editAPI() {
      console.log(this.shareStatus)
      console.log(this.sharePassword)
      console.log(this.id)

      let app = this
      this.$axios({
        method: 'post',
        url: '/api/service-user/file/changeShareInfo',
        data: {
          id: app.id,
          password: app.sharePassword,
          status: app.shareStatus
        }
      }).then(function (response){
        let dat = response.data
        console.log(dat)
        app.editVisible = false
        app.getShareList()
        if (dat.success) {
        } else {
          app.$message.error("加载分享列表失败")
        }
      })
    },
    deleteAPI(id) {
      let app = this
      this.$axios({
        method: 'post',
        url: '/api/service-user/file/deleteShare/' + id,
      }).then(function (response){
        let dat = response.data
        if (dat.success) {
          app.getShareList()
        } else {
          app.$message.error(dat.msg)
        }
      })

    },
    getShareList() {
      let app = this
      this.$axios({
        method: 'post',
        url: '/api/service-user/file/userShareInfo',
      }).then(function (response){
        let dat = response.data
        console.log(dat)
        if (dat.success) {
          app.share = dat.data
        } else {
          app.$message.error("加载分享列表失败")
        }
      })
    }
  },
  created() {
    this.getShareList()
  }
}
</script>
