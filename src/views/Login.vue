<template>
  <div class="content">
    <div class="header">
      <Header>
      </Header>
      <BeiAn class="beian" />
    </div>
    <!-- 居中卡片 -->
    <div class="main-card" :style="cardPosition">
      <div class="top-bar">
        <div class="title">
          <div>欢迎来到</div>
          <div class="text-change">鱼鹰聊天</div>
          <div>~</div>
        </div>
        <div class="sub-title" v-if="!showNewName">
          <p>狗东西😁，这里说话完全匿名。</p>
          <p>大肆发表你的言论吧~</p>
        </div>
        <div v-else style="display: flex; gap: 10px;">

        </div>
      </div>

      <div class="under-bar">
        <input class="code-input" v-model="code" placeholder="使用上次的身份，在这里输入记忆码" :class="[sharkFlag ? 'my-shark' : '']"
          :style="[isWrong ? wrongInputStyle : '']" @keyup.enter="useCode(code)">
        <div class="btn-new" @mouseenter="enterBtn" @mouseleave="leaveBtn" :style="btnPosition">
          <div v-if="!mouseEntered" class="hide text-btn">
            <IdentifyLogo />
            <div>获取一个新身份</div>
          </div>
          <div v-else class="hide name-box">
            <input class="name-input" placeholder="输入匿名昵称😝" v-model="name" :class="[isWrong ? 'wrong-input' : '']" @focus="inputEl = el" @keyup.enter="enter">
            <Dice :width="30" :height="30" class="dice" @click="roll"/>
            <Check class="check" @click="enter" v-if="!isWrong" :width="checkSize.width" :height="checkSize.height" />
            <Wrong class="check" :class="[sharkFlag ? 'my-shark' : '']" @click="enter" v-else id="myShark" />

            <!-- 清空按钮 -->
            <!-- <div class="close-box" v-if="name !== ''" @click="name = ''">
              <div class="close"></div>
            </div> -->

            <!-- </div> -->
          </div>
        </div>
        <!-- <div class="btn-code" @click="showNewName = false" 
        v-else :style="btnPosition" v-on:mouseout="leaveBtn"> -->
        <!-- <div>使用记忆码</div>
          <IdentifyLogo /> -->

      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, reactive, onMounted } from 'vue'
import router from '../router';
import IdentifyLogo from '../components/auth/IdentifyLogo.vue';
import Header from '../components/Header.vue';
import Check from '../components/icon/Check.vue';
import Wrong from '../components/icon/Wrong.vue';
import Dice from '../components/icon/Dice.vue';
import BeiAn from '../components/BeiAn.vue';
import { loginByName, getUserName, rollName } from '../api/login';
import cache from '../utils/cache';
import {historyMsgToChatStruct} from '@/workProcess/wareIndex.js'
import { message } from 'ant-design-vue'
import pinia from '@/stores'
import {userChatRoomInformation} from '@/stores/chat'
const showNewName = ref(false)
const chatInfo = userChatRoomInformation(pinia)
// 记忆码
const code = ref('')
watch(code, (newVal) => {
  console.log(newVal.length)
  if (newVal.length === 36) {
    useCode(newVal)
  }
})

const name = ref('')
// 随机生成名字
function roll() {
  rollName().then(res => {
    if (res.code) {
      name.value = res.data.userName
    } else {
      message.info(res.msg)
    }
  })
}

const checkSize = reactive({
  width: 30,
  height: 30
})

// 页面尺寸
const screen = {
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight
}

const arrs = reactive({
  x: 0,
  y: 0,
  clickHandler: (e) => {
    arrs.x = e.pageX;
    arrs.y = e.pageY
  }
})
const cardPosition = reactive({
  marginTop: '',
  marginLeft: ''
})
const btnPosition = reactive({
  left: '',
  bottom: ''
})

// 浮岛移动处理，手机端不做处理
watch(arrs, (newVal) => {
  if (screen.width < 768) {
    return
  }

  // console.log(newVal.x/screen.width- 0.5, newVal.y/screen.height-0.5)
  const moveValue = {
    x: (newVal.x / screen.width - 0.5) * 1,
    y: (newVal.y / screen.height - 0.5) * 1
  }
  // console.log(newVal.x, newVal.y)

  cardPosition.marginTop = `${-11.25 + moveValue.y}rem`
  cardPosition.marginLeft = `${-18.75 + moveValue.x}rem`

  btnPosition.left = `${-2.5 + moveValue.x * 0.8}rem`
  // btnPosition.bottom = `${-30 + moveValue.y*0.8}px`
})

// 目前鼠标所在的元素
const el = ref(null)
// 输入框元素，用于判断鼠标是否在输入框内
const inputEl = ref(null)
// 监听鼠标所在元素
function mouseOverHandler() {
  el.value = window.document.body; //声明一个变量，默认值为body
  window.document.body.onmouseover = function (event) {
    el.value = event.target; //鼠标每经过一个元素，就把该元素赋值给变量el
  }
}

onMounted(() => {
  chatInfo.isSound = false

  if (screen.width > 768) {
    // 若为电脑端的处理
    cardPosition.marginTop = '-11.25rem'
    cardPosition.marginLeft = '-18.75rem'
    btnPosition.left = '-2.5rem'
    btnPosition.bottom = '-1.9rem'

    checkSize.width = 40
    checkSize.height = 40
  }


  // 挂载鼠标位置监听器
  document.addEventListener('mousemove', arrs.clickHandler)

  

  mouseOverHandler()
  
})

// 进入聊天室
function enterChat(data) {
  console.log(data)

  router.push({
    name: 'chatroom'
  })

  historyMsgToChatStruct(data.talkingMessages)
  cache.local.set('talkingMessages', data.talkingMessages)
}

// 使用记忆码
function useCode(newVal) {
  getUserName(newVal).then(res => {
    if (res.code === 1) {
      cache.local.set('token', newVal)
      cache.local.set('username', res.data.userName)
      enterChat(res.data)
    } else {
      cache.local.remove('token')
      cache.local.remove('username')

      isWrong.value = true
      message.info(res.msg)
    }
  })
}

// 用名字进入聊天室
function enter() {
  if (name.value === "") {
    return
  }

  if(name.value.includes('@')) {
    isWrong.value = true
    return
  }


  loginByName(name.value).then(res => {
    if (res.code) {
      cache.local.set('token', res.data.uuid)
      cache.local.set('username', name.value)
      enterChat({
        userName: name.value,
        talkingMessages: res.data.talkingMessages
      })
    } else {
      isWrong.value = true

      message.info(res.msg)
    }
  })

}

// 鼠标移入按钮的处理
const mouseEntered = ref(false)
function enterBtn() {
  mouseEntered.value = true
  console.log("enter")
}
// 鼠标移出按钮的处理
function leaveBtn() {
  // 若鼠标移出后的元素不是输入框，则不做处理，针对微软输入法导致闪动的处理
  if(el.value === inputEl.value) {
    return
  }
  if (name.value !== "") {
    return
  }
  mouseEntered.value = false
  console.log("leave")
}

// 抖动效果控制
const sharkFlag = ref(false)
// 密码错误
const isWrong = ref(false)
watch(isWrong, (newVal) => {
  if (newVal) {
    name.value = "用户名无法使用"
    sharkFlag.value = true
    setTimeout(() => {
      name.value = ""
      code.value = ""
      sharkFlag.value = false
      isWrong.value = false
    }, 800)
  }
})

// 错误时的样式
const wrongInputStyle = reactive({
  border: "1px solid #F16E80"
})
</script>
<style scoped lang="scss">
.content {
  // padding: 100px;
}

.btn {
  background-color: #3A00FB;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  height: 40px;
  line-height: 40px;
  width: 150px;
  text-align: center;
  margin-bottom: 20px;
  cursor: pointer;
}

.main-card {
  left: 50%;
  top: 50%;

  background: #fff;
  border-radius: 18px;
  // border: 1px solid #ADADAD;
  width: 37.5rem;
  height: 13.75rem;
  display: flex;
  flex-direction: column;
  // align-items: center;
  box-shadow: 0.8rem 0.8rem 2rem 2px rgba(0, 0, 0, 0.082);
  position: fixed;

  .top-bar {
    padding: 1.8rem 1.8rem 1.2rem 2rem;
  }
}

@media screen and (max-width: 768px) {
  .main-card {
    width: 20rem;
    height: 15rem;
    margin-top: -7.5rem;
    margin-left: -10rem;
    // height: 50%;
    // top: 50%;
    // left: 50%;
    // transform: translate(-50%, -50%);
  }
}

p {
  margin: 8px 0;
}

.btn {
  background-color: #3A00FB;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  height: 40px;
  line-height: 40px;
  width: 150px;
  text-align: center;
  margin-top: 20px;
  cursor: pointer;
}

.go {
  cursor: pointer;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  height: 40px;
  line-height: 40px;
  width: 100px;
  border-radius: 8px;
  text-align: center;
  background-color: rgb(55, 142, 255);

  position: absolute;
  right: 20px;
}

.code-input:focus {
  border: 1px solid #838383;
}

.label {
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 10px;
}

.title {
  font-size: 25px;
  margin-bottom: 25px;
  display: flex;
}

.under-bar {
  position: absolute;
  bottom: 0;

  background-color: #F3F3F3;
  height: 35%;
  width: 100%;
  border-radius: 0 0 6px 6px;
  border-top: 1px solid #E2E3E3;

  display: flex;
  align-items: center;

  .code-input {
    height: 35px;
    width: 270px;
    border-radius: 8px;
    text-align: center;
    border: 1px solid #d2d2d2;
    background-color: #fff;
    outline: none;

    position: absolute;
    right: 20px;
  }
}

@media screen and (max-width: 768px) {
  .under-bar {
    .code-input {
      width: 16rem;
      left: 50%;
      margin-left: -8rem;
      top: 15%;
      right: auto;
    }
  }
}

.text-change {
  background-image: -webkit-linear-gradient(left, #5794B6, #7E4DBD);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.btn-new {
  background-image: -webkit-linear-gradient(left, #B0FDCF, #F793F5);
  height: 5.6rem;
  width: 20rem;
  line-height: 5.6rem;
  font-size: 25px;
  color: #3D3D3D;
  border-radius: 15px;
  position: absolute;
  text-align: center;
  box-shadow: 10px 10px 30px 2px rgba(0, 0, 0, 0.082);

  cursor: pointer;
  user-select: none;




  .name-box {
    height: 5.6rem;
    line-height: 5.6rem;
    width: 20rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;

    .dice {
      margin-top: 0.5rem;
      margin-left: -2.5rem;
    }

    .check {
      margin-top: 1.3rem;
      filter: drop-shadow(6px 6px 5px rgba(129, 129, 129, 0.692))
    }

    .name-input {
      color: #3D3D3D;
      height: 45px;
      width: 210px;
      border: none;
      border-bottom: 1px solid #000;
      background-color: transparent;
      outline: none;
      font-size: 20px;
      margin-bottom: 0.4rem;
    }
    .wrong-input {
      color: #F16E80;
      border-bottom: 1px solid #F16E80;
    }
  }




  .text-btn {
    display: flex;
    align-items: center;
    gap: 15px;
    height: 90px;
    width: 330px;
    justify-content: center;
  }
}

@media screen and (max-width: 768px) {
  .btn-new {
    width: 15rem;
    height: 4.5rem;
    line-height: 4.5rem;
    font-size: 20px;
    border-radius: 10px;
    top: 75%;
    left: 50%;
    margin-left: -7.5rem;


    .text-btn {
      display: flex;
      align-items: center;
      gap: 15px;
      width: 15rem;
      height: 4.5rem;
      justify-content: center;
    }

    .name-box {
      width: 15rem;
      height: 4.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.8rem;

      .dice {
        margin-top: 1rem;
        // position: absolute;
        // top: 5px;
      }

      .check {
        margin-top: 1.2rem;
      }

      .name-input {
        color: #3D3D3D;
        height: 45px;
        width: 9.5rem;
        border: none;
        border-bottom: 1px solid #000;
        background-color: transparent;
        outline: none;
        font-size: 1rem;
        // margin-bottom: 15px;
      }
    }
  }
}

.close-box {
  width: 23px;
  height: 47px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.close {
  position: relative;
  width: 2px;
  height: 20px;
  background: #2c3e50;
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
  display: inline-block;
  margin-right: 10px;
}

.close:after {
  position: absolute;
  top: 0;
  left: 0;
  content: "";
  width: 2px;
  height: 20px;
  background: #2c3e50;
  -webkit-transform: rotate(270deg);
  -moz-transform: rotate(270deg);
  -o-transform: rotate(270deg);
  -ms-transform: rotate(270deg);
  transform: rotate(270deg);
  margin-right: 10px;
}

.hide {
  animation: fadeIn ease 0.15s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    /*初始状态 透明度为0*/
  }

  50% {
    opacity: 0;
    /*中间状态 透明度为0*/
  }

  100% {
    opacity: 1;
    /*结尾状态 透明度为1*/
  }
}

// 抖动效果
.my-shark {
  animation: login-shake 0.8s 1 ease-in;
}

@keyframes login-shake {
  0% {
    transform: scale(1);
  }

  10%,
  20% {
    transform: scale(0.9) rotate(-3deg);
  }

  30%,
  50%,
  70%,
  90% {
    transform: scale(1.1) rotate(3deg);
  }

  40%,
  60%,
  80% {
    transform: scale(1.1) rotate(-3deg);
  }

  100% {
    transform: scale(1) rotate(0);
  }
}

.header {
  position: fixed;
  bottom: 6%;
  width: 100%;
  .beian {
    margin-top: 0.5rem;
    width: 100%;
    text-align: center;
    position: fixed;
  }
}
</style>
