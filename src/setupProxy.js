const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

// CRA usually injects REACT_APP_*; ensure .env is read if proxy runs without them.
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (_) {
  /* optional */
}

const proxyTarget = process.env.REACT_APP_PROXY_TARGET || 'https://accelerator.aiesec.eg';

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: proxyTarget,
      changeOrigin: true,
      secure: false,
      logLevel: 'warn',
      pathRewrite: (path) => {
        if (path.startsWith('/api/v1')) return path;
        return path.replace(/^\/api/, '/api/v1');
      },
      onError: (err, req, res) => {
        console.error('[Proxy]', err.message, req.url);
        if (res && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              detail: `Proxy error — is the backend running on ${proxyTarget}?`,
            })
          );
        }
      },
    })
  );
};
