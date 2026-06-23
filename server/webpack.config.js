const path = require('path')
const Dotenv = require('dotenv-webpack')
const nodeExternals = require('webpack-node-externals')

module.exports = {
    mode: 'production',
    entry: './index.js',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'build.js'
    },
    externals: [nodeExternals()],
    plugins: [
        new Dotenv({
            path: './.env',
            systemvars: true,
            silent: true,
            allowEmptyValues: true
        })
    ]
};