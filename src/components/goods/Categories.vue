<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home/workbench' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card>
        <el-button type="primary" @click="showAddCategoryDialog">添加分类</el-button>
        <el-table
          :data="categories"
          :height="height"
          row-key="cat_id"
          stripe
          border
          :header-cell-style="{'text-align': 'center', 'background-color': '#F5F7FA'}"
          :cell-style="{'text-align': 'center'}"
          style="width: 100%">
          <el-table-column label="序号" type="index" width="60"/>
          <el-table-column label="分类名称" prop="cat_name"/>
          <el-table-column label="是否有效">
            <template slot-scope="{ row }">
              <i class="el-icon-success" v-if="!row.cat_deleted" style="color: rgb(19, 206, 102); font-size: 24px"></i>
              <i class="el-icon-error" v-else style="color: #F56C6C; font-size: 24px"></i>
            </template>
          </el-table-column>
          <el-table-column label="排序">
            <template slot-scope="{ row }">
              <el-tag v-if="row.cat_level === 0">一级</el-tag>
              <el-tag v-else-if="row.cat_level === 1" type="success">二级</el-tag>
              <el-tag v-else-if="row.cat_level === 2" type="warning">三级</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <!-- 编辑按钮 -->
              <el-button type="primary" size="small" icon="el-icon-edit" @click="showEditCategoryDialog(scope.row)" >编辑</el-button>
              <!-- 删除按钮 -->
              <div style="display: inline-block; margin: 0 6px">
                <el-popover :ref="`popover-${scope.row.cat_id}`">
                  <p>是否确定删除? </p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="closeDeleteWindow(`popover-${scope.row.cat_id}`)">取消</el-button>
                    <el-button type="primary" size="mini" @click="deleteCategory(scope.row.cat_id)">确定</el-button>
                  </div>
                  <el-button type="danger" size="small" slot="reference" icon="el-icon-delete">删除</el-button>
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
      <!-- 添加分类的对话框 -->
      <el-dialog title="添加分类" :visible.sync="addCategoryDialogVisible" :close-on-click-modal="false" @close="closeAddCategoryDialog('categoryForm')">
        <!-- 内容主体区-->
        <el-form :model="catInfo" label-position="right" label-width="85px" :rules="categoryRules" ref="categoryForm">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="catInfo.cat_name" autocomplete="off" clearable placeholder="请输入分类名称"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              v-model="catInfo.cat_pid"
              clearable
              :options="catList"
              :props="{ expandTrigger: 'hover', label: 'cat_name', value: 'cat_id', checkStrictly: true }"
              @change="categoryChange"
              style="width: 100%"/>
          </el-form-item>
        </el-form>
        <!-- 底部区 -->
        <div slot="footer" class="dialog-footer">
          <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCategory('categoryForm')">确 定</el-button>
        </div>
      </el-dialog>
      <!-- 修改分类的对话框 -->
      <el-dialog title="修改分类" :visible.sync="editCategoryDialogVisible" :close-on-click-modal="false" @close="closeEditCategoryDialog('editCategoryForm')">
        <!-- 内容主体区-->
        <el-form :model="catInfo" label-position="right" label-width="85px" :rules="categoryRules" ref="editCategoryForm">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="catInfo.cat_name" autocomplete="off" clearable placeholder="请输入分类名称"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区 -->
        <div slot="footer" class="dialog-footer">
          <el-button @click="editCategoryDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCategory('editCategoryForm')">确 定</el-button>
        </div>
      </el-dialog>
    </div>
</template>

<script>
  export default {
    name: 'Categories',
    data() {
      return {
        height: 600,
        categories: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        addCategoryDialogVisible: false,
        editCategoryDialogVisible: false,
        categoryRules: {
          cat_name: [
            { required:true, message: '请填写分类名称', trigger: 'blur' }
          ]
        },
        catInfo: {
          'cat_pid': [],
          //分类的名称
          'cat_name': '',
          //分类的等级
          'cat_level': 0
        },
        catList: []
      }
    },
    methods: {
      handleSizeChange(pageSize) {
        this.pageSize = pageSize
        this.getCategories()
      },
      handleCurrentChange(pageIndex) {
        this.pageIndex = pageIndex
        this.getCategories()
      },
      //关闭确认删除弹出框
      closeDeleteWindow(ref) {
        this.$refs[ref].doClose()
      },
      deleteCategory(id) {
        this.$http.delete(`categories/${id}`).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.$message.success(response.data.meta.msg)
              this.getCategories()
            }
          },
          error =>{
            this.$message.error(error.message)
          }
        )
        this.closeDeleteWindow(`popover-${id}`)
      },
      getCategories() {
        this.$http.get('categories', { params: { pagenum: this.pageIndex, pagesize: this.pageSize } }).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.categories = response.data.data.result
              this.totalPage = response.data.data.total
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      getCatList() {
        this.$http.get('categories', { params: { type: 2 } }).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.catList = response.data.data
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      showAddCategoryDialog() {
        this.getCatList()
        this.addCategoryDialogVisible = true
      },
      categoryChange() {
        this.catInfo.cat_level = this.catInfo.cat_pid.length
      },
      closeAddCategoryDialog(formName) {
        this.addCategoryDialogVisible = false
        this.$refs[formName].resetFields()
        this.catInfo = {
          'cat_pid': [],
          //分类的名称
          'cat_name': '',
          //分类的等级
          'cat_level': 0
        }
      },
      addCategory(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            if (this.catInfo.cat_pid.length !== 0) {
              this.catInfo.cat_pid = this.catInfo.cat_pid.pop()
            } else {
              this.catInfo.cat_pid = 0
            }
            this.$http.post('categories', this.catInfo).then(
              response =>{
                if (response.data.meta.status !== 201) {
                  this.$message.error(response.data.meta.msg)
                } else {
                  this.closeAddCategoryDialog(formName)
                  this.$message.success(response.data.meta.msg)
                  this.getCategories()
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
      showEditCategoryDialog(cat) {
        this.editCategoryDialogVisible = true
        this.catInfo.cat_pid = cat.cat_id
        this.catInfo.cat_name = cat.cat_name
      },
      closeEditCategoryDialog(formName) {
        this.closeAddCategoryDialog(formName)
        this.editCategoryDialogVisible = false
      },
      editCategory(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            console.log(this.catInfo)
            this.$http.put(`categories/${this.catInfo.cat_pid}`, { cat_name: this.catInfo.cat_name }).then(
              response => {
                if (response.data.meta.status !== 200) {
                  this.$message.error(response.data.meta.msg)
                } else {
                  this.closeEditCategoryDialog(formName)
                  this.$message.success(response.data.meta.msg)
                  this.getCategories()
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
      }
    },
    created() {
      this.getCategories()
      window.onresize = () => {
        this.height = document.documentElement.clientHeight || document.body.clientHeight
        this.height -= 290
      }
      window.onresize()
    }
  }
</script>

<style lang="css" scoped>
  .zk-table {
    margin-top: 20px;
  }
</style>
