/** @type {import('next').NextConfig} */

const { version } = require("./package.json")

const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    version,
  },
  webpack: (config) => {
    // load worker files as a urls with `file-loader`
    config.module.rules.unshift({
      test: /pdf\.worker\.(min\.)?js/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "[contenthash].[ext]",
            publicPath: "_next/static/worker",
            outputPath: "static/worker",
          },
        },
      ],
    })
    return config
  },
}

module.exports = nextConfig
