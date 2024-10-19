import express from "express";

const app = express();
app.set("etag", false)

app.get("/time", async (req, res) => {
    res.status(200);
    res.header("Content-Type", "application/json");

    if (!req.headers["x-cache"].includes("proxy")) {
        res.header("Cache-Control", "public, max-age=10");
    }
    res.header("x-id", req.headers["x-id"]);

    await new Promise((resolve) => setTimeout(resolve, 500));

    res.send({time: Date.now()});
});

app.get("/", (_, res) => {
    res.status(200);
    res.header("Content-Type", "text/html");

    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link
          rel="shortcut icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' style='background-color:%2318181b' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5'/%3E%3Cpath d='M16 2v4'/%3E%3Cpath d='M8 2v4'/%3E%3Cpath d='M3 10h5'/%3E%3Cpath d='M17.5 17.5 16 16.3V14'/%3E%3Ccircle cx='16' cy='16' r='6'/%3E%3C/svg%3E"
        >
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Time Check</title>
      </head>
      <body class="my-4 bg-zinc-900 text-zinc-50">
        <main class="container mx-auto">
          <h1 class="text-3xl font-bold">Check your time</h1>
          <small class="text-xs prose font-light block">We are only caching the time for performance reasons, you should get a good estimate of your local time anyway...</small>
          
          <p class='text-lg font-semibold mt-4'>The time currently is: <span id="timeValue">loading...</span></p>
          <p id="cacheStatus" class="px-2 py-1 rounded bg-rose-700 text-rose-50 text-sm w-fit">Cached</p>       
          
          <div class="mt-4">
              <p id="browserCache" class="font-semibold">Browser cache is stale</p/>
              <p id="nginxCache" class="font-semibold">Nginx cache is stale</p>
          </div>
          
          <div class="flex flex-row items-center gap-2 mt-4">
              <button class="text-sm px-4 py-2 bg-zinc-100 text-zinc-950 rounded" onclick="getTime('cache')">Get time</button> 
              <button class="text-sm px-4 py-2 bg-zinc-100 text-zinc-950 rounded" onclick="getTime('no-cache')">Get fresh time</button> 
              <button class="text-sm px-4 py-2 bg-zinc-100 text-zinc-950 rounded" onclick="getTime('proxy')">Get proxy time</button> 
              <button class="text-sm px-4 py-2 bg-zinc-100 text-zinc-950 rounded" onclick="getTime('proxy-no-cache')">Get fresh proxy time</button> 
          </div>
        </main>
      </body>
      
      <script>
        let cacheTimeBrowser = 0;
        let cacheTimeNginx = 0;
        
        setInterval(() => {
            const now = Date.now();
            const timeLeftBrowser = 10 - Math.floor((now - cacheTimeBrowser) / 1000);
            const timeLeftNginx = 10 - Math.floor((now - cacheTimeNginx) / 1000);
            
            const newTextBrowser = timeLeftBrowser > 0 ? \`Browser cache is fresh (\${timeLeftBrowser}s left)\` : 'Browser cache is stale';
            if(browserCache.innerText !== newTextBrowser) {
                browserCache.innerText = newTextBrowser;
              }
             const newTextNginx = timeLeftNginx > 0 ? \`Nginx cache is fresh (\${timeLeftNginx}s left)\` : 'Nginx cache is stale';
            if(nginxCache.innerText !== newTextNginx) {
              nginxCache.innerText = newTextNginx;
            } 
        })
      
        function getTime(cache) {
          const id = Math.random().toString(36).substring(7);
          timeValue.innerText = 'loading...';
          const url = cache.includes('proxy') ? '/cached/time' : '/time'
          fetch(url, {
              headers: {
                'x-id': id,
                "x-cache": cache,
                ...(cache.includes("no-cache") ? { "Cache-Control": "no-cache" } : {}),
              }
          })
            .then(async (response) => {
              const data = await response.json();
              timeValue.innerText = new Date(data.time).toLocaleString(
                undefined,
                { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC' }
              );
              
              const isCached = response.headers.get('x-id') !== id;
              const isCachedByNginx = !!response.headers.get('X-Cache-Date');
              if(isCachedByNginx) {
                cacheTimeNginx = new Date(response.headers.get('X-Cache-Date')).getTime();
              } else if(!isCached) {
                cacheTimeBrowser = Date.now();
              }
              
              cacheStatus.innerText = isCached ? isCachedByNginx ? 'Cached (Nginx)' : 'Cached' : 'Fresh';
              cacheStatus.classList.remove('bg-fuchsia-700', 'bg-green-700', 'bg-rose-700');
              cacheStatus.classList.add(isCached ? isCachedByNginx ? 'bg-fuchsia-700' : 'bg-rose-700' : 'bg-green-700');
            });
        }
        getTime("no-cache");
      </script>
    </html>
  `);
});

app.listen(3000, () =>
    console.log("Server is listening on port 3000..."),
);
