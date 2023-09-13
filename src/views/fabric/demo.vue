<template>
  <div class="about">
    <canvas id="c" width="200" height="200"></canvas>
  </div>
</template>
<script setup>
import { fabric } from 'fabric'
import { onMounted } from 'vue'

//new fabric.StaticCanvas
let canvas = null

onMounted(() => {
  canvas = new fabric.Canvas('c', {
    width: 600,
    height: 600
    // isDrawingMode: true // 开启自由绘画模式
    // backgroundColor: '#aa96da'
  }) // 使用 fabric 绑定画布，将画布的id传入 fabric.Canvas 方法里\
})
</script>
<style scoped>
#c {
  border: 1px solid #ccc;
  box-sizing: border-box;
}
.about {
  display: flex;
  flex-direction: column;
}
</style>
