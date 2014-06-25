# webhook-demux

[![build status](https://secure.travis-ci.org/mapbox/webhook-demux.png)](http://travis-ci.org/mapbox/webhook-demux) [![Coverage Status](https://coveralls.io/repos/mapbox/webhook-demux/badge.png)](https://coveralls.io/r/mapbox/webhook-demux)

Routes a single webhook endpoint to multiple webhook endpoints
depending on content of the JSON request body.

## how

Webhooks are sent to this server, and you configure a `config.json`
file (or whatever's in the `--config` argument) that looks like:

```js
[{
    "url": "http://blue.com/"
}]
```

Match is a JavaScript object with a subset of properties that should
[_.matches](http://underscorejs.org/#matches) a request data
subset. Then it routes the same exact request with the same headers
and method to a different url, given by `url`.
