importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js');

if (workbox) {
  console.log('Yay! Workbox is loaded');

  workbox.precaching.precacheAndRoute([
  {
    "url": "style/main.css",
    "revision": "628320e3f89c25f36472cda3e970e57d"
  },
  {
    "url": "index.html",
    "revision": "2a72edefd9b473c1dd09d547769318c2"
  },
  {
    "url": "js/animation.js",
    "revision": "8952a6ec2786e6e8d62a7934bc7f1c1f"
  },
  {
    "url": "images/icon/icon.svg",
    "revision": "0d077eac3b5028d3543f7e35908d6ecb"
  },
  {
    "url": "images/home/business.jpg",
    "revision": "9c3ec8d2a8a188bab9ddc212a64a0c1e"
  },
  {
    "url": "pages/offline.html",
    "revision": "09b9feaee1fbd9d3f27253d24b7911c9"
  },
  {
    "url": "pages/404.html",
    "revision": "1a6cf0261a93d2c998c813d5588856bb"
  }
]);

  //Cache-first strategy for all images in the web app
  workbox.routing.registerRoute(
    /(.*)articles(.*)\.(?:png|gif|jpg)/,
    workbox.strategies.cacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        })
      ]
    })
  );

  //Network-first strategy for articles in the web app
  const articleHandler = workbox.strategies.networkFirst({
    cacheName: 'articles-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50,
      })
    ]
  });
  
  workbox.routing.registerRoute(/(.*)article(.*)\.html/, args => {
    return articleHandler.handle(args).then(response => {
      if (!response) {
        return caches.match('pages/offline.html');
      } else if (response.status === 404) {
        return caches.match('pages/404.html');
      }
      return response;
    });
  });

  //Cache-first strategy for posts in the web app
  const postsHandler = workbox.strategies.cacheFirst({
    cacheName: 'posts-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50,
      })
    ]
  });

  workbox.routing.registerRoute(/(.*)post(.*)\.html/, args => {
    return postsHandler.handle(args).then( response => {
      console.log(response);
      if (response.status === 404) {
        return caches.match('pages/404.html');
      }
      return response;
    })
    .catch(e => {
      return caches.match('/pages/offline.html');
    });
  });

} else {
  console.log(`Boo! Workbox didn't load`);
}