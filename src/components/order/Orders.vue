<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home/workbench' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card>
        <el-row :gutter="20">
          <el-col :span="8">
            <!-- 搜索区域 -->
            <el-input
              placeholder="请输入内容"
              v-model="query"
              class="input-with-select"
              clearable
              @keyup.native.enter="getOrderList"
              @input="getOrderList">
              <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
            </el-input>
          </el-col>
        </el-row>
        <!-- 表格区域 -->
        <el-table
          :data="orderList"
          border
          stripe
          :height="height"
          :header-cell-style="{'text-align': 'center', 'background-color': '#F5F7FA'}"
          :cell-style="{'text-align': 'center'}"
          style="width: 100%">
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="order_number" label="订单编号" show-overflow-tooltip></el-table-column>
          <el-table-column prop="order_price" label="订单价格" width="110" show-overflow-tooltip></el-table-column>
          <el-table-column prop="pay_status" label="是否付款" width="100" show-overflow-tooltip>
            <template v-slot="scope">
              <el-tag v-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
              <el-tag v-else-if="scope.row.pay_status === '0'" type="danger">未付款</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="is_send" label="是否发货" width="100" show-overflow-tooltip></el-table-column>
          <el-table-column label="下单时间" width="180" show-overflow-tooltip>
            <template v-slot="scope">
              {{ scope.row.create_time | filterTime }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130">
            <template v-slot="{row}">
              <!-- 修改按钮 -->
              <el-button type="primary" size="small" icon="el-icon-edit" @click="showAddressDialog(row)"></el-button>
              <!-- 定位按钮 -->
              <el-button type="success" size="small" slot="reference" icon="el-icon-location" @click="showProgressBox(row)"></el-button>
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
      <!-- 修改地址的对话框 -->
      <el-dialog title="修改地址" :visible.sync="editAddressDialogVisible" :close-on-click-modal="false" @close="closeEditAddressDialog('editAddressForm')">
        <!-- 内容主体区-->
        <el-form :model="addressForm" label-position="right" label-width="85px" :rules="addressRules" ref="editAddressForm">
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader
              :options="cityOptions"
              v-model="addressForm.address1"
              clearable
              :props="{ expandTrigger: 'hover' }"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2" autocomplete="off" clearable placeholder="请输入详细地址"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区 -->
        <div slot="footer" class="dialog-footer">
          <el-button @click="editAddressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editAddress('editAddressForm')">确 定</el-button>
        </div>
      </el-dialog>
      <!-- 展示物流进度的对话框 -->
      <el-dialog title="物流进度" :visible.sync="progressVisible">
        <el-timeline :reverse="true">
          <el-timeline-item
            v-for="(progress, index) in progressInfo"
            :key="index"
            :timestamp="progress.ftime">
            {{progress.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </div>
</template>

<script>
  import cityOptions from './city_data2017_element'
  export default {
    name: 'Orders',
    data() {
      return {
        height: 600,
        query: '',
        orderList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        editAddressDialogVisible: false,
        addressRules: {
          address1: [
            { required: true, message: '请选择省市区/县', trigger: 'change' }
          ],
          address2: [
            { required: true, message: '请填写详细地址', trigger: 'blur' }
          ]
        },
        addressForm: {
          address1: [],
          address2: ''
        },
        cityOptions: cityOptions,
        progressVisible: false,
        progressInfo: []
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
    methods: {
      handleSizeChange(pageSize) {
        this.pageSize = pageSize
        this.getOrderList()
      },
      handleCurrentChange(pageIndex) {
        this.pageIndex = pageIndex
        this.getOrderList()
      },
      closeDeleteWindow(ref) {
        this.$refs[ref].doClose()
      },
      showProgressBox(order) {
        this.progressVisible = true
        this.$http.get('/kuaidi/1106975712662').then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.progressInfo = response.data.data
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      showAddressDialog(order) {
        this.editAddressDialogVisible = true
      },
      closeEditAddressDialog(ref) {
        this.$refs[ref].resetFields()
        this.editAddressDialogVisible = false
      },
      editAddress(ref) {
        this.$refs[ref].validate(valid => {
          if (valid) {
            this.$message.success('修改地址成功')
            this.closeEditAddressDialog(ref)
          } else {
            console.log('提交校验失败')
            return false
          }
        })
      },
      getOrderList() {
        this.$http.get('orders', {params: { pagenum: this.pageIndex, pagesize: this.pageSize, query: this.query}}).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.orderList = response.data.data.goods
              this.totalPage = response.data.data.total
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      }
    },
    created () {
      this.getOrderList()
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
