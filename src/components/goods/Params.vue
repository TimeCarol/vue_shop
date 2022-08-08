<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/workbench' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert
        title="注意: 只允许为第三级分类设置相关参数!"
        type="warning"
        show-icon
        :closable="false"/>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          选择商品分类:
          <el-cascader
            v-model="cat_id"
            clearable
            :options="categories"
            :props="{ expandTrigger: 'hover', label: 'cat_name', value: 'cat_id' }"
            @change="handleChange"
            style="width: 300px"/>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleChange">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="small" :disabled="cat_id.length !== 3" @click="addAttrDialogVisible = true">添加参数</el-button>
          <el-table
            :data="attributes"
            :height="height"
            row-key="attr_id"
            stripe
            border
            :header-cell-style="{'text-align': 'center', 'background-color': '#F5F7FA'}"
            :cell-style="{'text-align': 'center'}"
            style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="props">
                <div style="text-align: center">
                  <el-tag
                    v-for="tag in props.row.attr_vals"
                    :key="tag"
                    closable
                    v-if="tag"
                    @close="removeAttrVal(props.row, tag)"
                    style="margin: 10px;">
                    {{tag}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="props.row.inputVisible"
                    v-model="props.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(props.row)"
                    @blur="props.row.inputVisible = false"
                    style="margin: 10px; width: 90px"
                  />
                  <el-button v-else class="button-new-tag" size="small" @click="showInput('saveTagInput', props.row)" style="margin: 10px">+ New Tag</el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="序号" type="index" width="60">
            </el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <!-- 编辑按钮 -->
                <el-button type="primary" size="small" icon="el-icon-edit" @click="showEditAttrDialog(scope.row)" >编辑</el-button>
                <!-- 删除按钮 -->
                <div style="display: inline-block; margin: 0 6px">
                  <el-popover :ref="`popover-${scope.row.attr_id}`">
                    <p>是否确定删除? </p>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" type="text" @click="closeDeleteWindow(`popover-${scope.row.attr_id}`)">取消</el-button>
                      <el-button type="primary" size="mini" @click="deleteAttr(scope.row.attr_id)">确定</el-button>
                    </div>
                    <el-button type="danger" size="small" slot="reference" icon="el-icon-delete">删除</el-button>
                  </el-popover>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="small" :disabled="cat_id.length !== 3" @click="addAttrDialogVisible = true">添加属性</el-button>
          <el-table
            :data="attributes"
            :height="height"
            row-key="attr_id"
            stripe
            border
            :header-cell-style="{'text-align': 'center', 'background-color': '#F5F7FA'}"
            :cell-style="{'text-align': 'center'}"
            style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="props">
                <div style="text-align: center">
                  <el-tag
                    v-for="tag in props.row.attr_vals"
                    :key="tag"
                    closable
                    v-if="tag"
                    @close="removeAttrVal(props.row, tag)"
                    style="margin: 10px;">
                    {{tag}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="props.row.inputVisible"
                    v-model="props.row.inputValue"
                    ref="saveInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(props.row)"
                    @blur="props.row.inputVisible = false"
                    style="margin: 10px; width: 90px"
                  />
                  <el-button v-else class="button-new-tag" size="small" @click="showInput('saveInput', props.row)" style="margin: 10px">+ New Tag</el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="序号" type="index" width="60">
            </el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <!-- 编辑按钮 -->
                <el-button type="primary" size="small" icon="el-icon-edit" @click="showEditAttrDialog(scope.row)" >编辑</el-button>
                <!-- 删除按钮 -->
                <div style="display: inline-block; margin: 0 6px">
                  <el-popover :ref="`popover-${scope.row.attr_id}`">
                    <p>是否确定删除? </p>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" type="text" @click="closeDeleteWindow(`popover-${scope.row.attr_id}`)">取消</el-button>
                      <el-button type="primary" size="mini" @click="deleteAttr(scope.row.attr_id)">确定</el-button>
                    </div>
                    <el-button type="danger" size="small" slot="reference" icon="el-icon-delete">删除</el-button>
                  </el-popover>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog :title="title" :visible.sync="addAttrDialogVisible" :close-on-click-modal="false" @close="closeAddAttrDialog('addAttrForm')">
      <!-- 内容主体区-->
      <el-form :model="attribute" label-position="right" label-width="85px" :rules="attributeRules" ref="addAttrForm">
        <el-form-item :label="label" prop="attr_name">
          <el-input v-model="attribute.attr_name" autocomplete="off" clearable :placeholder="placeholder"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="addAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAdd('addAttrForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog :title="title" :visible.sync="editAttrDialogVisible" :close-on-click-modal="false" @close="closeEditAttrDialog('editAttrForm')">
      <!-- 内容主体区-->
      <el-form :model="attribute" label-position="right" label-width="85px" :rules="attributeRules" ref="editAttrForm">
        <el-form-item :label="label" prop="attr_name">
          <el-input v-model="attribute.attr_name" autocomplete="off" clearable :placeholder="placeholder"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="editAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEdit('editAttrForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Params',
    data() {
      return {
        height: 580,
        activeName: 'many',
        title: '',
        label: '',
        placeholder: '',
        cat_id: [],
        categories: [],
        attributes: [],
        attribute: {
          attr_id: 0,
          attr_name: '',
          attr_sel: 'many',
          attr_vals: ''
        },
        attributeRules: {
          attr_name: [
            { required: true, message: '', trigger: 'blur' }
          ]
        },
        addAttrDialogVisible: false,
        editAttrDialogVisible: false,
      }
    },
    watch: {
      addAttrDialogVisible() {
        if (this.activeName === 'many') {
          this.title = '添加动态参数'
          this.attribute.attr_sel = 'many'
          this.label = '动态参数'
          this.placeholder = '请输入动态参数'
        } else if (this.activeName === 'only') {
          this.title = '添加静态属性'
          this.attribute.attr_sel = 'only'
          this.label = '静态属性'
          this.placeholder = '请输入静态属性'
        }
        this.attributeRules.attr_name[0].message = this.placeholder
      },
      editAttrDialogVisible() {
        if (this.activeName === 'many') {
          this.title = '添加动态参数'
          this.attribute.attr_sel = 'many'
          this.label = '动态参数'
          this.placeholder = '请输入动态参数'
        } else if (this.activeName === 'only') {
          this.title = '添加静态属性'
          this.attribute.attr_sel = 'only'
          this.label = '静态属性'
          this.placeholder = '请输入静态属性'
        }
        this.attributeRules.attr_name[0].message = this.placeholder
      }
    },
    methods: {
      getCategories() {
        this.$http.get('categories').then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.categories = response.data.data
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      handleChange() {
        if (this.cat_id.length !== 3) {
          this.cat_id.length = 0
          this.attributes = []
        } else {
          this.getAttributes()
        }
      },
      getAttributes() {
        this.$http.get(`categories/${this.cat_id[this.cat_id.length - 1]}/attributes`, { params: { sel: this.activeName } }).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              response.data.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                this.$set(item, 'inputVisible', false)
                this.$set(item, 'inputValue', '')
              })
              this.attributes = response.data.data
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      showEditAttrDialog(attr) {
        this.editAttrDialogVisible = true
        this.attribute.attr_name = attr.attr_name
        this.attribute.attr_id = attr.attr_id
        this.attribute.attr_vals = attr.attr_vals.join(' ')
      },
      closeAddAttrDialog(ref) {
        this.addAttrDialogVisible = false
        this.$refs[ref].resetFields()
      },
      closeEditAttrDialog(ref) {
        this.editAttrDialogVisible = false
        this.$refs[ref].resetFields()
      },
      closeDeleteWindow(ref) {
        this.$refs[ref].doClose()
      },
      deleteAttr(id) {
        this.$http.delete(`categories/${this.cat_id[this.cat_id.length - 1]}/attributes/${id}`).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.$message.success(response.data.meta.msg)
              this.getAttributes()
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
        this.closeDeleteWindow(`popover-${id}`)
      },
      submitAdd(ref) {
        this.$refs[ref].validate(valid => {
          if (valid) {
            this.$http.post(`categories/${this.cat_id[this.cat_id.length - 1]}/attributes`, {...this.attribute}).then(
              response => {
                if (response.data.meta.status !== 201) {
                  this.$message.error(response.data.meta.msg)
                } else {
                  this.$message.success(response.data.meta.msg)
                  this.closeAddAttrDialog(ref)
                  this.getAttributes()
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
      submitEdit(ref) {
        this.$http.put(`categories/${this.cat_id[this.cat_id.length - 1]}/attributes/${this.attribute.attr_id}`, {...this.attribute}).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.$message.success(response.data.meta.msg)
              this.closeEditAttrDialog(ref)
              this.getAttributes()
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      handleInputConfirm(attr) {
        this.attribute.attr_vals += ' ' + attr.inputValue
        this.attribute.attr_sel = this.activeName
        this.$http.put(`categories/${this.cat_id[this.cat_id.length - 1]}/attributes/${this.attribute.attr_id}`, {...this.attribute}).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              attr.inputVisible = false
              this.inputValue = ''
              this.getAttributes()
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      removeAttrVal(attr, tag) {
        this.attribute.attr_vals = attr.attr_vals.filter(val => val !== tag)
        this.attribute.attr_vals = this.attribute.attr_vals.join(' ').trim()
        this.attribute.attr_id = attr.attr_id
        this.attribute.attr_name = attr.attr_name
        this.attribute.attr_sel = this.activeName
        this.$http.put(`categories/${this.cat_id[this.cat_id.length - 1]}/attributes/${this.attribute.attr_id}`, {...this.attribute}).then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.getAttributes()
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      showInput(ref, attr) {
        attr.inputVisible = true
        this.attribute.attr_name = attr.attr_name
        this.attribute.attr_id = attr.attr_id
        this.attribute.attr_vals = attr.attr_vals.join(' ')
        this.$nextTick(() => {
          this.$refs[ref].focus();
        })
      }
    },
    created() {
      this.getCategories()
      window.onresize = () => {
        this.height = document.documentElement.clientHeight || document.body.clientHeight
        this.height -= 395
      }
      window.onresize()
    }
  }
</script>

<style lang="css" scoped>
  .el-row {
    margin: 15px 0;
  }
</style>
