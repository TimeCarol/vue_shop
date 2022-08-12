<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home/workbench' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card>
        <el-alert title="添加商品信息" type="info" center show-icon />
        <el-steps :active="Number.parseInt(active)" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top">
          <el-tabs tab-position="left" :style="{ 'height': height + 'px', 'overflow': 'auto' }" v-model="active" :before-leave="handlerChangeTab" @tab-click="tabClicked">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addForm.goods_name" autocomplete="off" clearable placeholder="请输入商品名称"/>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="addForm.goods_price" autocomplete="off" clearable oninput="value=value.replace(/[^0-9.]/g,'')" placeholder="请输入与商品价格"/>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model.number="addForm.goods_weight" autocomplete="off" clearable oninput="value=value.replace(/[^\d]/g,'')" placeholder="请输入商品重量"/>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model.number="addForm.goods_number" autocomplete="off" oninput="value=value.replace(/[^\d]/g,'')" clearable placeholder="请输入商品数量"/>
              </el-form-item>
              <el-form-item label="商品分类" prop="goods_cat">
                <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="{ value: 'cat_id', label: 'cat_name', expandTrigger: 'hover' }" clearable placeholder="请输入商品分类" />
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
              <el-form-item v-for="attr in manyAttributes" :label="attr.attr_name" :key="attr.attr_id">
                <el-checkbox-group v-model="attr.attr_vals">
                  <el-checkbox :label="val" :key="val" v-for="val in attr.attr_vals" border/>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <el-form-item v-for="attr in onlyAttributes" :label="attr.attr_name" :key="attr.attr_id">
                <el-input v-model="attr.attr_vals" autocomplete="off" :placeholder="'请输入' + attr.attr_name"/>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <el-upload
                class="upload-demo"
                :action="$http.defaults.baseURL + 'upload'"
                :headers="{'Authorization': token}"
                list-type="picture"
                drag
                accept=".jpg,.png"
                :on-success="successUpload"
                :on-preview="handlerPreview"
                :on-remove="handlerRemove">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件</div>
              </el-upload>
              <el-dialog :visible.sync="imageDialogVisible">
                <img width="100%" :src="dialogImageUrl" alt="">
              </el-dialog>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <quill-editor
                v-model="addForm.goods_introduce"
                ref="myQuillEditor"
                :options="editorOptions">
              </quill-editor>
              <el-button type="primary" style="margin-top: 15px" @click="addGood('addFormRef')">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-card>
    </div>
</template>

<script>
  // 引入样式
  import 'quill/dist/quill.core.css'
  import 'quill/dist/quill.snow.css'
  import 'quill/dist/quill.bubble.css'
  import { quillEditor } from 'vue-quill-editor'
  export default {
    name: 'Add',
    data() {
      let validatePrice = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入商品价格'))
        } else if (value.indexOf(".") !== -1 && value.split('.').length > 2) {
          callback(new Error('请输入正确格式的金额')) //防止输入多个小数点
        } else if (value.indexOf(".") !== -1 && value.split('.')[1].length > 2) {
          callback(new Error('请输入正确的小数位数')) //小数点后两位
        } else {
          callback()
        }
      }
      let validateCategory = (rule, value, callback) => {
        if (value.length < 3) {
          callback(new Error('只允许选择三级分类'))
        } else {
          callback()
        }
      }
      return {
        active: 0,
        height: 600,
        addForm: {
          goods_name: '',
          goods_price: null,
          goods_weight: null,
          goods_number: null,
          goods_cat: [],
          pics: [],
          goods_introduce: '',
          attrs: []
        },
        addFormRules: {
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' }
          ],
          goods_price: [
            { required: true, validator: validatePrice, trigger: 'blur' }
          ],
          goods_weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' },
            { type: 'number', min:0, max: 65535, message: '商品重量在 0 到 65535 之间', trigger: 'blur' }
          ],
          goods_number: [
            { required: true, message: '请输入商品数量', trigger: 'blur' },
            { type: 'number', min:0, max: 4294967295, message: '商品数量在 0 到 4294967295 之间', trigger: 'blur' }
          ],
          goods_cat: [
            { required: true, message: '请输入商品分类', trigger: 'change' },
            { required: true, validator: validateCategory, trigger: 'change' }
          ]
        },
        cateList: [],
        manyAttributes: [],
        onlyAttributes: [],
        token: '',
        imageDialogVisible: false,
        dialogImageUrl: 'javascript:',
        editorOptions: {
          debug: 'warn',
          placeholder: '请输入商品详情描述',
          theme: 'snow'
        }
      }
    },
    methods: {
      getCateList() {
        this.$http.get('categories').then(
          response => {
            if (response.data.meta.status !== 200) {
              this.$message.error(response.data.meta.msg)
            } else {
              this.cateList = response.data.data
            }
          },
          error => {
            this.$message.error(error.message)
          }
        )
      },
      handlerChangeTab(activeName, oldActiveName) {
        if (oldActiveName === '0' && this.addForm.goods_cat.length === 0) {
          this.$message.error('请先选择商品分类')
          return false
        } else {
          return true
        }
      },
      tabClicked() {
        if (this.active === '1') {
          this.$http.get(`categories/${this.addForm.goods_cat[this.addForm.goods_cat.length  - 1]}/attributes`, { params: { sel: 'many' } } ).then(
            response => {
              if (response.data.meta.status !== 200) {
                this.$message.error(response.data.meta.msg)
              } else {
                response.data.data.forEach(item => {
                  if (item.attr_vals) {
                    item.attr_vals = item.attr_vals.trim().split(' ')
                  } else {
                    item.attr_vals = []
                  }
                })
                this.manyAttributes = response.data.data
              }
            },
            error => {
              this.$message.error(error.message)
            }
          )
        } else if (this.active === '2') {
          this.$http.get(`categories/${this.addForm.goods_cat[this.addForm.goods_cat.length  - 1]}/attributes`, { params: { sel: 'only' } } ).then(
            response => {
              if (response.data.meta.status !== 200) {
                this.$message.error(response.data.meta.msg)
              } else {
                this.onlyAttributes = response.data.data
              }
            },
            error => {
              this.$message.error(error.message)
            }
          )
        }
      },
      handlerPreview(file) {
        this.imageDialogVisible = true
        this.dialogImageUrl = file.response.data.url
      },
      successUpload(response, file, fileList) {
        if (response.meta.status !== 200) {
          this.$message.error(response.meta.msg)
        } else {
          this.$message.success(response.meta.msg)
          this.addForm.pics.push(response.data.tmp_path)
        }
      },
      handlerRemove(file, fileList) {
        this.addForm.pics = this.addForm.pics.filter(pic => {
          return pic !== file.response.data.tmp_path
        })
      },
      addGood(ref) {
        this.$refs[ref].validate(valid => {
          if (valid) {
            let data = JSON.parse(JSON.stringify(this.addForm))
            data.goods_cat = data.goods_cat.join(',')
            data.goods_price= Number.parseFloat(data.goods_price)
            // data.pics = data.pics.map(pic => { return { pic } })
            data.pics = []
            //处理动态参数
            this.manyAttributes.forEach(item => {
              data.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') })
            })
            this.onlyAttributes.forEach(item => {
              data.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals })
            })
            this.$http.post('goods', data).then(
              response => {
                if (response.data.meta.status !== 201) {
                  this.$message.error(response.data.meta.msg)
                } else {
                  this.$message.success(response.data.meta.msg)
                  this.$router.replace('/home/goods')
                }
              },
              error => {
                this.$message.error(error.message)
              }
            )
          } else {
            console.log('提交校验失败')
            this.$message.error('请填写必要的表单项')
            return false
          }
        })
      }
    },
    components: {
      quillEditor
    },
    created () {
      this.getCateList()
      this.token = sessionStorage.getItem('token')
      window.onresize = () => {
        this.height = document.documentElement.clientHeight || document.body.clientHeight
        this.height -= 305
      }
      window.onresize()
    }
  }
</script>

<style lang="css" scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
  ::v-deep .ql-editor {
    min-height: 300px;
  }
</style>
