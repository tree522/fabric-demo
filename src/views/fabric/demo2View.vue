<template>
  <div class="about">
    <button @click="saveJson">保存为JSON</button>
    <button @click="loadFromJSON">导入数据</button>
    <canvas id="c" width="200" height="200"></canvas>
  </div>
</template>
<script setup>
import { fabric } from 'fabric'
import { onMounted } from 'vue'

//new fabric.StaticCanvas
let canvas = null

// 准备数据
const data = `{
    "version": "5.2.4",
    "objects": [
      {
        "type": "rect",
        "version": "5.2.4",
        "originX": "left",
        "originY": "top",
        "left": 135.22,
        "top": 52.66,
        "width": 30,
        "height": 30,
        "fill": "darkcyan",
        "stroke": null,
        "strokeWidth": 1,
        "strokeDashArray": null,
        "strokeLineCap": "butt",
        "strokeDashOffset": 0,
        "strokeLineJoin": "miter",
        "strokeUniform": false,
        "strokeMiterLimit": 4,
        "scaleX": 1,
        "scaleY": 1,
        "angle": 0,
        "flipX": false,
        "flipY": false,
        "opacity": 1,
        "shadow": null,
        "visible": true,
        "backgroundColor": "",
        "fillRule": "nonzero",
        "paintFirst": "fill",
        "globalCompositeOperation": "source-over",
        "skewX": 0,
        "skewY": 0,
        "rx": 0,
        "ry": 0
      }
    ]
  }`

// 导入数据
const loadFromJSON = () => {
  canvas.loadFromJSON(data)
}

const saveJson = () => {
  const result = canvas.toJSON()
  console.log(result) // 在控制台输出结果
}
onMounted(() => {
  canvas = new fabric.Canvas('c', {
    width: 600,
    height: 600
    // isDrawingMode: true // 开启自由绘画模式
    // backgroundColor: '#aa96da'
  }) // 使用 fabric 绑定画布，将画布的id传入 fabric.Canvas 方法里

  // 矩形
  const rect = new fabric.Rect({
    top: 30,
    left: 30,
    width: 30,
    height: 30,
    fill: 'darkcyan'
  })

  // 圆形
  const circle = new fabric.Circle({
    top: 30,
    left: 100,
    radius: 30,
    fill: '#aa96da'
  })

  // 将矩形和圆形添加到画布中
  canvas.add(rect, circle)

  // 监听画布点击鼠标事件
  canvas.on('mouse:down', (options) => {
    console.log(`当前选中的元素：${options.target ? options.target.type : 'canvas'}`)
    console.log(options) // 将点击事件获得的对象输出到控制台
  })
  // 监听画布点击鼠标事件
  canvas.on('mouse:up', (options) => {
    console.log('mouse:up事件：', options)
  })

  rect.on('moving', (options) => {
    console.log('rect moving事件：', options)
  })
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
