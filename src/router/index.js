import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Workbench from '@/components/Workbench'
import Users from '@/components/user/Users'
import Permissions from '@/components/permisson/Permissions'
import Roles from '@/components/permisson/Roles'
import Categories from '@/components/goods/Categories'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/home/workbench',
    children: [
      { path: 'workbench', component: Workbench },
      { path: 'users', component: Users },
      { path: 'rights', component: Permissions },
      { path: 'roles', component: Roles },
      { path: 'categories', component: Categories }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  //如果访问的是登录页面则直接放行
  if (to.path === '/login') return next();
  const tokenStr = sessionStorage.getItem('token')
  //没有token, 强制跳转到登录页
  if (!tokenStr) {
    return next('/login')
  }
  //有token, 放行
  return  next()
})

export default router
