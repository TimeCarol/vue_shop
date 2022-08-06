<template>
    <div>
      <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>

<script>
  export default {
    name: 'Home',
    methods: {
      logout() {
        sessionStorage.removeItem('token')
        this.$message.info('退出登录成功')
        this.$router.replace('/login')
      }
    }
  }
</script>

<style scoped>

</style>
