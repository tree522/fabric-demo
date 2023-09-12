<template>
  <div class="about">
    <canvas id="c" width="200" height="200"></canvas>
  </div>
</template>
<script setup>
import { fabric } from 'fabric'
import { onMounted } from 'vue'
onMounted(() => {
  //new fabric.StaticCanvas
  const canvas = new fabric.Canvas('c', {
    width: 600,
    height: 600,
    isDrawingMode: true // 开启自由绘画模式
    // backgroundColor: '#aa96da'
  }) // 使用 fabric 绑定画布，将画布的id传入 fabric.Canvas 方法里

  //----------比如 strokeDashArray: [4, 10] 出来的效果就是 实线4像素, 空白10像素, 实线4像素, 空白10像素-----------------------------
  //----------shadow: x轴偏移量 y轴偏移量 羽化程度 颜色------
  /*
   * 创建矩形元素
   * top和left: 设置矩形左上角所在的位置（相对于画布左上角）
   * width和height: 设置矩形的宽高
   * fill: 填充色（默认黑色）
   */
  const rect = new fabric.Rect({
    top: 10,
    left: 10,
    width: 60,
    height: 60,
    fill: 'darkcyan',
    stroke: 'red',
    strokeWidth: 10, // 设置描边粗细
    strokeDashArray: [4, 10], // 虚线边框
    shadow: '10px 20px 6px rgba(250, 20, 20, 0.8)' // 元素阴影
  })

  // 将矩形添加到画布中
  canvas.add(rect)

  //-----------
  // 创建圆形元素
  const circle = new fabric.Circle({
    top: 30,
    left: 50,
    radius: 40,
    fill: '#a18cd1'
  })

  canvas.add(circle)

  //--------------
  // 创建椭圆元素
  const ellipse = new fabric.Ellipse({
    top: 30,
    left: 50,
    rx: 70,
    ry: 30,
    fill: '#84fab0'
  })

  canvas.add(ellipse)
  //----------------------
  // 创建三角形元素
  const triangle = new fabric.Triangle({
    top: 40,
    left: 100,
    width: 60, // 底边长度
    height: 80, // 底边到对角的距离（三角形的高）
    fill: 'blue'
  })

  canvas.add(triangle)

  //-------------------
  // 创建线段元素
  const line = new fabric.Line(
    [
      10,
      10, // 起始点坐标
      200,
      300 // 结束点坐标
    ],
    {
      stroke: 'red' // 笔触颜色
    }
  )

  canvas.add(line)

  //-------------------
  // 创建Text元素
  const text = new fabric.Text('雷猴，我是德育处主任', {
    fill: 'hot#aa96da', // 文本填充色
    fontSize: 30 // 字号
  })

  canvas.add(text)
  //-------------------
  // 创建可编辑Text元素
  const itext = new fabric.IText('双击可编辑', {
    top: 60, // 文本到画布顶部的距离
    left: 100 // 文本到画布左侧的距离
  })

  canvas.add(itext)
  //------------fabric.Textbox() 设置了 width 后，会根据内容长度和空格（单词）来换行。-------
  // 创建Text元素
  const textbox = new fabric.Textbox('雷猴 世界', {
    width: 100,
    top: 20,
    left: 100
  })

  canvas.add(textbox)
  //-------------------
  // 使用fabric的api加载图片
  fabric.Image.fromURL(
    '../../src/assets/tiananmen.png', // 参数1：图片路径
    (img) => {
      // 参数2：图片加载完成后的回调函数

      // 设置图片在画布中的位置
      img.top = 50
      img.left = 50
      // 将图片添加到画布中
      canvas.add(img)
    }
  )
  //-------------------
  //-------------------
  //-------------------
  //-------------------
  //-------------------
})
</script>
<style scoped>
#c {
  border: 1px solid #ccc;
  box-sizing: border-box;
}
</style>
