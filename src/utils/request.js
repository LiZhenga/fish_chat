import axios from 'axios'
import pinia from '@/stores'
import { userInformation } from '@/stores/user'
const userStore = userInformation(pinia)
function request (axiosConfig) {
  const baseUrl = 'https://chat-api.haaland.top'
  console.log('here is baseUrl:' + baseUrl)
  const service = axios.create({
    baseURL: baseUrl, // 设置统一的请求前缀
    timeout: 6000
  })

  // 请求拦截
  service.interceptors.request.use(config => {
    return config
  }, err => {
    return err
  })

  // 响应拦截
  service.interceptors.response.use(res => {
    return res.data
  }, err => {
    console.log(err)
    return err
  })

  return service(axiosConfig)
}

export default request
