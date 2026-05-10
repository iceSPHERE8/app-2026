import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    turbopack: {
        rules: {
            // 匹配 glsl, vert, frag 等文件扩展名
            "*.{glsl,vert,frag}": {
                loaders: ["raw-loader"],
                as: "*.js", // 告诉 Turbopack 将结果视为 JS 模块处理
            },
        },
    },
};

export default nextConfig;
