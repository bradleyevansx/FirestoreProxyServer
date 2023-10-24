const http = require("http");
const httpProxy = require("http-proxy");
const url = require("url");
const https = require("https");

const proxy = httpProxy.createProxyServer({
  secure: false,
});

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const { pathname } = url.parse(req.url);
  const [, videoName, videoClip] = pathname.split("/");

  const targetUrl = `https://firebasestorage.googleapis.com/v0/b/project-1-bdfa6.appspot.com/o/videos%2F${videoName}%2F${videoClip}?alt=media`;

  https
    .get(targetUrl, (storageRes) => {
      res.setHeader("Content-Type", storageRes.headers["content-type"]);

      storageRes.pipe(res, { end: true });
    })
    .on("error", (err) => {
      console.error("Error in Firebase Storage request:", err);

      res.writeHead(500, {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      });

      res.end("Error in Firebase Storage request");
    });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Proxy server is listening on port ${PORT}`);
});
