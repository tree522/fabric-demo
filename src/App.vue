<script setup>
import { RouterView } from 'vue-router'
import TreeMenu from './components/TreeMenu.vue'
</script>

<template>
  <div class="wrapper">
    <div class="left">
      <TreeMenu></TreeMenu>
    </div>
    <div class="right">
      <router-view></router-view>
    </div>
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
