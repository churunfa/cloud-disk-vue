<template>
  <div id="app">
    <el-container>
      <el-header height="80px" style="background-color: #fff; border: 4px solid #eee; border-radius: 10px" class="border-radius">
        <el-row :gutter="24">
          <el-col :span="1">
            <div style="display:table-cell;vertical-align:middle;text-align:center">
              <img src="./static/img/logo.png" alt="logo" style="height: 60px;">

            </div>
          </el-col>
          <el-col :span="4">
            <div style="display:table-cell;vertical-align:middle;text-align:center">
              <span style="font-size: 30px;">共享云盘</span>
            </div>
          </el-col>
          <el-col :span="14">
            <div v-if="user && user.username">
              <div class="block" style="margin-top: 10px">{{user.username}}</div>
            </div>
            <div v-else>&nbsp;</div>
          </el-col>
          <el-col :span="5" style="">
            <div v-if="user && user.username">
              <el-button round @click="logoutAPI">退出</el-button>
            </div>
            <div v-else>
              <el-button round @click="dialogStatus.login = true">登陆</el-button>
              <el-button round @click="dialogStatus.register = true">注册</el-button>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-container>
        <el-aside width="200px" style="background-color: rgb(245, 245, 245); border: 4px solid #eee; border-radius: 10px">
          <router-link to="/" exact >
            <div :class="{'router-link-active':$route.name == 'all' || $route.path == '/'}">
              <i class="el-icon-folder-opened"></i>
              <span>全部文件</span>
            </div>
          </router-link>
          <router-link to="/image">
            <div :class="{'router-link-active':$route.name == 'image'}">
              <i class="el-icon-picture-outline"></i>
              <span>图片</span>
            </div>
          </router-link>

          <router-link to="/video">
            <div :class="{'router-link-active':$route.name == 'video'}">
              <i class="el-icon-video-camera-solid"></i>
              <span>视频</span>
            </div>
          </router-link>

          <router-link to="/music">
            <div :class="{'router-link-active':$route.name == 'music'}">
              <i class="el-icon-headset"></i>
              <span>音乐</span>
            </div>
          </router-link>
          <router-link to="/share">
            <div :class="{'router-link-active':$route.name == 'share'}">
              <i class="el-icon-share"></i>
              <span>分享</span>
            </div>
          </router-link>
          <router-link to="/recycler">
            <div :class="{'router-link-active':$route.name == 'recycler'}">
              <i class="el-icon-milk-tea"></i>
              <span>回收站</span>
            </div>
          </router-link>
          <div v-if="user && user.username">
            <el-progress type="circle" :percentage="this.$data.user.count_size / this.$data.user.total_size * 100" :format="UsedMemory"></el-progress>
          </div>
        </el-aside>
        <el-main style="background-color: #fff; border: 4px solid #eee; border-radius: 10px">
          <router-view @checkLoginAPI="checkLoginAPI"></router-view>
        </el-main>
      </el-container>
    </el-container>

    <el-dialog
        title="登陆"
        :visible.sync="dialogStatus.login"
        width="30%"
        :before-close="handleClose">

        <el-form :model="loginForm" :rules="rules" ref="loginForm" label-width="100px" class="demo-ruleForm">
          <el-form-item label="用户名" prop="username">
            <el-input placeholder="请输入用户名" v-model="loginForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input placeholder="请输入密码" v-model="loginForm.password" show-password></el-input>
          </el-form-item>

          <div style="margin-left: -50px;">
            <el-form-item>
              <el-button type="primary" @click="loginAPI()">登陆</el-button>
              <el-button @click="resetForm('loginForm')">重置</el-button>
            </el-form-item>
          </div>
        </el-form>
    </el-dialog>

    <el-dialog
        title="注册"
        :visible.sync="dialogStatus.register"
        width="30%"
        :before-close="handleClose">

      <el-form :model="registerForm" :rules="rules" ref="loginForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input placeholder="请输入用户名" v-model="registerForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input placeholder="请输入密码" v-model="registerForm.password" show-password></el-input>
        </el-form-item>

        <div style="margin-left: -50px;">
          <el-form-item>
              <el-button type="primary" @click="registerAPI">注册</el-button>
              <el-button @click="resetForm('registerForm')">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>

export default {
  data() {
    return {
      dialogStatus: {
        login: false,
        register: false
      },
      user: {
        id: null,
        username: null,
        last_login: null,
        count_size: 0,
        total_size: 2048000000,
      },
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        password: '',
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          // { min: 1, max: 100, message: '用户名不合法', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          // { min: 1, max: 100, message: '密码不合法', trigger: 'blur' }
        ]
      },
    };
  },
  methods: {
    getMemory(memory){
      let v = memory / 1024 / 1024;
      if (v < 1024) return v.toFixed(1) + "M";
      if (v < 1024 * 1024) return (v / 1024).toFixed(1) + 'G';
      if (v < 1024 * 1024 * 1024) return (v / 1024 / 1024).toFixed(1) + 'T';
    },
    UsedMemory(){
      return this.getMemory(this.$data.user.count_size) + " / " + this.getMemory(this.$data.user.total_size);
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    handleClose(done) {
      done()
    },
    logoutAPI() {
      localStorage.clear();
      this.$data.user = null
    },
    loginAPI() {
      let moment = require('moment');
      let data = this.$data
      let app = this;

      this.$axios({
        method: 'post',
        url: '/api/service-user/login',
        data: data.loginForm
      }).then(function (response){
        let dat = response.data
        if (dat.success) {
          data.user = dat.user
          localStorage.setItem('jwt_token', dat.jwt_token);
          data.dialogStatus.login = false
          data.dialogStatus.register = false
          let login_time = moment(data.user.last_login).format("yyyy-MM-DD HH:mm")
          app.$message.success("登陆成功，您上次登陆时间为：" + login_time)
        } else {
          app.$message.error(dat.msg);
        }
      })
    },
    checkLoginAPI(){
      let data = this.$data
      this.$axios({
        method: 'post',
        url: '/api/service-user/check_login',
      }).then(function (response){
        let dat = response.data
        if (dat.success) {
          data.user = dat.user
          data.dialogStatus.login = false
          data.dialogStatus.register = false
        }
      })
    },
    registerAPI() {
      let data = this.$data
      let app = this;

      this.$axios({
        method: 'post',
        url: '/api/service-user/register',
        data: data.registerForm
      }).then(function (response){
        let dat = response.data
        if (dat.success) {
          app.$message.success("注册成功");
          data.dialogStatus.login = false
          data.dialogStatus.register = false
        } else {
          app.$message.error(dat.msg);
        }
      })
    }
  },
  created() {
    this.checkLoginAPI()
  }
}

</script>

<style>
body{
  margin: 0;
  padding: 0;
  background-color: #eee;
}
html, body, #app, .el-container {
  height: 100%;
}
::-webkit-scrollbar{
  display:none;
}
a {
  text-decoration: none;
  color: rgb(133, 133, 133);
  background-color: rgb(245, 245, 245);
}
.router-link-active{
  background-color: rgb(225, 225, 225);
  color: rgb(56, 160, 250);
}

router-link {
  height: 20px;
}

.el-aside div{
  padding-top: 30px;
  padding-bottom: 30px;
  line-height: 10px;
  font-size: 18px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
