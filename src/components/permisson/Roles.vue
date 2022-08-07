<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home/workbench' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card>
        <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        <el-table
          :data="roleList"
          border
          stripe
          :height="height"
          :header-cell-style="{'text-align': 'center', 'background-color': '#F5F7FA'}"
          :cell-style="{'text-align': 'center'}"
          style="width: 100%">
          <!-- 展开列 -->
          <el-table-column type="expand">
            <template v-slot="scope">
              <el-row
                v-for="(children, index) in scope.row.children"
                :key="children.id" :class="['bd-bottom', index !== 0 ? '' : 'bd-top']"
                type="flex"
                align="middle">
                <!-- 渲染一级权限 -->
                <el-col :span="5">
                  <el-tag closable @close="removePermissionById(scope.row, children.id)">
                    {{children.authName}}
                  </el-tag>
                  <i class="el-icon-caret-right"/>
                </el-col>
                <!-- 渲染二级和三级权限 -->
                <el-col :span="19">
                  <el-row v-for="(children, index) in children.children" :key="children.id" :class="index === 0 ? '' : 'bd-top'" type="flex" align="middle">
                    <!-- 渲染二级权限 -->
                    <el-col :span="6">
                      <el-tag closable type="success" @close="removePermissionById(scope.row, children.id)">
                        {{children.authName}}
                      </el-tag>
                      <i class="el-icon-caret-right"/>
                    </el-col>
                    <el-col :span="18" style="text-align: left">
                      <el-tag
                        type="warning"
                        v-for="children in children.children"
                        :key="children.id"
                        closable
                        @close="removePermissionById(scope.row, children.id)">
                        {{children.authName}}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <!-- 索引列 -->
          <el-table-column type="index" label="序号" width="150"></el-table-column>
          <el-table-column prop="roleName" label="角色名称" show-overflow-tooltip></el-table-column>
          <el-table-column prop="roleDesc" label="角色描述" show-overflow-tooltip></el-table-column>
          <el-table-column label="操作" width="310">
            <template slot-scope="scope">
              <!-- 编辑按钮 -->
              <el-button type="primary" size="small" icon="el-icon-edit" @click="showEditRoleDialog(scope.row.id)">编辑</el-button>
              <!-- 删除按钮 -->
              <div style="display: inline-block; margin: 0 6px">
                <el-popover :ref="`popover-${scope.row.id}`">
                  <p>是否确定删除？</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="closeDeleteWindow(`popover-${scope.row.id}`)">取消</el-button>
                    <el-button type="primary" size="mini" @click="deleteRole(scope.row.id)">确定</el-button>
                  </div>
                  <el-button type="danger" size="small" slot="reference" icon="el-icon-delete">删除角色</el-button>
                </el-popover>
              </div>
              <!-- 分配权限按钮 -->
              <el-button type="warning" size="small" icon="el-icon-setting" @click="showSetPermissionDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 添加角色的对话框 -->
        <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" :close-on-click-modal="false" @close="closeAddRoleDialog('roleForm')">
          <!-- 内容主体区-->
          <el-form :model="roleInfo" label-position="right" label-width="85px" :rules="roleRules" ref="roleForm">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="roleInfo.roleName" autocomplete="off" clearable placeholder="请输入角色名称"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
              <el-input v-model="roleInfo.roleDesc" autocomplete="off" clearable placeholder="请输入角色描述"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部区 -->
          <div slot="footer" class="dialog-footer">
            <el-button @click="addRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRole('roleForm')">确 定</el-button>
          </div>
        </el-dialog>
        <!-- 编辑角色的对话框 -->
        <el-dialog title="编辑角色" :visible.sync="editRoleDialogVisible" :close-on-click-modal="false" @close="closeEditRoleDialog('editRoleForm')">
          <!-- 内容主体区-->
          <el-form :model="roleInfo" label-position="right" label-width="85px" :rules="roleRules" ref="editRoleForm">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="roleInfo.roleName" autocomplete="off" clearable placeholder="请输入角色名称"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
              <el-input v-model="roleInfo.roleDesc" autocomplete="off" clearable placeholder="请输入角色描述"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部区 -->
          <div slot="footer" class="dialog-footer">
            <el-button @click="editRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRole('editRoleForm')">确 定</el-button>
          </div>
        </el-dialog>
        <!-- 分配权限的对话框 -->
        <el-dialog title="分配权限" :visible.sync="assignPermissionDialogVisible" @close="defaultKeys = []" :close-on-click-modal="false">
          <!-- 内容主体区-->
          <el-tree
            ref="roleTree"
            :data="roleTree"
            show-checkbox
            node-key="id"
            :props="defaultProps"
            :default-checked-keys="defaultKeys"
            default-expand-all>
          </el-tree>
          <!-- 底部区 -->
          <div slot="footer" class="dialog-footer">
            <el-button @click="assignPermissionDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allotPermission">确 定</el-button>
          </div>
        </el-dialog>
      </el-card>
    </div>
</template>

<script>
  export default {
    name: 'Roles',
    data() {
      return {
        roleList: [],
        height: 600,
        roleInfo: {
          id: 0,
          roleName: '',
          roleDesc: ''
        },
        roleRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' }
          ],
          roleDesc: [
            { required: true, message: '请输入角色描述', trigger: 'blur' }
          ]
        },
        addRoleDialogVisible: false,
        editRoleDialogVisible: false,
        assignPermissionDialogVisible: false,
        roleTree: [],
        //当前即将被分配权限的id
        roleId: 0,
        //默认选中的节点id
        defaultKeys: [],
        defaultProps: {
          children: 'children',
          label: 'authName'
        }
      }
    },
    methods: {
      //关闭确认删除弹出框
      closeDeleteWindow(ref) {
        this.$refs[ref].doClose()
      },
      getRoleList() {
        this.$http.get('roles').then(
          response =>{
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.roleList = response.data.data
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      //删除角色
      deleteRole(id) {
        this.$http.delete(`roles/${id}`).then(
          response =>{
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.$message.success(response.data.meta.msg)
              this.getRoleList()
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
        //关闭删除弹出框
        this.closeDeleteWindow(`popover-${id}`)
      },
      //添加角色
      addRole(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.$http.post('roles', this.roleInfo).then(
              response => {
                if (response.data.meta.status !== 201) {
                  this.$message.error(response.data.meta.msg)
                } else {
                  this.$message.success(response.data.meta.msg)
                  this.closeAddRoleDialog(formName)
                  this.getRoleList()
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
      //关闭添加角色的对话框
      closeAddRoleDialog(formName) {
        this.addRoleDialogVisible = false
        this.$refs[formName].resetFields()
      },
      //关闭角色编辑对话框
      closeEditRoleDialog(formName) {
        this.editRoleDialogVisible = false
        this.$refs[formName].resetFields()
        this.roleInfo = {
          id: 0,
          roleName: '',
          roleDesc: ''
        }
      },
      //展示角色编辑对话框
      showEditRoleDialog(id) {
        this.$http.get(`roles/${id}`).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.roleInfo.id = response.data.data.roleId
              this.roleInfo.roleName = response.data.data.roleName
              this.roleInfo.roleDesc = response.data.data.roleDesc
              this.editRoleDialogVisible = true
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      //编辑角色
      editRole(formName) {
        this.$http.put(`roles/${this.roleInfo.id}`, this.roleInfo).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.$message.success(response.data.meta.msg)
              this.closeEditRoleDialog(formName)
              this.getRoleList()
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      //根据id删除权限
      removePermissionById(role, rightId) {
        this.$confirm('此操作将删除权限, 是否继续?', '删除权限', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(
            response => {
              if (response.data.meta.status !== 200) {
                this.$message.error(response.data.meta.msg)
              } else {
                this.$message.success(response.data.meta.msg)
                role.children = response.data.data
              }
            },
            error => {
              this.$message.error(error.message)
            }
          )
        }).catch(() => {
          this.$message.info('取消了删除')
        })
      },
      //展示分配权限的对话框
      showSetPermissionDialog(role) {
        this.roleId = role.id
        this.$http.get('rights/tree').then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.roleTree = response.data.data
              this.getDefaultKeys(role, this.defaultKeys)
              this.assignPermissionDialogVisible = true
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      //通过递归的形式获得角色下所有三级权限的id, 并保存到defaultKey数组中
      getDefaultKeys(node, arr) {
        if (node.children) {
          node.children.forEach(item => {
            this.getDefaultKeys(item, arr)
          })
        } else {
          //三级节点
          return arr.push(node.id)
        }
      },
      //为角色分配权限
      allotPermission() {
        const keys = [
          ...this.$refs['roleTree'].getCheckedKeys(),
          ...this.$refs['roleTree'].getHalfCheckedKeys()
        ]
        this.$http.post(`roles/${this.roleId}/rights`, { rids: keys.join(',') }).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.assignPermissionDialogVisible = false
              this.$message.success(response.data.meta.msg)
              this.getRoleList()
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      }
    },
    created () {
      this.getRoleList()
      window.onresize = () => {
        this.height = document.documentElement.clientHeight || document.body.clientHeight
        this.height -= 250
      }
      window.onresize()
    }
  }
</script>

<style lang="css" scoped>
  .el-tag {
    margin: 7px;
  }
  .el-col {
    text-align: center;
  }
  .bd-top {
    border-top: 1px solid #EEE;
  }
  .bd-bottom {
    border-bottom: 1px solid #EEE;
  }
</style>
