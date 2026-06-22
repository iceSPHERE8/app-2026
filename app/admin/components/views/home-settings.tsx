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
import { Upload, Save, Trash2, Star, FileCode, Film, Image as ImageIcon, Link as LinkIcon } from "lucide-react";

// --- 1. 数据类型定义 ---
type MediaType = "image" | "video" | "other";

interface MediaItem {
    id: string;
    url: string;
    title: string;
    type: MediaType;
    isHighlight: boolean;
    isLocal?: boolean; // 标识是否为刚选择但未上传的文件
    file?: File;       // 暂存本地文件对象
}

interface ShowcaseItem {
    id: string;
    title: string;
    detailLink: string;
    type: string;
    category: string;
    // ... 其他属性按需保留
}

export default function ProjectDetailManager() {
    // --- 状态管理 ---
    const [projects, setProjects] = useState<ShowcaseItem[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    
    const [mediaList, setMediaList] = useState<MediaItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- 1. 初始化：加载所有作品列表 ---
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // 获取所有瀑布流作品数据
                const res = await fetch("/api/admin/get-data?type=all-works");
                if (res.ok) {
                    const data: ShowcaseItem[] = await res.json();
                    // 仅过滤出带有 detailLink 或特定分类的作品，这里默认展示所有
                    setProjects(data);
                    
                    // 默认选中第一个
                    if (data.length > 0) {
                        setSelectedProjectId(data[0].id);
                    }
                }
            } catch (error) {
                console.error("加载作品列表失败:", error);
            }
        };
        fetchProjects();
    }, []);

    // --- 2. 监听选中作品变化，加载对应的详情媒体 ---
    useEffect(() => {
        if (!selectedProjectId) return;

        const fetchProjectMedia = async () => {
            setIsLoading(true);
            try {
                // 约定接口：根据 projectId 获取其专属的详情媒体库
                // 实际开发中，如果尚未建此接口，你可以先用 mockData 代替测试
                const res = await fetch(`/api/admin/get-detail-media?projectId=${selectedProjectId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMediaList(Array.isArray(data) ? data : []);
                } else {
                    setMediaList([]); // 未找到则置空
                }
            } catch (error) {
                console.error("加载详情媒体失败:", error);
                setMediaList([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjectMedia();
    }, [selectedProjectId]);

    // --- 3. 处理本地文件选择 ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newItems: MediaItem[] = Array.from(files).map((file) => {
            const isVideo = file.type.startsWith("video/");
            const isImage = file.type.startsWith("image/");
            const type: MediaType = isImage ? "image" : isVideo ? "video" : "other";

            return {
                id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                url: URL.createObjectURL(file), // 本地 Blob 预览链接
                title: file.name,
                type: type,
                isHighlight: false, // 默认归入 Normal
                isLocal: true,
                file: file,
            };
        });

        setMediaList((prev) => [...prev, ...newItems]);
        
        // 清空 input 允许重复选择同名文件
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // --- 4. 交互操作：切换高亮、删除 ---
    const toggleHighlight = (id: string) => {
        setMediaList((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isHighlight: !item.isHighlight } : item
            )
        );
    };

    const removeMedia = (id: string) => {
        setMediaList((prev) => {
            const target = prev.find((m) => m.id === id);
            if (target?.url.startsWith("blob:")) {
                URL.revokeObjectURL(target.url); // 释放内存
            }
            return prev.filter((m) => m.id !== id);
        });
    };

    // --- 5. 执行云端上传与关联保存 ---
    const handleSave = async () => {
        if (!selectedProjectId) return alert("请先选择一个关联作品");
        
        setIsSaving(true);
        setUploadProgress(0);

        try {
            const finalMediaList = [...mediaList];
            let uploadedCount = 0;
            const totalToUpload = finalMediaList.filter(m => m.isLocal).length;

            // 批量上传新增的本地文件
            for (let i = 0; i < finalMediaList.length; i++) {
                const item = finalMediaList[i];
                if (item.isLocal && item.file) {
                    const formData = new FormData();
                    formData.append("file", item.file);

                    const res = await fetch("/api/admin/upload-media", {
                        method: "POST",
                        body: formData,
                    });
                    const result = await res.json();

                    if (result.success) {
                        // 替换为服务器绝对路径，清除本地标记
                        finalMediaList[i] = {
                            ...item,
                            url: result.url,
                            isLocal: false,
                        };
                        delete finalMediaList[i].file;
                        URL.revokeObjectURL(item.url); 
                    }
                    
                    uploadedCount++;
                    setUploadProgress(Math.round((uploadedCount / totalToUpload) * 100));
                }
            }

            // 构建关联数据载荷
            const payload = {
                projectId: selectedProjectId,
                media: finalMediaList,
            };

            // 发送给后端持久化 (例如保存为 detail_media_{projectId}.json)
            const res = await fetch("/api/admin/save-detail-media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setMediaList(finalMediaList);
                alert("详情页资源已成功同步至云端");
            }
        } catch (err) {
            console.error("保存失败:", err);
            alert("保存过程中发生错误，请查看控制台");
        } finally {
            setIsSaving(false);
            setUploadProgress(0);
        }
    };

    // 衍生状态：分组展示
    const highlightItems = mediaList.filter((m) => m.isHighlight);
    const normalItems = mediaList.filter((m) => !m.isHighlight);

    const activeProject = projects.find(p => p.id === selectedProjectId);

    // --- 辅助渲染函数 ---
    const renderMediaPreview = (item: MediaItem) => {
        if (item.type === "image") {
            return <img src={item.url} alt={item.title} className="object-cover w-full h-full" />;
        }
        if (item.type === "video") {
            return <video src={item.url} className="object-cover w-full h-full" muted loop playsInline onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />;
        }
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 text-slate-500">
                <FileCode className="w-8 h-8 mb-2" />
                <span className="text-[10px] uppercase font-mono">{item.title.split('.').pop()}</span>
            </div>
        );
    };

    return (
        <div className="max-w-5xl space-y-6">
            {/* 顶部关联选择器 */}
            <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-muted/30 border-b pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <LinkIcon className="h-5 w-5" /> 作品详情映射库
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                                选择左侧的基础项目，在右侧为其构建详情页的丰富媒体资产。
                            </CardDescription>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <select
                                className="px-4 py-2 rounded-md border bg-background text-sm font-medium focus:ring-2 ring-primary/20 outline-none max-w-62.5 truncate"
                                value={selectedProjectId}
                                title="select project"
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                            >
                                <option value="" disabled>选择一个作品进行关联...</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        [{p.category}] {p.title || '未命名作品'}
                                    </option>
                                ))}
                            </select>

                            <Button onClick={handleSave} disabled={isSaving || !selectedProjectId} className="gap-2 min-w-30">
                                <Save className="h-4 w-4" /> 
                                {isSaving ? "同步中..." : "保存详情资产"}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                    {/* 基础信息回显 */}
                    {activeProject && (
                        <div className="mb-8 p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-mono text-primary uppercase tracking-widest">Active Link Target</p>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {activeProject.detailLink || "⚠️ 当前作品尚未配置前端 Detail Link，请前往主页库配置。"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-mono text-muted-foreground uppercase">Assets Count</p>
                                <p className="text-2xl font-black font-heading">{mediaList.length}</p>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="py-20 text-center text-muted-foreground font-mono animate-pulse">
                            Loading relational data...
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* --- 重点展示区 (Highlights) --- */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        核心高亮资产 (Highlights)
                                    </h3>
                                    <span className="text-xs font-mono text-muted-foreground">{highlightItems.length} items</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {highlightItems.map((item) => (
                                        <div key={item.id} className="group relative rounded-lg border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all">
                                            <AspectRatio ratio={4/3} className="bg-muted">
                                                {renderMediaPreview(item)}
                                            </AspectRatio>
                                            <div className="p-2 border-t bg-background">
                                                <p className="text-[10px] font-mono truncate" title={item.title}>{item.title}</p>
                                            </div>
                                            {/* 悬浮操作栏 */}
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => toggleHighlight(item.id)} className="p-1.5 bg-yellow-500 text-white rounded shadow-lg hover:bg-yellow-600" title="取消高亮">
                                                    <Star className="w-3 h-3 fill-white" />
                                                </button>
                                                <button onClick={() => removeMedia(item.id)} className="p-1.5 bg-red-500 text-white rounded shadow-lg hover:bg-red-600" title="移除资产">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {highlightItems.length === 0 && (
                                        <div className="col-span-full py-8 text-center text-xs text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                                            暂无高亮资产。请从下方图集中点亮星号。
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- 常规展示区 (Normal & Upload) --- */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="text-lg font-bold">常规资产与素材库 (Normal)</h3>
                                    <span className="text-xs font-mono text-muted-foreground">{normalItems.length} items</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {/* 上传入口 */}
                                    <label className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors min-h-35 bg-background">
                                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center px-2">
                                            Upload Media<br/>(Multiple)
                                        </span>
                                        <input
                                            type="file"
                                            multiple
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*,video/*,.json,.glsl,.md"
                                            onChange={handleFileSelect}
                                        />
                                    </label>

                                    {normalItems.map((item) => (
                                        <div key={item.id} className="group relative rounded-lg border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all">
                                            <AspectRatio ratio={1} className="bg-muted">
                                                {renderMediaPreview(item)}
                                            </AspectRatio>
                                            <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 backdrop-blur-sm text-white translate-y-full group-hover:translate-y-0 transition-transform">
                                                <p className="text-[9px] font-mono truncate leading-tight">{item.title}</p>
                                            </div>
                                            {/* 悬浮操作栏 */}
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => toggleHighlight(item.id)} className="p-1.5 bg-black/50 text-white rounded backdrop-blur hover:bg-yellow-500 transition-colors" title="设为核心高亮">
                                                    <Star className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => removeMedia(item.id)} className="p-1.5 bg-black/50 text-white rounded backdrop-blur hover:bg-red-500 transition-colors" title="移除资产">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                            
                                            {/* 本地未保存角标提示 */}
                                            {item.isLocal && (
                                                <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" title="未保存至云端" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 上传进度条 */}
                            {isSaving && uploadProgress > 0 && (
                                <div className="space-y-1 pt-4">
                                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase">
                                        <span>Syncing to Cloud Storage...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-1" />
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}