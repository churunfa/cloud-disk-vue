module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8888',
                changeOrigin: true,
                secure: true,
                // remove path
                pathRewrite: {
                    '/api': ''
                }
            }
        }
    }
}
