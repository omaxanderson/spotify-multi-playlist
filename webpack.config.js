const path = require('path');
const glob = require('glob');

const entries = () => {
   let entries = {};

   glob.sync('src/*.js').map(f => `./${f}`).forEach(f => {
      const m = f.match(/\/([^\/]+)\.js$/);
      console.log(m);
      entries[m[1]] = [f];
   });

   return entries;
}

module.exports = {
   mode: 'development',
   entry: entries(),
   module: {
      rules: [
         {
            exclude: /node_modules/,
            use: {
               loader: 'babel-loader',
               options: {
                  presets: ['@babel/react'],
                  plugins: [
                     "@babel/plugin-syntax-object-rest-spread",
                     "@babel/plugin-proposal-class-properties",
                     "@babel/plugin-syntax-dynamic-import",
                     "babel-plugin-dynamic-import-node"
                  ],
               },
            },
         }
      ],
   },
   output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
   },
   node: {
      fs: 'empty',
      console: true,
   },
   performance: {
      hints: false,
   },
   devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 9000,
   },
};
