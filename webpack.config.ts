import webpack from "webpack";
import path from "path";
import fs from "fs";
import glob from "glob";

function collectUserScripts() {
  let root = path.resolve(__dirname, "src");
  return Object.fromEntries(glob.sync(root + '/**/*.user.[tj]s').map(f => {
    let relPath = path.relative(root, f)
    let bName = path.basename(path.basename(relPath, '.js'), '.ts')
    let name = `${path.dirname(relPath)}/${bName}`
    return [name, f]
  }))
}

const config: webpack.Configuration = {
  entry: collectUserScripts(),
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: {
        loader: "ts-loader",
        options: {
          transpileOnly: true
        }
      }
    }]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  },
  resolve: {
    modules: [
      "node_modules",
      "src"
    ],
    extensions: [".ts", ".js"],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: (chunk) => {
        let src_path = path.resolve(__dirname, `src/${chunk.chunk.name}.ts`)
        if (!fs.existsSync(src_path)) {
          src_path = path.resolve(__dirname, `src/${chunk.chunk.name}.js`)
        }
        let text = fs.readFileSync(src_path, "utf-8")
          .replace(/(==\/UserScript==)[\s\S]+$/, "$1")
        return text;
      },
      entryOnly: true,
      raw: true
    })
  ]
};

export default config;
