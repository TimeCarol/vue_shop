<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/workbench' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索区域 -->
          <el-input
            placeholder="请输入用户名"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
            @keyup.native.enter="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!-- 添加区域 -->
          <el-button type="primary" @click="addDialogVisible = !addDialogVisible">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table
        :data="userList"
        border
        stripe
        :header-cell-style="{'text-align': 'center', 'background-color': '#F5F7FA'}"
        :cell-style="{'text-align': 'center'}"
        style="width: 100%">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="username" label="用户名" width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="role_name" label="角色" show-overflow-tooltip></el-table-column>
        <el-table-column prop="mobile" label="电话" show-overflow-tooltip></el-table-column>
        <el-table-column prop="email" label="邮箱" show-overflow-tooltip></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeState(scope.row.id, scope.row.mg_state)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template v-slot="{row}">
            <!-- 修改按钮 -->
            <el-button type="primary" size="small" icon="el-icon-edit" @click="showEditDialog(row.id)"></el-button>
            <!-- 删除按钮 -->
            <div style="display: inline-block; margin: 0 6px">
              <el-popover :ref="`popover-${row.id}`">
                <p>是否确定删除？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="closeDeleteWindow(`popover-${row.id}`)">取消</el-button>
                  <el-button type="primary" size="mini" @click="deleteUser(row.id)">确定</el-button>
                </div>
                <el-button type="danger" size="small" slot="reference" icon="el-icon-delete"></el-button>
              </el-popover>
            </div>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" size="small" icon="el-icon-setting"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"/>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" :close-on-click-modal="false" @close="cancelSubmitForm('userForm')">
      <!-- 内容主体区-->
      <el-form :model="userInfo" label-position="right" label-width="70px" :rules="userRules" ref="userForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userInfo.username" autocomplete="off" clearable></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userInfo.password" autocomplete="off" clearable></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userInfo.email" autocomplete="off" clearable></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="userInfo.mobile" autocomplete="off" clearable></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('userForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" :close-on-click-modal="false" @close="closeEditDialog('editForm')">
      <!-- 内容主体区-->
      <el-form :model="userInfo" label-position="right" label-width="70px" :rules="userRules" ref="editForm">
        <el-form-item label="用户名">
          <el-input v-model="userInfo.username" autocomplete="off" clearable disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userInfo.email" autocomplete="off" clearable></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="userInfo.mobile" autocomplete="off" clearable></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditForm('editForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Users',
    data() {
      // 自定义邮箱规则
      let checkEmail = (rule, value, callback) => {
        const regEmail = /^\w+@\w+(\.\w+)+$/
        if (regEmail.test(value)) {
          // 合法邮箱
          return callback()
        }
        callback(new Error('请输入合法邮箱'))
      }
      // 自定义手机号规则
      let checkMobile = (rule, value, callback) => {
        const regMobile = /^1[34578]\d{9}$/
        if (regMobile.test(value)) {
          return callback()
        }
        // 返回一个错误提示
        callback(new Error('请输入合法的手机号码'))
      }
      return {
        //获取用户列表的参数对象
        queryInfo: {
          query: '',
          pagesize: 10,
          pagenum: 1
        },
        userList: [],
        total: 0,
        //控制添加用户对话框的显示与隐藏
        addDialogVisible: false,
        userInfo: {
          id: 0,
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        //添加表单的验证规则对象
        userRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入电话', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur' }
          ]
        },
        //控制修改对话框的显示与隐藏
        editDialogVisible: false
      }
    },
    methods: {
      //获取用户列表
      getUserList() {
        //获取用户列表
        this.$http.get('users', { params: this.queryInfo }).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.userList = response.data.data.users
              this.total = response.data.data.total
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      //监听 switch 开关的改变
      changeState(id, type) {
        this.$http.put(`users/${id}/state/${type}`).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.$message.success(response.data.meta.msg)
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      //监听 pagesize 的改变
      handleSizeChange(size) {
        this.queryInfo.pagesize = size
        this.getUserList()
      },
      //监听 pagenum 的改变
      handleCurrentChange(num) {
        this.queryInfo.pagenum = num
        this.getUserList()
      },
      //添加用户提交
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$http.post('users', this.userInfo).then(
              response => {
                if (response.data.meta.status !== 201) {
                  this.$message.error(response.data.meta.msg)
                } else {
                  this.$message.success(response.data.meta.msg)
                  this.getUserList()
                  this.addDialogVisible = false
                  this.$refs[formName].resetFields()
                }
              },
              error => {
                this.$message.error(error.message)
              }
            )
          } else {
            console.log('提交校验失败')
            return false
          }
        })
      },
      //取消添加用户
      cancelSubmitForm(formName) {
        this.addDialogVisible = false
        this.$refs[formName].resetFields()
      },
      //展示编辑用户的对话框
      showEditDialog(id) {
        //根据id查询用户信息
        this.$http.get(`users/${id}`).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.userInfo.id = response.data.data.id
              this.userInfo.username = response.data.data.username
              this.userInfo.email = response.data.data.email
              this.userInfo.mobile = response.data.data.mobile
              this.editDialogVisible = true
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      //提交用户编辑
      submitEditForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$http.put(`users/${this.userInfo.id}`, this.userInfo).then(
              response => {
                if (response.data.meta.status !== 200) {
                  this.$message.error(response.data.meta.msg)
                } else {
                  this.$message.success(response.data.meta.msg)
                  this.getUserList()
                  this.closeEditDialog(formName)
                }
              },
              error => {
                this.$message.error(error.message)
              }
            )
          } else {
            console.log('提交校验失败')
            return false
          }
        })
      },
      //关闭编辑用户对话框
      closeEditDialog(formName) {
        this.editDialogVisible = false
        this.$refs[formName].resetFields()
        this.userInfo = {
          id: 0,
          username: '',
          password: '',
          email: '',
          mobile: ''
        }
      },
      //关闭确认删除弹出框
      closeDeleteWindow(ref) {
        this.$refs[ref].doClose()
      },
      //删除用户
      deleteUser(id) {
        this.$http.delete(`users/${id}`).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.$message.success(response.data.meta.msg)
              this.getUserList()
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
        //关闭删除弹出框
        this.closeDeleteWindow(`popover-${id}`)
      }
    },
    created () {
      this.getUserList()
    }
  }
</script>

<style lang="css" scoped>
  .el-popover {
    margin: 10px 0;
  }
</style>
