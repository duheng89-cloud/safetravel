// 定义缓存的名称，更新版本时可以修改这里的名称来清除旧缓存
const CACHE_NAME = 'safetravel-cache-v1';

// 定义在安装 Service Worker 时需要提前缓存的文件列表
// 这里缓存了根目录、主网页文件和 PWA 的配置文件
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 监听 Service Worker 的 install（安装）事件
self.addEventListener('install', event => {
  // 等待缓存操作完成后再结束安装过程
  event.waitUntil(
    // 打开指定的缓存空间
    caches.open(CACHE_NAME)
      .then(cache => {
        // 将定义好的文件列表加入缓存
        return cache.addAll(urlsToCache);
      })
  );
});

// 监听所有的 fetch（网络请求）事件，拦截应用发出的请求
self.addEventListener('fetch', event => {
  // 拦截请求并自定义响应
  event.respondWith(
    // 首先在缓存中寻找是否匹配当前请求的文件
    caches.match(event.request)
      .then(response => {
        // 如果在缓存中找到了对应的文件，直接返回缓存的文件（实现离线访问）
        // 如果没有找到，则通过 fetch 向服务器发起真实的真实网络请求
        return response || fetch(event.request);
      })
  );
});