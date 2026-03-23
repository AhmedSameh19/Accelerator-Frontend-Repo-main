const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api-accelerator.aiesec.org.eg/api/v1', // Local backend
      changeOrigin: true,
      secure: false, // No SSL for localhost
      logLevel: 'debug',
      // Don't rewrite the path - keep /api/v1/... as is
      pathRewrite: {
        '^/api': '/api' // Keep the /api prefix
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log the proxy request for debugging
        console.log('🔄 [Proxy] Proxying request:', {
          originalUrl: req.url,
          proxiedUrl: proxyReq.path,
          target: 'https://api-accelerator.aiesec.org.eg/api/v1',
          method: req.method
        });
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log the proxy response for debugging
        const statusCode = proxyRes.statusCode;
        if (statusCode >= 400) {
          console.error(`❌ [Proxy] Backend error ${statusCode}:`, {
            url: req.url,
            statusCode: statusCode,
            statusMessage: proxyRes.statusMessage,
            headers: proxyRes.headers
          });
        } else {
          console.log('✅ [Proxy] Proxy response:', {
            statusCode: statusCode,
            url: req.url
          });
        }
      },
      onError: (err, req, res) => {
        console.error('❌ [Proxy] Proxy error:', err.message);
        console.error('❌ [Proxy] Request URL:', req.url);
      }
    })
  );
};
