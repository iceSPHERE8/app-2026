// app/admin/views/work-manager.tsx
"use client";

import React, { useState, useEffect, useRef,useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/app/admin/components/ui/card";
import {
    Plus,
    Save,
    Image as ImageIcon,
    Upload,
    FileCode,
    Film,
    Trash2,
    Edit3,
    X,
    Link as LinkIcon,
    ExternalLink,
} from "lucide-react";

export default function WorkManager({
    type,
    title,
}: {
    type: "all-works" | "tool-lab";
    title: string;
}) {
    const [items, setItems] = useState<any[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState<
        "main" | "cover" | "video" | null
    >(null);

    const [deletingId, setDeletingId] = useState<string | null>(null);

    // 引用不同的文件输入框
    const mainInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        detailLink: "",
        // All Works 使用：主媒体（图/影/模）
        mainMedia: { url: "", type: "image" as "image" | "video" | "model" },
        // Tool Lab 使用：封面 + 可选预览视频
        coverUrl: "",
        previewVideoUrl: "",
    });

    const fetchItems = async () => {
        const res = await fetch(`/api/admin/get-data?type=${type}`);
        if (res.ok) setItems(await res.json());
    };

    useEffect(() => {
        fetchItems();
    }, [type]);

    const startEdit = (item: any) => {
        setEditingId(item.id);
        setFormData({
            title: item.title,
            description: item.description,
            detailLink: item.detailLink || "",
            mainMedia: item.mainMedia || { url: "", type: "image" },
            coverUrl: item.coverUrl || "",
            previewVideoUrl: item.previewVideoUrl || "",
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
            mainMedia: { url: "", type: "image" },
            coverUrl: "",
            previewVideoUrl: "",
        });
    };

    const handleSave = async () => {
        const res = await fetch("/api/admin/save-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, data: formData, id: editingId }),
        });
        if (res.ok) {
            closeForm();
            fetchItems();
        }
    };

    // 删除项目
    const handleDelete = async (id: string) => {
        // 简单的双重确认逻辑，也可以换成标准的 Modal
        const confirmed = window.confirm(
            "该操作将永久删除云端媒体文件和记录，确定吗？",
        );
        if (!confirmed) return;

        setDeletingId(id); // 开启加载状态

        try {
            const res = await fetch("/api/admin/delete-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, id }),
            });

            if (res.ok) {
                // 优化：本地立刻过滤掉，不需要等 fetchItems 返回，体感更快
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
    // 通用上传处理
    const onUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "main" | "cover" | "video",
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
                if (field === "main") {
                    let mediaType: "image" | "video" | "model" = "image";
                    if (file.name.match(/\.(mp4|webm|mov)$/i))
                        mediaType = "video";
                    if (file.name.match(/\.(glb|gltf|obj)$/i))
                        mediaType = "model";
                    setFormData((prev) => ({
                        ...prev,
                        mainMedia: { url: result.url, type: mediaType },
                    }));
                } else if (field === "cover") {
                    setFormData((prev) => ({ ...prev, coverUrl: result.url }));
                } else if (field === "video") {
                    setFormData((prev) => ({
                        ...prev,
                        previewVideoUrl: result.url,
                    }));
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
                            {editingId ? "编辑内容" : "上传新作品"}
                        </CardTitle>
                        <button
                            onClick={closeForm}
                            className="hover:rotate-90 transition-transform"
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* 媒体上传区域：根据类型展示不同逻辑 */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-primary/80">
                                媒体资源管理
                            </label>
                            {type === "all-works" ? (
                                <div
                                    onClick={() =>
                                        mainInputRef.current?.click()
                                    }
                                    className="border-2 border-dotted rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all group min-h-[140px]"
                                >
                                    {formData.mainMedia.url ? (
                                        <div className="flex items-center gap-3 text-green-600">
                                            {formData.mainMedia.type ===
                                            "video" ? (
                                                <Film />
                                            ) : formData.mainMedia.type ===
                                              "model" ? (
                                                <FileCode />
                                            ) : (
                                                <ImageIcon />
                                            )}
                                            <span className="font-medium text-sm text-ellipsis overflow-hidden">
                                                已上传主媒体资源
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <p className="text-sm text-muted-foreground">
                                                上传封面媒体 (支持图片、视频或
                                                3D 模型)
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={mainInputRef}
                                        className="hidden"
                                        onChange={(e) => onUpload(e, "main")}
                                        accept="image/*,video/*,.glb,.gltf"
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Tool Lab 封面 */}
                                    <div
                                        onClick={() =>
                                            coverInputRef.current?.click()
                                        }
                                        className="border-2 border-dotted rounded-xl p-6 text-center cursor-pointer hover:bg-primary/5 transition-all"
                                    >
                                        <ImageIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-xs font-medium">
                                            {formData.coverUrl
                                                ? "✅ 封面图已就绪"
                                                : "上传静态封面 (图片)"}
                                        </p>
                                        <input
                                            type="file"
                                            ref={coverInputRef}
                                            className="hidden"
                                            onChange={(e) =>
                                                onUpload(e, "cover")
                                            }
                                            accept="image/*"
                                        />
                                    </div>
                                    {/* Tool Lab 预览视频 */}
                                    <div
                                        onClick={() =>
                                            videoInputRef.current?.click()
                                        }
                                        className="border-2 border-dotted rounded-xl p-6 text-center cursor-pointer hover:bg-primary/5 transition-all"
                                    >
                                        <Film className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-xs font-medium">
                                            {formData.previewVideoUrl
                                                ? "✅ 预览视频已就绪"
                                                : "上传悬停预览 (视频)"}
                                        </p>
                                        <input
                                            type="file"
                                            ref={videoInputRef}
                                            className="hidden"
                                            onChange={(e) =>
                                                onUpload(e, "video")
                                            }
                                            accept="video/*"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    标题
                                </label>
                                <input
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 outline-none"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <LinkIcon className="h-3 w-3" /> 外部链接 /
                                    详情页路径
                                </label>
                                <input
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 outline-none"
                                    placeholder="/project/my-work"
                                    value={formData.detailLink}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            detailLink: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                简要描述
                            </label>
                            <textarea
                                className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 outline-none"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={!!uploading}
                            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-bold hover:shadow-lg hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            {uploading
                                ? "资源上传中..."
                                : editingId
                                  ? "保存更改"
                                  : "发布到本地库"}
                        </button>
                    </CardContent>
                </Card>
            )}

            {/* 列表显示：差异化渲染 */}
            {/* 列表显示：差异化渲染 */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <Card
                        key={item.id}
                        className="group overflow-hidden border-muted bg-card hover:shadow-2xl transition-all duration-500"
                    >
                        <div className="aspect-video bg-black relative overflow-hidden">
                            {type === "all-works" ? (
                                <div className="w-full h-full">
                                    {/* 增加 item.mainMedia.url 的存在性判断 */}
                                    {item.mainMedia?.url &&
                                        item.mainMedia.type === "image" && (
                                            <img
                                                src={item.mainMedia.url}
                                                className="object-cover w-full h-full opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                                            />
                                        )}
                                    {item.mainMedia?.url &&
                                        item.mainMedia.type === "video" && (
                                            <video
                                                src={item.mainMedia.url}
                                                className="object-cover w-full h-full"
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                            />
                                        )}
                                    {item.mainMedia?.type === "model" && (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-orange-400 bg-zinc-900">
                                            <FileCode className="h-10 w-10 mb-2" />
                                            <span className="text-[10px] uppercase tracking-widest font-bold">
                                                3D Asset
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-full relative">
                                    {/* 核心修复：只有在 coverUrl 有值时才渲染 img 标签 */}
                                    {item.coverUrl ? (
                                        <img
                                            src={item.coverUrl}
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        /* 占位图：防止空 src 报错，同时维持 UI 统一 */
                                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                            <span className="text-zinc-700 text-[10px] uppercase tracking-widest">
                                                No Preview
                                            </span>
                                        </div>
                                    )}

                                    {/* 同样对预览视频进行存在性检查 */}
                                    {item.previewVideoUrl && (
                                        <video
                                            src={item.previewVideoUrl}
                                            className="absolute inset-0 object-cover w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            muted
                                            loop
                                            playsInline
                                            onMouseEnter={(e) =>
                                                e.currentTarget.play()
                                            }
                                            onMouseLeave={(e) => {
                                                e.currentTarget.pause();
                                                e.currentTarget.currentTime = 0;
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* 操作层 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button
                                        onClick={() => startEdit(item)}
                                        className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all shadow-xl"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        disabled={deletingId === item.id}
                                        className={`p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white transition-all shadow-xl
        ${deletingId === item.id ? "opacity-50 cursor-not-allowed" : "hover:bg-red-500"}`}
                                    >
                                        {deletingId === item.id ? (
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-bold uppercase tracking-tighter text-muted-foreground">
                                    {type.replace("-", " ")}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] mb-4">
                                {item.description}
                            </p>
                            {item.detailLink && (
                                <a
                                    href={item.detailLink}
                                    target="_blank"
                                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary hover:gap-2 transition-all uppercase tracking-widest border-b border-primary/20 pb-0.5"
                                >
                                    View Project{" "}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
