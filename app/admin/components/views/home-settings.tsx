// app/admin/views/home-settings.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/admin/components/ui/card"
import { Button } from "@/app/admin/components/ui/button"
import { AspectRatio } from "@/app/admin/components/ui/aspect-ratio"
import { Upload, X } from "lucide-react"

export default function HomeSettingsView() {
  const textures = [
    { id: 1, url: "/textures/star.png" },
    { id: 2, url: "/textures/circle.png" },
    { id: 3, url: "/textures/dust.png" },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>粒子纹理管理</CardTitle>
          <CardDescription>管理首页背景粒子效果所使用的纹理图片 (建议使用透明 PNG)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {textures.map((texture) => (
              <div key={texture.id} className="group relative rounded-md border p-1 bg-slate-950">
                <AspectRatio ratio={1 / 1}>
                  <img src={texture.url} alt="texture" className="object-contain w-full h-full p-2" />
                </AspectRatio>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            <label className="border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors min-h-[120px]">
              <Upload className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">上传新纹理</span>
              <input type="file" className="hidden" accept="image/*" />
            </label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>全局粒子参数</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground italic">此处可扩展粒子数量、速度、颜色等配置表单...</p>
        </CardContent>
      </Card>
    </div>
  )
}