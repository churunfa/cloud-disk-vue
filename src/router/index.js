import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'All',
    component: () => import('../views/AllFile.vue')
  },
  {
    path: '/image',
    name: 'image',
    component: () => import('../views/Image.vue')
  },
  {
    path: '/video',
    name: 'video',
    component: () => import( '../views/video.vue')
  },
  {
    path: '/music',
    name: 'music',
    // component: () => import( '../views/About.vue')
  },
  {
    path: '/share',
    name: 'share',
    component: () => import( '../views/Share.vue')
  },
  {
    path: '/recycler',
    name: 'recycler',
    component: () => import( '../views/Recycler.vue')
  },
  {
    path: '/share_download/:id',
    name: 'share_download',
    component: () => import( '../views/ShareDownload.vue')
  }
]

const router = new VueRouter({
  routes,
  mode: 'history',
  watch:{
    $route(){
      let that = this
      console.log(that.$router.name)
      this.active_name = that.$router.name
    }
  }
})

export default router
