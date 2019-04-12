const {
  injectManifest
} = require("preact-cli-workbox-plugin");

export default function (config, env, helpers) {
  return injectManifest(config, helpers, {
    swSrc: "service-worker.js",
    include: [/\.html$/, /(\.[\w]{5}\.js)$/, /\.css$/, /\.png$/, /\.mp3$/]
  });
}