<script setup>
import { RouterView, useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import TreeMenu from './components/TreeMenu.vue'
const $router = useRouter()
const currentRoute = ref($router.currentRoute.value.name === 'demo4')

watch(
  () => $router.currentRoute.value.name,
  (newValue, oldValue) => {
    // console.log('watch', newValue, oldValue)
    if (newValue === 'demo4') {
      currentRoute.value = true
    } else {
      currentRoute.value = false
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="wrapper" v-if="!currentRoute">
    <div class="left">
      <TreeMenu></TreeMenu>
    </div>
    <div class="right">
      <router-view></router-view>
    </div>
  </div>
  <div v-else>
    <router-view></router-view>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  width: 100%;
  min-height: 100vh;
  .left {
    width: 200px;
    min-height: 100%;
    // border-right: solid 1px var(--el-menu-border-color);
  }
  .right {
    flex: 1;
    width: 100%;
    min-height: 100vh;
  }
}
</style>
