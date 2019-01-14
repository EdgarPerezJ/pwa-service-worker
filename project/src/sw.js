importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js');

if (workbox) {
  console.log('Yay! Workbox is loaded');

  workbox.precaching.precacheAndRoute([]);

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