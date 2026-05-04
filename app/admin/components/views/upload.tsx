// app/admin/views/upload.tsx
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/app/admin/components/ui/card";
import { Button } from "@/app/admin/components/ui/button";
import { Input } from "@/app/admin/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/app/admin/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function UploadView({ category }: { category: string }) {
    // 模拟数据，实际应从 API 获取
    const items = [
        { id: 1, title: "项目 A", desc: "2024 年度作品", src: "/demo1.jpg" },
        { id: 2, title: "项目 B", desc: "团队协作项目", src: "/demo2.jpg" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold capitalize">
                    {category} 作品列表
                </h2>
                <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" /> 新增作品
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden group">
                        <div className="aspect-video relative overflow-hidden">
                            <img
                                src={item.src}
                                alt={item.title}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                        </div>
                        <CardHeader>
                            <CardTitle>{item.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {item.desc}
                            </p>
                        </CardHeader>
                        <CardFooter className="flex gap-2">
                            <Dialog>
                                <DialogTrigger
                                    nativeButton={false}
                                    render={
                                        <div className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 px-3 cursor-pointer">
                                            <Pencil className="mr-2 h-3 w-3" />
                                            修改
                                        </div>
                                    }
                                ></DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>编辑作品信息</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <Input
                                            placeholder="输入标题"
                                            defaultValue={item.title}
                                        />
                                        <Input
                                            placeholder="输入描述"
                                            defaultValue={item.desc}
                                        />
                                        <Input type="file" />
                                        <Button>保存修改</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
