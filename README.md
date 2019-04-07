# Pizza Timer 🍕⏱️ [![Netlify Status](https://api.netlify.com/api/v1/badges/fd7f2efa-ea12-4ed0-9fcf-17ecea77ed99/deploy-status)](https://app.netlify.com/sites/timerpizza/deploys)

A timer for pair programming


## JavaScript minification

```bash
npx terser --compress --mangle -o js/bundle.js -- js/main.js js/vue.min.js
```