import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/elementui.js'
//导入全局样式表
import './assets/css/global.css'
//导入axios
import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
//axios请求拦截
axios.interceptors.request.use(config => {
  //为请求头添加Token验证的Authorization字段
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = token
  }
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
