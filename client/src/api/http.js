import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useAppStore } from '../store/app';

const http = axios.create({
  baseURL: '/api',
  timeout: 10000
});

http.interceptors.request.use((config) => {
  const store = useAppStore();
  store.setLoading(true);
  return config;
});

http.interceptors.response.use(
  (response) => {
    const store = useAppStore();
    store.setLoading(false);
    return response;
  },
  (error) => {
    const store = useAppStore();
    store.setLoading(false);
    const status = error?.response?.status;
    const messageMap = {
      400: '参数错误',
      404: '资源不存在',
      500: '服务器异常'
    };
    ElMessage.error(messageMap[status] || error?.message || '网络异常');
    return Promise.reject(error);
  }
);

export default http;
