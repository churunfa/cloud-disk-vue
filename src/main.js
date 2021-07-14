import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from "axios";

Vue.config.productionTip = false
import elTableInfiniteScroll from 'el-table-infinite-scroll';
Vue.use(elTableInfiniteScroll);

Vue.use(ElementUI);

Vue.prototype.$axios = axios

axios.interceptors.request.use(function (config) {
  let jwt_token = localStorage.getItem('jwt_token');
  if (!config.headers.hasOwnProperty('Authorization') && jwt_token)
    config.headers.Authorization = jwt_token;
  return config
}, function (error) {
  return Promise.reject(error)
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
