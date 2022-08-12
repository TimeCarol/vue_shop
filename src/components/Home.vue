<template>
    <el-container class="home-container">
  <!-- 头部区域 -->
  <el-header>
    <div>
      <img src="../assets/logo.png" alt="" height="60" />
      <span>电商后台管理系统</span>
    </div>
    <el-button type="info" @click="logout">退出</el-button>
  </el-header>
  <!-- 页面主体区 -->
  <el-container>
    <!-- 页面侧边栏 -->
    <el-aside width="210px" id="aside">
      <div class="toggle-button" @click="toggleCollapse">
        <i class="el-icon-s-fold" style="color: white"  id="collapseIcon" />
      </div>
      <!-- 侧边栏菜单区 -->
      <el-menu
        :default-active="'/home/' + $route.path.split('/').pop()"
        :collapse="isCollapse"
        :collapse-transition="false"
        class="el-menu-vertical-demo"
        background-color="#333744"
        text-color="white"
        router>
        <!-- 一级菜单 -->
        <el-menu-item index="workbench">
          <i class="el-icon-s-platform" style="margin-left: -10px"></i>
          <span slot="title">工作台</span>
        </el-menu-item>
        <!-- 一级菜单 -->
        <el-submenu :index="menu.id.toString()" v-for="menu in menuList">
          <template slot="title">
            <!-- 图标 -->
            <i :class="iconsObj[menu.id]"></i>
            <!-- 标题 -->
            <span>{{menu.authName}}</span>
          </template>
          <!-- 二级菜单 -->
          <el-menu-item
            :index="'/home/' + children.path"
            v-for="children in menu.children">
            {{children.authName}}
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
    <!-- 右侧内容区 -->
    <el-main>
      <!-- 路由占位符 -->
      <router-view />
    </el-main>
  </el-container>
  </el-container>
</template>

<script>
  import '../assets/fonts/iconfont.css'
  export default {
    name: 'Home',
    data() {
      return {
        menuList: [],
        iconsObj: {
          '125': 'iconfont icon-user',
          '103': 'iconfont icon-tijikongjian',
          '101': 'iconfont icon-shangpin',
          '102': 'iconfont icon-danju',
          '145': 'iconfont icon-baobiao'
        },
        isCollapse: false
      }
    },
    methods: {
      logout() {
        sessionStorage.removeItem('token')
        this.$message.info('退出登录成功')
        this.$router.replace('/login')
      },
      //点击按钮切换菜单的折叠与展开
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
        const collapseIcon = document.getElementById('collapseIcon')
        const aside = document.getElementById('aside')
        if (collapseIcon.className === 'el-icon-s-fold') {
          aside.style.width = '64px'
          collapseIcon.className = 'el-icon-s-unfold'
        } else {
          aside.style.width = '210px'
          collapseIcon.className = 'el-icon-s-fold'
        }
      }
    },
    created() {
      //获取所有的菜单
      this.$http.get('menus').then(
        response => {
          if (response.data.meta.status !== 200) {
            this.$message.error(response.data.meta.msg)
          }
          this.menuList = response.data.data
        },
        error => {
          this.$message.error(error.message)
        }
      )
    }
  }
</script>

<style lang="css" scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    background-color: #373D41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: white;
    font-size: 20px;
  }
  .el-header > div {
    display: flex;
    align-items: center;
  }
  .el-header > div > span {
    margin-left: 15px;
  }
  .el-aside {
    background-color: #333744;
    transition: width .3s ease-in-out;
  }
  .el-main {
    background-color: #EAEDF1;
  }
  .el-menu {
    border-right: none;
  }
  .el-menu-item {
    margin-left: 6px;
  }
  .iconfont {
    margin-right: 10px;
  }
  .toggle-button {
    background-color: #4A5064;
    text-align: center;
    font-size: 18px;
    line-height: 24px;
    cursor: pointer;
  }
</style>
