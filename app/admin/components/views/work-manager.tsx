// app/admin/views/work-manager.tsx
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/admin/components/ui/card";
import { Plus, Save, Image as ImageIcon } from "lucide-react";

export default function WorkManager({ type, title }: { type: 'all-works' | 'tool-lab', title: string }) {
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', link: '' });

    const handleSave = async () => {
        const res = await fetch('/api/admin/save-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, data: formData })
        });
        
        if (res.ok) {
            alert("保存成功！数据已存入本地 data 文件夹。");
            setIsAdding(false);
            setFormData({ title: '', description: '', link: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                >
                    <Plus className="h-4 w-4" /> 新建作品
                </button>
            </div>

            {isAdding && (
                <Card className="border-2 border-dashed border-primary/50">
                    <CardHeader>
                        <CardTitle>添加新项目到 {type === 'all-works' ? '作品集' : '实验库'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">作品名称</label>
                            <input 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder="例如: 3D Shader Experiment"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">描述</label>
                            <textarea 
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                placeholder="输入作品的技术细节或设计理念..."
                            />
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            >
                                <Save className="h-4 w-4" /> 确认保存到本地
                            </button>
                            <button 
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-muted-foreground hover:underline"
                            >
                                取消
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <div className="border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                    <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
                    <p className="text-sm">暂无数据，请点击上方“新建”</p>
                </div>
            </div>
        </div>
    );
}