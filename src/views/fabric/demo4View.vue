<template>
  <div class="main">
    <div class="main-left">
      <div class="item" @click="getPencil">铅笔</div>
      <div class="item">直线</div>
      <div class="item">椭圆</div>
      <div class="item">矩形</div>
    </div>
    <div class="main-right"><canvas id="c"></canvas></div>
  </div>
</template>
<script setup>
import { fabric } from 'fabric'
import { onMounted, reactive } from 'vue'

//new fabric.StaticCanvas
let canvas = reactive({})

onMounted(() => {
  init()
})

//初始画布
const init = () => {
  canvas = new fabric.Canvas('c', {
    width: 1900,
    height: 900,
    isDrawingMode: true // 开启自由绘画模式
    // backgroundColor: '#aa96da'
  })
}

// 点击铅笔
const getPencil = () => {
  const pencilBrush = new fabric.PencilBrush(canvas)
  pencilBrush.color = 'pink'
  canvas.freeDrawingBrush = pencilBrush
}
</script>
<style scoped>
#c {
  border: 1px solid #ccc;
  box-sizing: border-box;
}
.main {
  display: flex;
  .main-left {
    min-width: 40px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    .item {
      display: inline-block;
      margin-bottom: 5px;
      text-align: center;
      border: 1px solid #e8e7e7;
      cursor: pointer;
    }
  }
  .main-right {
    flex: 1;
    height: 100vh;
  }
}
</style>
