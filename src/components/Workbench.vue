<template>
  <div class="main-container">
    <div class="img-container">
      <img src="../assets/workbench.png" alt="" width="768"/>
    </div>
    <div class="audio-container">
      <span class="audio-title">{{ currentAudioName || audioList[0].name }}</span>
      <audio-player
        ref="audioPlayer"
        :audio-list="audioList.map(elm => elm.url)"
        :before-play="handleBeforePlay"
        theme-color="#ff2929"
        style="width: 100%"
      />
    </div>
  </div>
</template>

<script>
  import AudioPlayer from '@liripeng/vue-audio-player'
  export default {
    name: 'Workbench',
    components: {
      AudioPlayer
    },
    data() {
      return {
        currentAudioName: '',
        audioList: [
          {
            name: '',
            url: ''
          }
        ]
      }
    },
    methods: {
      // 播放前做的事
      handleBeforePlay (next) {
        // 这里可以做一些事情...
        this.currentAudioName = this.audioList[this.$refs.audioPlayer.currentPlayIndex].name
        next() // 开始播放
      }
    },
    created () {
      this.$http.get('songs').then(
        response => {
          if (response.data.meta.status !== 200) {
            this.$message.error(response.data.meta.msg)
          } else {
            this.audioList = response.data.data
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
  .main-container {
    width: 100%;
    height: 100%;
  }
  .img-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .audio-container {
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: -110px;
  }
  .audio-title {
    margin-left: 16px;
  }
</style>
