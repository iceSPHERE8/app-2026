// app/admin/views/work-manager.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/app/admin/components/ui/card";
import {
    Plus,
    Image as ImageIcon,
    Upload,
    FileCode,
    Film,
    Trash2,
    Edit3,
    X,
    Link as LinkIcon,
    ExternalLink,
    LayoutTemplate,
    MonitorPlay
} from "lucide-react";

// --- 1. 对齐瀑布流的数据类型 ---
type MediaType = "image" | "video" | "p5" | "glsl" | "3d" | "text";
type RenderMode = "cover" | "direct";
type CategoryType = "project" | "practice" | "cover" | "tool"; // 新增 category 类型

export default function WorkManager({
    type: pageCategory,
    title,
}: {
    type: "all-works" | "tool-lab";
    title: string;
}) {
    const [items, setItems] = useState<any[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState<"content" | "cover" | "video" | "textBg" | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const contentInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const textBgInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        detailLink: "", 
        type: "image" as MediaType,
        category: "project" as CategoryType, // 新增 category 字段
        content: "", 
        coverUrl: "", 
        previewVideoUrl: "", 
        aspectRatio: "aspect-square", 
        renderMode: "cover" as RenderMode,
        textBgUrl: "", 
    });

    const fetchItems = async () => {
        const res = await fetch(`/api/admin/get-data?type=${pageCategory}`);
        if (res.ok) setItems(await res.json());
    };

    useEffect(() => {
        fetchItems();
    }, [pageCategory]);

    const startEdit = (item: any) => {
        setEditingId(item.id);
        setFormData({
            title: item.title || "",
            description: item.description || "",
            detailLink: item.detailLink || "",
            type: item.type || "image",
            category: item.category || "project", // 加载 category 字段
            content: item.content || "",
            coverUrl: item.coverUrl || "",
            previewVideoUrl: item.previewVideoUrl || "",
            aspectRatio: item.aspectRatio || "aspect-square",
            renderMode: item.renderMode || "cover",
            textBgUrl: item.textBgUrl || "",
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setFormData({
            title: "",
            description: "",
            detailLink: "",
            type: "image",
            category: "project", // 重置 category 字段
            content: "",
            coverUrl: "",
            previewVideoUrl: "",
            aspectRatio: "aspect-square",
            renderMode: "cover",
            textBgUrl: "",
        });
    };

    const handleSave = async () => {
        const res = await fetch("/api/admin/save-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: pageCategory, data: formData, id: editingId }),
        });
        if (res.ok) {
            closeForm();
            fetchItems();
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("该操作将永久删除云端媒体文件和记录，确定吗？");
        if (!confirmed) return;

        setDeletingId(id);
        try {
            const res = await fetch("/api/admin/delete-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: pageCategory, id }),
            });
            if (res.ok) {
                setItems((prev) => prev.filter((item) => item.id !== id));
            } else {
                alert("删除失败");
            }
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setDeletingId(null);
        }
    };

    const onUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "content" | "cover" | "video" | "textBg"
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(field);
        const body = new FormData();
        body.append("file", file);

        try {
            const res = await fetch("/api/admin/upload-media", {
                method: "POST",
                body,
            });
            const result = await res.json();

            if (result.success) {
                if (field === "content") {
                    setFormData((prev) => ({ ...prev, content: result.url }));
                } else if (field === "cover") {
                    setFormData((prev) => ({ ...prev, coverUrl: result.url }));
                } else if (field === "video") {
                    setFormData((prev) => ({ ...prev, previewVideoUrl: result.url }));
                } else if (field === "textBg") {
                    setFormData((prev) => ({ ...prev, textBgUrl: result.url }));
                }
            }
        } finally {
            setUploading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                {!isFormOpen && (
                    <button
                        type="button"
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-all"
                    >
                        <Plus className="h-4 w-4" /> 新建项目
                    </button>
                )}
            </div>

            {isFormOpen && (
                <Card className="border-2 border-primary/20 shadow-xl bg-card/50 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <CardTitle className="text-xl font-bold">
                            {editingId ? "编辑作品属性" : "上传新作品"}
                        </CardTitle>
                        <button type="button" onClick={closeForm} className="hover:rotate-90 transition-transform">
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </CardHeader>
                    
                    <CardContent className="space-y-6 pt-6">
                        {/* --- 基础设置 --- */}
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2 md:col-span-1">
                                <label className="text-sm font-medium">作品类型 (Media Type)</label>
                                <select
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 outline-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as MediaType, content: "" })}
                                >
                                    <option value="image">Image (图片)</option>
                                    <option value="video">Video (视频)</option>
                                    <option value="3d">3D Model / WebGL</option>
                                    <option value="glsl">GLSL Shader</option>
                                    <option value="p5">P5.js</option>
                                    <option value="text">Typography (纯文本)</option>
                                </select>
                            </div>
                            
                            <div className="space-y-2 md:col-span-1">
                                <label className="text-sm font-medium">瀑布流卡片比例 (Aspect Ratio)</label>
                                <select
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 outline-none"
                                    value={formData.aspectRatio}
                                    onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value })}
                                >
                                    <option value="aspect-square">1:1 (Square)</option>
                                    <option value="aspect-video">16:9 (Landscape)</option>
                                    <option value="aspect-[3/4]">3:4 (Portrait)</option>
                                    <option value="aspect-[4/5]">4:5 (Instagram)</option>
                                    <option value="aspect-[2/1]">2:1 (Wide)</option>
                                    <option value="aspect-auto">Auto (自适应原始比例)</option>
                                </select>
                            </div>

                            {/* --- 新增分类属性选框 --- */}
                            <div className="space-y-2 md:col-span-1">
                                <label className="text-sm font-medium">作品分类 (Category)</label>
                                <select
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 outline-none"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
                                >
                                    <option value="project">Project (项目)</option>
                                    <option value="practice">Practice (练习)</option>
                                    <option value="cover">Cover (封面)</option>
                                    <option value="tool">Tool (工具)</option>
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-1">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <LinkIcon className="h-3 w-3" /> 详情页链接 (Detail Link)
                                </label>
                                <input
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 outline-none"
                                    placeholder="/project/my-work"
                                    value={formData.detailLink}
                                    onChange={(e) => setFormData({ ...formData, detailLink: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* --- 主内容区 (动态切换) --- */}
                        <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-muted">
                            <label className="text-sm font-semibold text-primary/80 flex items-center gap-2">
                                <LayoutTemplate className="h-4 w-4" /> 主体内容 (Main Source)
                            </label>
                            
                            {(formData.type === "image" || formData.type === "video") && (
                                <div
                                    onClick={() => contentInputRef.current?.click()}
                                    className="border-2 border-dotted rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all group min-h-[120px]"
                                >
                                    {formData.content ? (
                                        <div className="flex items-center gap-3 text-green-600">
                                            {formData.type === "video" ? <Film /> : <ImageIcon />}
                                            <span className="font-medium text-sm">已上传主媒体资源</span>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <p className="text-sm text-muted-foreground">点击上传 {formData.type === "image" ? "图片" : "视频"} 文件</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={contentInputRef}
                                        className="hidden"
                                        onChange={(e) => onUpload(e, "content")}
                                        accept={formData.type === "image" ? "image/*" : "video/*"}
                                    />
                                </div>
                            )}

                            {(formData.type === "3d" || formData.type === "glsl" || formData.type === "p5") && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <input
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 outline-none font-mono"
                                            placeholder="输入外链 URL (例如 CodeSandbox 或 ShaderToy 链接)"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2 pt-2 border-t border-muted/50">
                                        <label className="text-sm font-medium flex items-center gap-1.5 text-primary">
                                            <MonitorPlay className="h-4 w-4" /> 瀑布流渲染模式 (Render Mode)
                                        </label>
                                        <select
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 outline-none"
                                            value={formData.renderMode}
                                            onChange={(e) => setFormData({ ...formData, renderMode: e.target.value as RenderMode })}
                                        >
                                            <option value="cover">轻量优先：显示封面/视频，悬停或点击时才激活渲染 (推荐)</option>
                                            <option value="direct">直接渲染：瀑布流中直接加载 iframe (吃显存，仅重点展示使用)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {formData.type === "text" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <textarea
                                            className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 outline-none font-heading uppercase"
                                            placeholder="输入要显示的标语或文字内容..."
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2 pt-2 border-t border-muted/50">
                                        <label className="text-sm font-medium flex items-center gap-1.5">
                                            <ImageIcon className="h-4 w-4" /> 文字背景图 (可选)
                                        </label>
                                        <div
                                            onClick={() => textBgInputRef.current?.click()}
                                            className="border-2 border-dotted rounded-xl p-4 text-center cursor-pointer hover:bg-primary/5 transition-all"
                                        >
                                            <p className="text-xs font-medium">
                                                {formData.textBgUrl ? "✅ 文字背景图已上传" : "点击上传背景图片 (营造氛围)"}
                                            </p>
                                            <input
                                                type="file"
                                                ref={textBgInputRef}
                                                className="hidden"
                                                onChange={(e) => onUpload(e, "textBg")}
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {formData.type !== "text" && (
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-primary/80">瀑布流封面资产 (可选，增强体验)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        onClick={() => coverInputRef.current?.click()}
                                        className="border-2 border-dotted rounded-xl p-6 text-center cursor-pointer hover:bg-primary/5 transition-all"
                                    >
                                        <ImageIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-xs font-medium">
                                            {formData.coverUrl ? "✅ 静态封面已就绪" : "上传瀑布流静态封面 (图片)"}
                                        </p>
                                        <input
                                            type="file"
                                            ref={coverInputRef}
                                            className="hidden"
                                            onChange={(e) => onUpload(e, "cover")}
                                            accept="image/*"
                                        />
                                    </div>
                                    <div
                                        onClick={() => videoInputRef.current?.click()}
                                        className="border-2 border-dotted rounded-xl p-6 text-center cursor-pointer hover:bg-primary/5 transition-all"
                                    >
                                        <Film className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-xs font-medium">
                                            {formData.previewVideoUrl ? "✅ 悬停预览视频已就绪" : "上传悬停预览 (视频)"}
                                        </p>
                                        <input
                                            type="file"
                                            ref={videoInputRef}
                                            className="hidden"
                                            onChange={(e) => onUpload(e, "video")}
                                            accept="video/*"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-1">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">作品标题</label>
                                <input
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 outline-none"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">简要描述</label>
                                <textarea
                                    className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 outline-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!!uploading}
                            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-bold hover:shadow-lg hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            {uploading ? "资源上传中..." : editingId ? "保存更改" : "发布到本地库"}
                        </button>
                    </CardContent>
                </Card>
            )}

            {/* --- 列表显示视图 --- */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((item) => {
                    // 推导出一个视频封面来源，用于兜底
                    const videoFrameUrl = (item.type === 'video' && item.content) ? item.content : item.previewVideoUrl;

                    return (
                        <Card
                            key={item.id}
                            className="group overflow-hidden border-muted bg-card hover:shadow-2xl transition-all duration-500 relative"
                        >
                            {/* 媒体预览层：修改为 aspect-square (1:1正方形) 并且加上相对定位 */}
                            <div className="w-full aspect-square bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                                
                                {item.type === 'text' ? (
                                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center z-10">
                                        {item.textBgUrl && (
                                            <div 
                                                className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
                                                style={{ backgroundImage: `url(${item.textBgUrl})` }}
                                            />
                                        )}
                                        <div className="relative z-10 text-white font-heading font-black uppercase text-lg leading-tight">
                                            {item.content || "NO TEXT"}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* 底层兜底占位图 */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 bg-zinc-900">
                                            {item.type === '3d' || item.type === 'glsl' || item.type === 'p5' ? (
                                                <FileCode className="h-8 w-8 mb-2" />
                                            ) : <ImageIcon className="h-8 w-8 mb-2" />}
                                            <span className="text-[10px] uppercase tracking-widest font-bold">NO COVER</span>
                                        </div>

                                        {/* 1. 直接渲染模式占位 */}
                                        {item.renderMode === 'direct' && (item.type === '3d' || item.type === 'glsl' || item.type === 'p5') ? (
                                            <div className="absolute inset-0 text-green-400 bg-black/80 flex flex-col items-center justify-center font-mono text-xs z-10">
                                                <MonitorPlay className="h-6 w-6 mb-2" />
                                                [ DIRECT RENDER ]
                                            </div>
                                        ) : 
                                        /* 2. 优先显示手动上传的 Cover */
                                        item.coverUrl ? (
                                            // 注意这里的 absolute inset-0 w-full h-full object-cover 是干掉白边的核心
                                            <img src={item.coverUrl} className="absolute inset-0 object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-all duration-500 z-10" />
                                        ) : 
                                        /* 3. 是图片但没封面，拿原图撑满 */
                                        item.type === 'image' && item.content ? (
                                            <img src={item.content} className="absolute inset-0 object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-all duration-500 z-10" />
                                        ) : 
                                        /* 4. 【新增】没有封面，但是有视频 URL 时，截取第一帧撑满 */
                                        videoFrameUrl ? (
                                            <video 
                                                src={`${videoFrameUrl}#t=0.1`} // 核心魔法：#t=0.1 获取第一帧
                                                preload="metadata"
                                                className="absolute inset-0 object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-all duration-500 z-10"
                                            />
                                        ) : null}

                                        {/* 悬停视频 (只有在不是 direct 模式才悬停播放) */}
                                        {item.previewVideoUrl && item.renderMode !== 'direct' && (
                                            <video
                                                src={item.previewVideoUrl}
                                                className="absolute inset-0 object-cover w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                                                muted loop playsInline
                                                onMouseEnter={(e) => e.currentTarget.play()}
                                                onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                            />
                                        )}
                                    </>
                                )}
                                
                                {/* 左上角类型标签 (调整层级 z-30 确保显示在最上方) */}
                                <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm font-mono text-white/80 uppercase flex items-center gap-1.5 z-30 pointer-events-none">
                                    {item.type}
                                    {item.renderMode === 'direct' && (item.type === '3d' || item.type === 'glsl' || item.type === 'p5') && (
                                        <span className="text-green-400">● Live</span>
                                    )}
                                </span>
                            </div>

                            {/* 悬浮操作层 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-40">
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button 
                                        type="button"
                                        title="编辑作品"
                                        onClick={() => startEdit(item)} 
                                        className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all shadow-xl"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button 
                                        type="button"
                                        title="删除作品"
                                        onClick={() => handleDelete(item.id)} 
                                        disabled={deletingId === item.id} 
                                        className={`p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white transition-all shadow-xl ${deletingId === item.id ? "opacity-50 cursor-not-allowed" : "hover:bg-red-500"}`}
                                    >
                                        {deletingId === item.id ? (
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : <Trash2 className="h-4 w-4" />}
                                    </button>
                                </div>
                                
                                <h3 className="font-bold text-white text-base truncate mb-1">
                                    {item.title || "Untitled"}
                                </h3>
                                {item.detailLink && (
                                    <a href={item.detailLink} target="_blank" className="inline-flex items-center gap-1 text-[10px] font-bold text-white/70 hover:text-green-400 transition-colors uppercase tracking-widest">
                                        View Detail Page <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}