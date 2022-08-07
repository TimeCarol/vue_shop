<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/workbench' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-table
      :data="showList"
      border
      stripe
      :height="height"
      :header-cell-style="{'text-align': 'center', 'background-color': '#F5F7FA'}"
      :cell-style="{'text-align': 'center'}"
      style="width: 100%">
      <el-table-column type="index" label="序号" width="150"></el-table-column>
      <el-table-column prop="authName" label="权限名称" show-overflow-tooltip></el-table-column>
      <el-table-column prop="path" label="路径" show-overflow-tooltip></el-table-column>
      <el-table-column label="权限等级" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <el-tag v-if="row.level === '0'">一级</el-tag>
          <el-tag v-else-if="row.level === '1'" type="success">二级</el-tag>
          <el-tag v-else-if="row.level === '2'" type="warning">三级</el-tag>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="permissionList.length"/>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'Permissions',
    data() {
      return {
        permissionList: [],
        showList: [],
        pageSize: 10,
        pageIndex: 1,
        height: 600
      }
    },
    methods: {
      getPermissionList()  {
        this.$http.get('rights/list').then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.permissionList = response.data.data
              this.setShowList()
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      //设置展示列表
      setShowList() {
        //清空原数据
        this.showList.length = 0
        let i = this.pageIndex - 1
        while (i < Math.min(this.pageIndex + this.pageSize - 1, this.permissionList.length)) {
          this.showList.push(this.permissionList[i])
          i++
        }
      },
      //监听 pageSize改变
      handleSizeChange(pageSize) {
        this.pageSize = pageSize
        this.setShowList()
      },
      //监听 pageIndex 改变
      handleCurrentChange(pageIndex) {
        this.pageIndex = pageIndex
        this.setShowList()
      }
    },
    created () {
      this.getPermissionList()
      window.onresize = () => {
        this.height = document.documentElement.clientHeight || document.body.clientHeight
        this.height -= 250
      }
      window.onresize()
    }
  }
</script>

<style lang="css" scoped>

</style>
