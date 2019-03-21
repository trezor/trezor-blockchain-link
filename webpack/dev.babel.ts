import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import {
    SRC, BUILD, PORT,
} from './constants';

module.exports = {
    watch: true,
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        indexUI: [`${SRC}/ui/index.ui.ts`],
        index: [`${SRC}/index.ts`],
    },
    output: {
        filename: '[name].[hash].ts',
        path: BUILD,
    },
    devServer: {
        contentBase: [
            SRC,
        ],
        hot: false,
        https: false,
        port: PORT,
        stats: 'normal',
        inline: true,
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ],
    },
    resolve: {
        modules: [SRC, 'node_modules'],
        extensions: [ '.tsx', '.ts', '.js' ],
        alias: {
            'ws-browser': `${SRC}/utils/ws.ts`,
        },
    },
    performance: {
        hints: false,
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/^ws$/, 'ws-browser'),
        new HtmlWebpackPlugin({
            chunks: ['indexUI'],
            template: `${SRC}ui/index.html`,
            filename: 'index.html',
            inject: true,
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        // new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
    ],
    node: {
        net: 'empty',
        tls: 'empty',
        dns: 'empty',
    }
};
