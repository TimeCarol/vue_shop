<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/workbench' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 为 ECharts 准备一个定义了宽高的 DOM -->
      <div id="main" :style="{width: '100%', height: height + 'px'}"></div>
    </el-card>
  </div>
</template>

<script>
  //导入echarts
  import * as echarts from 'echarts'
  export default {
    name: 'Report',
    data() {
      return {
        height: 600,
        //需要合并的数据
        options: {
          title: {
            text: '用户来源'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#E9EEF3'
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              boundaryGap: false
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ]
        }
      }
    },
    created () {
      window.onresize = () => {
        this.height = document.documentElement.clientHeight || document.body.clientHeight
        this.height -= 180
      }
      window.onresize()
    },
    mounted() {
      // 基于准备好的dom，初始化echarts实例
      let myChart = echarts.init(document.getElementById('main'));
      this.$http.get('reports/type/1').then(
        response => {
          if (response.data.meta.status !== 200) {
            this.$message.error(response.data.meta.msg)
          } else {
            const option = response.data.data
            this.options = {...this.options, ...option}
            this.options.xAxis[0].boundaryGap = false
            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(this.options);
          }
        },
        error => {
          this.$message.error(error.message)
        }
      )
    }
  }
</script>

<style lang="css" scoped>

</style>
