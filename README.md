# Timer Town ⏱🏡️ [![Netlify Status](https://api.netlify.com/api/v1/badges/9318371b-449b-4c1a-ae3a-2ecc9eba0759/deploy-status)](https://app.netlify.com/sites/timertown/deploys)

A timer for pair programming

## Development

As this is a basic HTML page, need to uncomment the development scripts. Comment the production script.

Then to serve this to a page run:

```bash
npx serve
```

## JavaScript minification

```bash
npx terser --compress --mangle -o js/bundle.js -- js/main.js js/vue.min.js
````
