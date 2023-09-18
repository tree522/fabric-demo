<template>
  <div class="main">
    <div class="main-left">
      <div class="item" @click="goHome">返回</div>
      <div class="item" @click="doChoose">选择</div>
      <div class="item" @click="doPencil">铅笔</div>
      <div class="item" @click="handleFn('text')">文本</div>
      <div class="item">
        <input type="color" title="设置画笔颜色" v-model="borderColor" @input="changePenColor" />
      </div>
      <div class="item">
        <el-select v-model.number="borderWidth" title="线框宽度" @change="changPenWidth">
          <el-option v-for="item in selectValue" :key="item" :label="item" :value="item">
            <span>width:{{ item }}</span>
          </el-option>
        </el-select>
      </div>
      <div class="item" @click="handleFn('line')">直线</div>
      <div class="item" @click="handleFn('dotted')">虚线</div>
      <div class="item" @click="handleFn('arrow')">箭头</div>
      <div class="item" @click="handleFn('circle')">圆形</div>
      <div class="item" @click="handleFn('ellipse')">椭圆形</div>
      <div class="item" @click="handleFn('triangle')">三角形</div>
      <div class="item" @click="handleFn('rect')">矩形</div>
      <!-- ------- -->
      <div class="item" @click="backBtn">上一步</div>
      <div class="item" @click="nextBtn">下一步</div>
      <div class="item" @click="deleteBtn">删除</div>
      <div class="item" @click="removeBtn">重置画布</div>
      <div class="item" @click="saveBtn">下载图片</div>
      <div class="item">
        <!-- 更换背景图片 -->
        <el-upload
          ref="upload"
          class="upload-demo"
          action=""
          :http-request="handleUpload"
          accept=".jpg,.png"
          :on-change="changFileStatus"
          :on-success="successFile"
          :on-preview="handlePreview"
          :before-upload="beforeUploadType"
        >
          更换背景图
        </el-upload>
      </div>
      <div class="item" @click="configBtn">设置</div>
      <div class="item" @click="handleFn('mosaic')">马赛克</div>
      <!-- 下载图片 -->
      <a href="" ref="savePng" style="display: none" v-if="aShow"></a>
    </div>
    <div class="main-right"><canvas id="c"></canvas></div>
  </div>
</template>
<script setup>
import { fabric } from 'fabric'
import { onMounted, reactive, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
const $router = useRouter()
const goHome = () => {
  $router.back()
}

let canvas = reactive({})
let canvasElement = reactive({})
let ctx = reactive({})

onMounted(() => {
  init()
})
let savePng = ref(null)
let aShow = ref(false)
let handleType = ref('') //当前点击的按钮类型
let flagUp = ref(false) //当前活动的组
let textObj = ref('') //存储绘制文字对象
let backStack = reactive([]) //所有的绘画对象栈
let nextStack = reactive([]) //删除的绘画对象栈
let downPoint = reactive({}) //鼠标按下的点位置
let lastPosX = ref('') //鼠标移动的最后X坐标
let lastPosY = ref('') //鼠标移动的最后Y坐标
let patternClass = ref('') //鼠标按下绘制的对象
let borderWidth = ref(1) //所有图形边框的宽度
let borderColor = ref('#000000') //所有图形边框的颜色
let selectValue = reactive([1, 2, 3, 5, 10]) //边框线条选择数据

let fileData = ref(null) //上传文件的对象

//初始画布
const init = () => {
  let bodyParam = document.body
  canvas = new fabric.Canvas('c', {
    width: bodyParam.clientWidth,
    height: bodyParam.clientHeight,
    backgroundColor: '#FFFFFF', // 画布背景色
    isDrawingMode: false, // 自由绘图模式
    devicePixelRatio: true, //Retina 高清屏 屏幕支持
    targetFindTolerance: 10, //当元素以实际内容选择时，这个值越大越表面容易被选择到
    perPixelTargetFind: true, // 选择绘画对象时，以对象实际内容选择，而不是所处边界
    willReadFrequently: true
  })

  //修改原型上面的控制器样式
  fabric.Object.prototype.transparentCorners = false
  fabric.Object.prototype.padding = 10

  initCanvasElement()

  initEvent()
}

const initCanvasElement = () => {
  canvasElement = document.getElementById('c')
  ctx = canvasElement.getContext('2d')
}

const initEvent = () => {
  //监听键盘事件
  document.addEventListener('keyup', (e) => {
    // console.log('----', e.code)
    //当按下delete删除选中的对象
    if (flagUp.value && e.code == 'Backspace') {
      //判断文字是否在编辑状态
      if (flagUp.value.selected[0].isEditing === true) return
      flagUp.value.selected.forEach((item) => {
        canvas.remove(item)
      })
      //抛弃当前处于活动状态的Object
      canvas.discardActiveObject()
      flagUp.value = false
    }
  })

  //创建fabric监听事件
  canvas.on({
    'mouse:down': (opt) => {
      //对文字对象的判断
      isTextObj(opt)
      let evt = opt.e
      downPoint = opt.absolutePointer

      // 是否按住alt，可以拖拽画布
      if (evt.altKey === true && canvas.selection === true) {
        canvas.isDragging = true // isDragging 是自定义的，开启移动状态
        lastPosX.value = evt.clientX // lastPosX 是自定义的,直接添加在对象身上，也可以定义在data中
        lastPosY.value = evt.clientY // lastPosY 是自定义的
      }
      drawing()
    },
    //鼠标抬起
    'mouse:up': (opt) => {
      canvas.setViewportTransform(canvas.viewportTransform) // 设置此画布实例的视口转换
      canvas.isDragging = false // 关闭移动状态
      //当没有选择绘制图案时，返回
      if (!patternClass.value || handleType.value === 'text') {
        //将自由绘画的对象存在栈中
        if (!patternClass.value && canvas.selection === false) {
          //比较对象长度是否发生变化，是否有新增
          let getObj = canvas.getObjects()
          backStack.push(getObj[getObj.length - 1])
        }
        patternClass.value = null
        return
      }
      if (JSON.stringify(downPoint) === JSON.stringify(opt.absolutePointer)) {
        canvas.remove(patternClass.value)
      } else {
        //将当前对象压入栈中
        backStack.push(patternClass.value)
      }
      //将创建的对象置空
      patternClass.value = null
    },
    //鼠标移动
    'mouse:move': (opt) => {
      //画布移动
      if (canvas.isDragging) {
        let evt = opt.e
        let vpt = canvas.viewportTransform // 聚焦视图的转换

        vpt[4] += evt.clientX - lastPosX.value
        vpt[5] += evt.clientY - lastPosY.value
        lastPosX.value = evt.clientX
        lastPosY.value = evt.clientY
        canvas.requestRenderAll() // 重新渲染
      }
      //图案绘制
      patternFun(opt)
    }
  })
}
const changePenColor = () => {
  //修改自由绘画画笔颜色
  canvas.freeDrawingBrush.color = borderColor.value
}

const changPenWidth = () => {
  //改变自由绘画笔触的大小,这里的this.penWidth必须是number类型，否则会出现平移旋转
  canvas.freeDrawingBrush.width = borderWidth.value
}

// const lineWidth = (item) => {
//   console.log('98888', item)
//   //线条的粗细样式
//   return {
//     'border-top': `${item}px solid black`,
//     'margin-top': '10px',
//     height: '1px',
//     display: 'block'
//   }
// }

const handleUpload = () => {
  //自定义上传
  getBase64(fileData.value.raw).then((res) => {
    // console.log(res)
    //获取图片的尺寸
    const image = new Image()
    image.onload = () => {
      let imageWidth = (canvas.width / image.naturalWidth).toFixed(4)
      let imageHeight = (canvas.height / image.naturalHeight).toFixed(4)

      // console.log([imageWidth, imageHeight])
      canvas.setBackgroundImage(res, canvas.renderAll.bind(canvas), {
        width: image.naturalWidth,
        height: image.naturalHeight,
        scaleX: imageWidth,
        scaleY: imageHeight,
        crossOrigin: 'anonymous'
      })
    }
    image.src = res
  })
}
const getBase64 = (file) => {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader()
    let imgResult = ''
    reader.readAsDataURL(file)
    reader.onload = function () {
      imgResult = reader.result
    }
    reader.onerror = function (error) {
      reject(error)
    }
    reader.onloadend = function () {
      resolve(imgResult)
    }
  })
}
const successFile = (response, file, fileList) => {
  //文件上传成功的函数
  console.log(response, file, fileList)
}

const changFileStatus = (file, fileList) => {
  //文件选择内容改变触发
  fileData.value = fileList[fileList.length - 1]
}
const handlePreview = (file) => {
  console.log(file)
}
const beforeUploadType = (file) => {
  //文件长传之前的操作，判断文件大小和类型
  //判断文件的类型
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
    // this.$message.error('上传图片只能是 JPG、PNG 格式!')
    return false
  }
  //判断文件大小
  if (file.size / 1024 / 1024 >= 1.5) {
    // this.$message.error('上传的图片大小不能超过1.5MB！')
    return false
  }
  return true
}

const patternFun = (e) => {
  console.log('---', patternClass.value)
  let rectW,
    rectH,
    path,
    circleX,
    circleY,
    circleTop,
    circleLeft,
    rx,
    ry,
    top,
    left,
    triangleHeight,
    x,
    y,
    px

  if (patternClass.value) {
    switch (handleType.value) {
      case 'line':
        patternClass.value.set('x1', e.absolutePointer.x)
        patternClass.value.set('y1', e.absolutePointer.y)
        patternClass.value.set('x2', downPoint.x)
        patternClass.value.set('y2', downPoint.y)
        canvas.requestRenderAll()
        break
      case 'dotted':
        patternClass.value.set('x1', e.absolutePointer.x)
        patternClass.value.set('y1', e.absolutePointer.y)
        patternClass.value.set('x2', downPoint.x)
        patternClass.value.set('y2', downPoint.y)
        canvas.requestRenderAll()
        break
      case 'arrow':
        //先移除当前的图形，在重新生成新的
        canvas.remove(patternClass.value)
        path = changePath(
          downPoint.x,
          downPoint.y,
          e.absolutePointer.x,
          e.absolutePointer.y,
          17.5,
          17.5
        )
        patternClass.value = new fabric.Path(path, {
          stroke: borderColor.value,
          fill: 'transparent',
          strokeWidth: borderWidth.value
        })
        canvas.add(patternClass.value)
        canvas.requestRenderAll()
        break

      case 'circle':
        circleX = Math.abs(downPoint.x - e.absolutePointer.x) / 2
        circleY = Math.abs(downPoint.y - e.absolutePointer.y) / 2
        circleTop = e.absolutePointer.y > downPoint.y ? downPoint.y : downPoint.y - circleY * 2
        circleLeft = e.absolutePointer.x > downPoint.x ? downPoint.x : downPoint.x - circleX * 2
        patternClass.value.set('radius', Math.max(circleX, circleY))
        patternClass.value.set('top', circleTop)
        patternClass.value.set('left', circleLeft)
        canvas.requestRenderAll()
        break

      case 'ellipse':
        rx = Math.abs(downPoint.x - e.absolutePointer.x) / 2
        ry = Math.abs(downPoint.y - e.absolutePointer.y) / 2
        top = e.absolutePointer.y > downPoint.y ? downPoint.y : downPoint.y - ry * 2
        left = e.absolutePointer.x > downPoint.x ? downPoint.x : downPoint.x - rx * 2
        // 设置椭圆尺寸和所在位置
        patternClass.value.set('rx', rx)
        patternClass.value.set('ry', ry)
        patternClass.value.set('top', top)
        patternClass.value.set('left', left)
        canvas.requestRenderAll()
        break
      case 'triangle':
        triangleHeight = Math.abs(e.absolutePointer.y - downPoint.y)
        patternClass.value.set(
          'width',
          Math.sqrt(Math.pow(triangleHeight, 2) + Math.pow(triangleHeight / 2.0, 2))
        )
        patternClass.value.set('height', triangleHeight)
        patternClass.value.set('top', Math.min(e.absolutePointer.y, downPoint.y))
        patternClass.value.set('left', Math.min(e.absolutePointer.x, downPoint.x))
        canvas.requestRenderAll()
        break
      case 'rect':
        rectW = Math.abs(downPoint.x - e.absolutePointer.x)
        rectH = Math.abs(downPoint.y - e.absolutePointer.y)
        // 设置尺寸和所在位置
        patternClass.value.set('width', rectW)
        patternClass.value.set('height', rectH)
        patternClass.value.set('top', Math.min(e.absolutePointer.y, downPoint.y))
        patternClass.value.set('left', Math.min(e.absolutePointer.x, downPoint.x))
        // 刷新一下画布
        canvas.requestRenderAll()
        break
      case 'mosaic':
        px = ctx.getImageData(lastPosX.value, lastPosY.value, 1, 1).data
        console.log(`red:${px[0]} green:${px[1]} blue:${px[2]} alpha:${px[3]}`)
        canvas.requestRenderAll()
        break
    }
  }
}

// 将模式改为图形编辑
const initStatus = () => {
  canvas.selection = false
  canvas.skipTargetFind = true
  canvas.isDrawingMode = false
}

const handleFn = (type) => {
  handleType.value = type
  initStatus()
}
const drawing = () => {
  // console.log('---', handleType.value)
  let path
  switch (handleType.value) {
    case 'line':
      patternClass.value = new fabric.Line(
        [
          downPoint.x, //直线的开始坐标
          downPoint.y,
          downPoint.x,
          downPoint.y
        ],
        {
          fill: 'transparent',
          stroke: borderColor.value,
          strokeWidth: borderWidth.value
        }
      )
      canvas.add(patternClass.value)
      break
    case 'dotted':
      patternClass.value = new fabric.Line(
        [
          downPoint.x, //虚线的开始坐标
          downPoint.y,
          downPoint.x, //第二个结束的坐标
          downPoint.y
        ],
        {
          fill: 'transparent',
          strokeDashArray: [10, 3], //设置为虚线，第一个值是实线的长度，第二个是虚线的长度
          stroke: borderColor.value,
          strokeWidth: borderWidth.value
        }
      )
      canvas.add(patternClass.value)
      break
    case 'circle':
      patternClass.value = new fabric.Circle({
        top: downPoint.y,
        left: downPoint.x,
        radius: 0, // 圆的半径
        fill: 'transparent',
        stroke: borderColor.value,
        strokeWidth: borderWidth.value
      })
      canvas.add(patternClass.value)
      break
    case 'triangle':
      patternClass.value = new fabric.Triangle({
        left: downPoint.x,
        top: downPoint.y,
        width: 0, //三角形底边的宽度
        height: 0, //底边到顶部角的高度
        fill: 'transparent',
        stroke: borderColor.value,
        strokeWidth: borderWidth.value
      })
      canvas.add(patternClass.value)
      break
    case 'ellipse':
      patternClass.value = new fabric.Ellipse({
        top: downPoint.y,
        left: downPoint.x,
        rx: 0, //椭圆的两个中心点
        ry: 0,
        fill: 'transparent',
        stroke: borderColor.value,
        strokeWidth: borderWidth.value
      })
      canvas.add(patternClass.value)
      break
    case 'arrow':
      path = changePath(downPoint.x, downPoint.y, downPoint.x, downPoint.y, 17.5, 17.5)
      patternClass.value = new fabric.Path(path, {
        stroke: borderColor.value,
        fill: 'transparent',
        strokeWidth: borderWidth.value
      })
      canvas.add(patternClass.value)
      break
    case 'rect':
      patternClass.value = new fabric.Rect({
        top: downPoint.y, //创建对象的坐标
        left: downPoint.x,
        width: 0, //宽和高
        height: 0,
        fill: 'transparent', //填充颜色
        stroke: borderColor.value, //线条颜色
        strokeWidth: borderWidth.value //线条宽度
      })
      canvas.add(patternClass.value)
      break
    case 'text':
      patternClass.value = new fabric.Textbox('', {
        left: downPoint.x,
        top: downPoint.y,
        fontSize: 20,
        hasBorders: true, //修改的时候，是否显示文字所在区域
        width: 450,
        splitByGrapheme: true, //超过宽度自动换行
        fill: borderColor.value, //字体颜色
        borderColor: 'rgb(102,153,255,0.35)' //当元素被拖动或输入内容时的边框
      })
      canvas.add(patternClass.value)
      textObj.value = patternClass.value
      patternClass.value.enterEditing()
      break
    case 'mosaic':
      patternClass.value = new fabric.Rect({
        top: downPoint.y, //创建对象的坐标
        left: downPoint.x,
        width: 5, //宽和高
        height: 5,
        fill: 'transparent', //填充颜色
        stroke: borderColor.value, //线条颜色
        strokeWidth: borderWidth.value //线条宽度
      })
      canvas.add(patternClass.value)
      break
  }
}

const backBtn = () => {
  //需要将每次绘画的对象存在一个栈中，对栈顶的元素进行删除操作
  if (backStack.length == 0) return
  //要删除的对象
  let backObj = backStack[backStack.length - 1]
  canvas.remove(backObj)
  //将删除的元素存到删除栈中
  nextStack.push(backObj)
  //更改栈的长度
  backStack.length = backStack.length - 1
  canvas.requestRenderAll()
}

const nextBtn = () => {
  //将删除的元素在压入栈顶
  if (nextStack.length == 0) return
  // console.log(nextStack)
  //将最后元素添加在画布中
  let nextObj = nextStack[nextStack.length - 1]
  canvas.add(nextObj)
  //将刚刚元素加入到back栈中
  backStack.push(nextObj)
  //改变栈的长度
  nextStack.length = nextStack.length - 1
  canvas.requestRenderAll()
}
const deleteBtn = () => {
  //获取画布上活动的元素
  let activeObj = canvas.getActiveObject()
  //执行删除操作
  if (activeObj && activeObj._objects) {
    //当选择的是一组的时候
    let arrObj = activeObj._objects
    arrObj.forEach((item) => {
      canvas.remove(item)
      //把删除的对象从back栈中删除
      backStack.splice(backStack.indexOf(item), 1)
      //把删除的对象添加到next栈中
      nextStack.push(item)
    })
  } else if (activeObj) {
    //选择是单个对象的时候
    canvas.remove(activeObj)
    //把删除的对象从back栈中删除
    backStack.splice(backStack.indexOf(activeObj), 1)
    //把删除的对象添加到next栈中
    nextStack.push(activeObj)
  } else {
    console.log('请选择一个图形！')
  }
  canvas.requestRenderAll()
}

const removeBtn = () => {
  //获取所有画布所有的元素，然后调用删除
  canvas.getObjects().forEach((item) => {
    canvas.remove(item)
  })
  canvas.requestRenderAll()
}

const saveBtn = () => {
  saveBasePng()
  //下载后需要刷新一下画布，不然有bug
  canvas.requestRenderAll()
}

const configBtn = () => {
  //获取当前画布的宽和高
  // form = {
  //   setWidth: canvas.getWidth(),
  //   setHeight: canvas.getHeight()
  // }

  canvas.setWidth(300)
  canvas.setHeight(300)
  canvas.requestRenderAll()
}

const changePath = (fromX, fromY, toX, toY, theta, headlen) => {
  //返回路径值
  theta = typeof theta != 'undefined' ? theta : 30
  headlen = typeof theta != 'undefined' ? headlen : 10
  // 计算各角度和对应的P2,P3坐标
  let angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI,
    angle1 = ((angle + theta) * Math.PI) / 180,
    angle2 = ((angle - theta) * Math.PI) / 180,
    topX = headlen * Math.cos(angle1),
    topY = headlen * Math.sin(angle1),
    botX = headlen * Math.cos(angle2),
    botY = headlen * Math.sin(angle2)
  let arrowX = fromX - topX,
    arrowY = fromY - topY
  let path = ' M ' + fromX + ' ' + fromY
  path += ' L ' + toX + ' ' + toY
  arrowX = toX + topX
  arrowY = toY + topY
  path += ' M ' + arrowX + ' ' + arrowY
  path += ' L ' + toX + ' ' + toY
  arrowX = toX + botX
  arrowY = toY + botY
  path += ' L ' + arrowX + ' ' + arrowY
  return path
}

const saveBasePng = () => {
  //下载图片
  //保存为png格式，也可以更改为jpeg
  let pngBase64 = canvas.toDataURL('image/png', 1.0)
  aShow.value = true //创建下载链接
  nextTick(() => {
    savePng.value.download = Date.now() + '.png' //下载名称
    savePng.value.href = pngBase64 //下载链接
    savePng.value.click() //点击下载
    aShow.value = false //删除链接
  })
}

const isTextObj = (opt) => {
  //判断上次的文字对象内容和编辑状态
  if (textObj.value !== '') {
    if (textObj.value.isEditing === true) {
      textObj.value.exitEditing()
      //将文字对象存在栈中
      backStack.push(textObj.value)
    }
    if (textObj.value.text === '') {
      canvas.remove(textObj.value) //空文本删除
      textObj.value = ''
    }
  }
  //判断当前点击的对象是不是文字
  if (opt.target) {
    textObj.value = opt.target
  }
}

// 选择
const doChoose = () => {
  canvas.selection = true // 允许框选
  // canvas.selectionColor = 'rgba(100, 100, 255, 0.3)' // 选框填充色：半透明的蓝色
  // canvas.selectionBorderColor = 'rgba(255, 255, 255, 0.3)' // 选框边框颜色：半透明灰色
  canvas.skipTargetFind = false // 允许选中
  canvas.isDrawingMode = false //关闭自由绘画
}

//画笔
const doPencil = () => {
  handleType.value = 'pencil'
  canvas.selection = false // 去除框选
  canvas.skipTargetFind = true // 不允许选中
  canvas.isDrawingMode = true //开启自由绘画
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
    padding-right: 5px;
    min-width: 90px;
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

  .test {
    background-color: red;
  }
}
</style>
