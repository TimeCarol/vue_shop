<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <el-form :model="loginForm" status-icon :rules="rules" ref="loginForm" class="login_form">
        <el-form-item prop="username">
          <el-input
            type="text"
            v-model="loginForm.username"
            prefix-icon="el-icon-user"
            placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            show-password
            v-model="loginForm.password"
            prefix-icon="el-icon-lock"
            placeholder="请输入密码"/>
        </el-form-item>
        <el-form-item class="button_box">
          <el-button type="primary" @click="submitForm('loginForm')">登录</el-button>
          <el-button @click="$refs['loginForm'].resetFields()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    data() {
      let validateUsername = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入用户名'));
        } else if (value.length < 3 || value.length > 10) {
          callback(new Error('用户名在 3 到 10 个字符之间'));
        } else {
          callback();
        }
      };
      let validatePassword = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else if (value.length < 6 || value.length > 15) {
          callback(new Error('密码在 6 到 15 个字符之间'));
        } else {
          callback();
        }
      };
      return {
        loginForm: {
          username: '',
          password: ''
        },
        rules: {
          username: [
            { validator: validateUsername, trigger: 'blur' }
          ],
          password: [
            { validator: validatePassword, trigger: 'blur' }
          ]
        }
      };
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$http.post('login', this.loginForm).then(
              response => {
                if (response.data.meta.status !== 200) {
                  this.$message.error(response.data.meta.msg)
                } else {
                  this.$message.success(response.data.meta.msg)
                  //将token保存到sessionStorage中
                  sessionStorage.setItem('token', response.data.data.token)
                  //跳转到主页
                  this.$router.push('/home')
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
        });
      }
    },
    beforeCreate () {
      //检查是否已登录
      if (sessionStorage.getItem('token')) {
        //已登录, 跳转到首页
        this.$router.push('/home')
      }
    }
  }
</script>

<style lang="css" scoped>
  .login_container {
    height: 100%;
    background-color: #2B4B6B;
  }
  .login_box {
    width: 450px;
    height: 300px;
    background-color: white;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #EEE;
    border-radius: 50%;
    box-shadow: 0 0 5px #EEE;
    overflow: hidden;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .avatar_box img {
    width: 100%;
    height: 100%;
  }
  .login_form {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding-left: 15px;
    padding-right: 15px;
  }
  .button_box {
    float: right;
  }
</style>
