// ============================================
// Service Worker - 智能待办清单 PWA
// 功能：离线缓存、后台同步、资源预缓存
// ============================================

// 缓存版本号（更新应用时修改此版本号）
const CACHE_VERSION = 'v1.0.0';

// 缓存名称
const CACHE_NAME = `todo-list-cache-${CACHE_VERSION}`;

// 需要预缓存的静态资源列表
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// API请求的缓存名称（用于离线时显示缓存数据）
const API_CACHE_NAME = `todo-list-api-${CACHE_VERSION}`;

// ============================================
// 安装事件 - 预缓存静态资源
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] 正在安装 Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 预缓存静态资源');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // 跳过等待，立即激活
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] 预缓存失败:', error);
      })
  );
});

// ============================================
// 激活事件 - 清理旧缓存
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker 已激活');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // 删除旧版本的缓存
              return name.startsWith('todo-list-') && 
                     name !== CACHE_NAME && 
                     name !== API_CACHE_NAME;
            })
            .map((name) => {
              console.log('[SW] 删除旧缓存:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // 立即接管所有页面
        return self.clients.claim();
      })
  );
});

// ============================================
// 请求拦截 - 缓存策略
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源请求和API请求
  if (url.origin !== location.origin && !url.pathname.startsWith('/api')) {
    return;
  }

  // API请求：网络优先，失败时使用缓存
  if (url.pathname.startsWith('/api')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // 静态资源：缓存优先，失败时使用网络
  event.respondWith(cacheFirstStrategy(request));
});

// ============================================
// 缓存策略：缓存优先（适用于静态资源）
// ============================================
async function cacheFirstStrategy(request) {
  try {
    // 1. 先尝试从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] 从缓存返回:', request.url);
      return cachedResponse;
    }

    // 2. 缓存中没有，从网络获取
    const networkResponse = await fetch(request);
    
    // 3. 如果网络请求成功，缓存响应
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('[SW] 缓存新资源:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] 获取资源失败:', error);
    
    // 4. 如果都失败了，返回离线页面（如果有的话）
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 返回一个简单的离线响应
    return new Response('离线状态，请检查网络连接', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// ============================================
// 缓存策略：网络优先（适用于API请求）
// ============================================
async function networkFirstStrategy(request) {
  try {
    // 1. 先尝试网络请求
    const networkResponse = await fetch(request);
    
    // 2. 如果成功，缓存API响应（用于离线时显示）
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('[SW] 缓存API响应:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] 网络请求失败，尝试缓存:', request.url);
    
    // 3. 网络失败，尝试从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] 返回缓存的API数据');
      return cachedResponse;
    }

    // 4. 缓存也没有，返回错误
    return new Response(
      JSON.stringify({ error: '网络不可用，请稍后重试' }), 
      {
        status: 503,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
}

// ============================================
// 消息处理 - 与主页面通信
// ============================================
self.addEventListener('message', (event) => {
  console.log('[SW] 收到消息:', event.data);

  // 处理跳过等待的请求
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // 处理清除缓存的请求
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

// ============================================
// 推送通知（可选功能，需要后端支持）
// ============================================
self.addEventListener('push', (event) => {
  console.log('[SW] 收到推送通知');

  const options = {
    body: event.data ? event.data.text() : '您有新的待办事项！',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'open', title: '查看任务' },
      { action: 'close', title: '稍后提醒' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('智能待办清单', options)
  );
});

// 处理通知点击
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 通知被点击');
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker 脚本已加载');