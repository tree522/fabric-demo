<template>
  <el-row class="tac">
    <el-col :span="24">
      <h5 class="mb-2">Tree's demo city😉😉</h5>
      <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
        @select="selectHandle"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon><location /></el-icon>
            <span>fabric</span>
          </template>
          <el-menu-item index="demo1">常用基础绘画</el-menu-item>
          <el-menu-item index="demo2">事件</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="2">
          <el-icon><icon-menu /></el-icon>
          <span>Navigator Two</span>
        </el-menu-item>
        <el-menu-item index="3" disabled>
          <el-icon><document /></el-icon>
          <span>Navigator Three</span>
        </el-menu-item>
        <el-menu-item index="4">
          <el-icon><setting /></el-icon>
          <span>Navigator Four</span>
        </el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script setup>
import { Document, Menu as IconMenu, Location, Setting } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
const $router = useRouter()
const handleOpen = (key, keyPath) => {
  // console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  // console.log(key, keyPath)
}
const selectHandle = (key, keyPath) => {
  // console.log(key, keyPath)
  $router.push({
    name: key
  })
}
</script>
<style lang="scss" scoped>
.tac {
  height: 100%;
  ul {
    height: 100%;
    overflow-y: auto;
  }
}
</style>
