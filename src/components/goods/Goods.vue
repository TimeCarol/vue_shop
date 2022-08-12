<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/workbench' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索区域 -->
          <el-input
            placeholder="请输入商品名称"
            v-model="query"
            class="input-with-select"
            clearable
            @keyup.native.enter="getGoodList"
            @input="getGoodList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!-- 添加区域 -->
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table
        :data="goodList"
        border
        stripe
        :height="height"
        :header-cell-style="{'text-align': 'center', 'background-color': '#F5F7FA'}"
        :cell-style="{'text-align': 'center'}"
        style="width: 100%">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="110" show-overflow-tooltip></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100" show-overflow-tooltip></el-table-column>
        <el-table-column label="创建时间" width="180" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.add_time | filterTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template v-slot="{row}">
            <!-- 修改按钮 -->
            <el-button type="primary" size="small" icon="el-icon-edit" @click="showEditDialog(row)"></el-button>
            <!-- 删除按钮 -->
            <div style="display: inline-block; margin: 0 6px">
              <el-popover :ref="`popover-${row.goods_id}`">
                <p>是否确定删除？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="closeDeleteWindow(`popover-${row.goods_id}`)">取消</el-button>
                  <el-button type="primary" size="mini" @click="deleteGood(row.goods_id)">确定</el-button>
                </div>
                <el-button type="danger" size="small" slot="reference" icon="el-icon-delete"></el-button>
              </el-popover>
            </div>
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
        :total="totalPage"/>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'Goods',
    data() {
      return {
        height: 600,
        query: '',
        goodList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0
      }
    },
    methods: {
      handleSizeChange(pageSize) {
        this.pageSize = pageSize
        this.getGoodList()
      },
      handleCurrentChange(pageIndex) {
        this.pageIndex = pageIndex
        this.getGoodList()
      },
      showEditDialog(good) {

      },
      closeDeleteWindow(ref) {
        this.$refs[ref].doClose();
      },
      deleteGood(id) {
        this.$http.delete(`goods/${id}`).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.$message.success(response.data.meta.msg)
              this.getGoodList()
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
        this.closeDeleteWindow(`popover-${id}`)
      },
      getGoodList() {
        if (this.query !== '') {
          this.pageIndex = 1
        }
        this.$http.get('goods', { params: { query: this.query, pagenum: this.pageIndex, pagesize: this.pageSize }}).then(
          response =>{
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.goodList = response.data.data.goods
              this.totalPage = response.data.data.total
              this.pageIndex = response.data.data.pagenum - 0
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      goAddPage() {
        this.$router.push('/home/goods/add')
      }
    },
    filters: {
      filterTime(time) {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        const second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      }
    },
    created () {
      this.getGoodList()
      window.onresize = () => {
        this.height = document.documentElement.clientHeight || document.body.clientHeight
        this.height -= 290
      }
      window.onresize()
    }
  }
</script>

<style lang="css" scoped>

</style>
