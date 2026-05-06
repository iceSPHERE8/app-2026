"use client";

import { useState, useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/app/admin/components/ui/card";
import { Button } from "@/app/admin/components/ui/button";
import { AspectRatio } from "@/app/admin/components/ui/aspect-ratio";
import { Progress } from "@/app/admin/components/ui/progress";
import { Upload, X, Save, Settings2, Trash2 } from "lucide-react";

interface ParticleTexture {
    id: string;
    url: string;
    isLocal?: boolean; // 标识是否为新选择但未上传的文件
    file?: File;
}

interface ParticleConfig {
    textures: ParticleTexture[];
    // --- 粒子参数区 ---
    count: number; // 粒子总数
    speed: number; // 移动速度
    // 在此处添加新参数的类型定义，例如:
    // color: string;   // 粒子颜色
}

export default function HomeSettingsView() {
    const [config, setConfig] = useState<ParticleConfig>({
        textures: [],
        count: 5000,
        speed: 1.0,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. 初始化加载
    useEffect(() => {
        const loadConfig = async () => {
            const res = await fetch("/api/admin/get-data?type=particle-config");
            if (res.ok) {
                const data = await res.json();
                // 兼容处理：如果文件不存在返回的是空数组，则使用默认值
                if (!Array.isArray(data)) setConfig(data);
            }
        };
        loadConfig();
    }, []);

    // 2. 处理纹理选择 (本地预览)
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        const newTexture: ParticleTexture = {
            id: Date.now().toString(),
            url: localUrl,
            isLocal: true,
            file: file,
        };

        setConfig((prev) => ({
            ...prev,
            textures: [...prev.textures, newTexture],
        }));
    };

    // 3. 删除纹理 (物理删除建议在保存时统一处理或单独出接口)
    const removeTexture = (id: string) => {
        setConfig((prev) => {
            const texture = prev.textures.find((t) => t.id === id);
            if (texture?.url.startsWith("blob:"))
                URL.revokeObjectURL(texture.url);
            return {
                ...prev,
                textures: prev.textures.filter((t) => t.id !== id),
            };
        });
    };

    // 4. 执行上传与保存
    const handleSave = async () => {
        setIsSaving(true);
        setUploadProgress(0);

        try {
            const finalTextures = [...config.textures];

            // 批量上传新增的纹理
            for (let i = 0; i < finalTextures.length; i++) {
                const tex = finalTextures[i];
                if (tex.isLocal && tex.file) {
                    const formData = new FormData();
                    formData.append("file", tex.file);

                    const res = await fetch("/api/admin/upload-media", {
                        method: "POST",
                        body: formData,
                    });
                    const result = await res.json();

                    if (result.success) {
                        finalTextures[i] = { id: tex.id, url: result.url }; // 替换为服务器路径
                        URL.revokeObjectURL(tex.url); // 释放内存
                    }
                }
            }

            const payload = { ...config, textures: finalTextures };

            const res = await fetch("/api/admin/save-particle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: payload }),
            });

            if (res.ok) {
                setConfig(payload);
                alert("粒子配置已同步至本地 data 文件夹");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="max-w-4xl space-y-6">
            {/* 纹理管理卡片 */}
            <Card className="border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>粒子纹理管理</CardTitle>
                        <CardDescription>
                            建议使用 128x128 像素的透明白色 PNG
                        </CardDescription>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="gap-2"
                    >
                        <Save className="h-4 w-4" />{" "}
                        {isSaving ? "上传中..." : "保存配置"}
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {config.textures.map((texture) => (
                            <div
                                key={texture.id}
                                className="group relative rounded-md border p-1 bg-slate-950 overflow-hidden"
                            >
                                <AspectRatio ratio={1 / 1}>
                                    <img
                                        src={texture.url}
                                        alt="texture"
                                        className="object-contain w-full h-full p-2"
                                    />
                                </AspectRatio>
                                <button
                                    onClick={() => removeTexture(texture.id)}
                                    className="absolute top-2 right-2 p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-red-500"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}

                        <label className="border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors min-h-[100px]">
                            <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                New Texture
                            </span>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png"
                                onChange={handleFileSelect}
                            />
                        </label>
                    </div>
                    {isSaving && (
                        <Progress value={uploadProgress} className="mt-4 h-1" />
                    )}
                </CardContent>
            </Card>

            {/* 参数配置卡片 */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-primary" />
                        <CardTitle>全局渲染参数</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 粒子数量 */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-bold">
                                    粒子数量 (Count)
                                </label>
                                <span className="text-xs font-mono text-primary">
                                    {config.count}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="20000"
                                step="100"
                                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                value={config.count}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        count: parseInt(e.target.value),
                                    })
                                }
                            />
                        </div>

                        {/* 移动速度 */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-bold">
                                    基准速度 (Speed)
                                </label>
                                <span className="text-xs font-mono text-primary">
                                    {config.speed.toFixed(1)}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="5.0"
                                step="0.1"
                                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                value={config.speed}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        speed: parseFloat(e.target.value),
                                    })
                                }
                            />
                        </div>

                        {/* 
                            [扩展注释格式]
                            如需添加新参数 (例如颜色 Color):
                            1. 在上方 ParticleConfig 接口添加: color: string;
                            2. 在 setConfig 初始化状态添加默认值: color: '#ffffff'
                            3. 在下方添加对应的 Input 元素:
                            <div className="space-y-2">
                                <label className="text-sm font-bold">颜色 (Color)</label>
                                <input 
                                    type="color" 
                                    value={config.color} 
                                    onChange={(e) => setConfig({...config, color: e.target.value})}
                                />
                            </div>
                        */}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
