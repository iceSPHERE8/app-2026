// app/admin/views/analytics.tsx
"use client"

import * as React from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/app/admin/components/ui/card"
import { ChartAreaInteractive } from "@/app/admin/components/ui/chart-area-interactive"
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend 
} from "recharts"
import { 
  Eye, 
  Download, 
  Link, 
  Clock, 
  Globe, 
  Circle, 
  TrendingUp, 
  Activity, 
  MousePointerClick 
} from "lucide-react"
import { cn } from "@/lib/utils"

// --- 模拟数据配置 ---

const liveLogs = [
  { id: 1, event: "简历下载", location: "北京", time: "刚刚", variant: "default" },
  { id: 2, event: "查看 3D 粒子项目", location: "上海", time: "2m前", variant: "muted" },
  { id: 3, event: "从 LinkedIn 跳转", location: "伦敦", time: "5m前", variant: "muted" },
  { id: 4, event: "查看作品集列表", location: "旧金山", time: "12m前", variant: "muted" },
  { id: 5, event: "简历下载", location: "杭州", time: "18m前", variant: "default" },
]

const workDetailData = [
  { name: "3D粒子效果", clicks: 450, duration: 180 },
  { name: "AI编辑器", clicks: 380, duration: 320 },
  { name: "摄影作品集", clicks: 520, duration: 90 },
  { name: "移动端App", clicks: 290, duration: 210 },
  { name: "Shader实验室", clicks: 150, duration: 450 },
]

const geoData = [
  { name: "中国", value: 65, fill: "#cfcfcf" },
  { name: "美国", value: 20, fill: "#aeaeae" },
  { name: "欧洲", value: 10, fill: "#525252" },
  { name: "其他", value: 5, fill: "hsl(var(--muted))" },
]

// --- 组件定义 ---

export default function AnalyticsView() {
  return (
    <div className="space-y-6 pb-8">
      {/* 1. 核心指标卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="总浏览量" value="45,231" icon={Eye} trend="+12.5%" />
        <MetricCard title="作品总点击" value="12,402" icon={MousePointerClick} trend="+18.2%" />
        <MetricCard title="人均停留" value="4m 32s" icon={Clock} trend="+10.1%" />
        <MetricCard title="简历下载" value="128" icon={Download} trend="+25.2%" isImportant />
      </div>

      {/* 2. 主视图区域：趋势图 + 实时日志 */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:space-y-0 border-b pb-6">
            <div className="grid flex-1 gap-1">
              <CardTitle>访问流量趋势</CardTitle>
              <CardDescription>最近 30 天的全平台访客行为轨迹</CardDescription>
            </div>
            <div className="flex flex-row items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[0.70rem] uppercase text-muted-foreground font-medium text-right w-full">今日新增</span>
                <div className="flex items-center gap-1 text-green-600">
                  <span className="text-lg font-bold">+1,240</span>
                  <TrendingUp className="h-3 w-3" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4">
            <ChartAreaInteractive />
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">实时访问日志</CardTitle>
              <div className="flex items-center gap-2 text-xs font-medium text-green-500">
                <Activity className="h-3 w-3 animate-pulse" />
                LIVE
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {liveLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 text-sm">
                  <div className={cn(
                    "mt-1.5 h-2 w-2 rounded-full shrink-0",
                    log.variant === "default" ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "bg-muted-foreground/30"
                  )} />
                  <div className="flex flex-1 flex-col gap-1">
                    <p className={cn("font-medium leading-none", log.variant === "default" ? "text-foreground" : "text-muted-foreground")}>
                      {log.event}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" /> {log.location}
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground tabular-nums font-mono">{log.time}</time>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. 作品内容深度分析 (双轴图) */}
      <Card>
        <CardHeader>
          <CardTitle>作品内容深度分析</CardTitle>
          <CardDescription>
            对比点击热度与用户真实停留时间，识别高价值作品内容
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={workDetailData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tick={{fill: 'hsl(var(--muted-foreground))'}}
              />
              <YAxis 
                yAxisId="left"
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tick={{fill: 'hsl(var(--muted-foreground))'}}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tick={{fill: 'hsl(var(--muted-foreground))'}}
                unit="s"
              />
              <RechartsTooltip 
                cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                contentStyle={{ borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
              />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Bar 
                yAxisId="left"
                dataKey="clicks" 
                name="点击次数" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
                barSize={40} 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="duration" 
                name="平均时长" 
                stroke="#efefef" 
                strokeWidth={3}
                dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 4. 地理分布 + 系统状态 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>地理位置分布</CardTitle>
            <CardDescription>全球访客地域来源比例</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center sm:flex-row pb-8">
            <div className="h-[200px] w-full max-w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geoData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {geoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="hsl(var(--background))" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid flex-1 grid-cols-2 gap-x-8 gap-y-4 sm:mt-0 sm:ml-8">
              {geoData.map((item) => (
                <div key={item.name} className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-semibold">
                    <Circle className="h-2 w-2" style={{ fill: item.fill, color: item.fill }} />
                    {item.name}
                  </span>
                  <span className="text-xl font-bold tabular-nums">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统健康度</CardTitle>
            <CardDescription>云端部署及性能监测状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">CDN 节点缓存命中率</span>
                <span className="font-bold font-mono">98.2%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: '98.2%' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50">
                <p className="text-[0.70rem] uppercase text-muted-foreground font-bold tracking-wider">API 响应</p>
                <p className="text-2xl font-bold font-mono mt-1">24ms</p>
              </div>
              <div className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50">
                <p className="text-[0.70rem] uppercase text-muted-foreground font-bold tracking-wider">SSL 状态</p>
                <div className="flex items-center gap-2 mt-1">
                   <div className="h-2 w-2 rounded-full bg-green-500" />
                   <p className="text-xl font-bold">正常</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- 辅助小组件 ---

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  isImportant = false 
}: { 
  title: string, 
  value: string, 
  icon: any, 
  trend: string, 
  isImportant?: boolean 
}) {
  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      isImportant && "border-primary/50 bg-primary/[0.01] shadow-sm shadow-primary/10"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", isImportant && "text-primary")} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <span className={trend.startsWith('+') ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {trend}
          </span> 
          <span>较上月</span>
        </p>
      </CardContent>
    </Card>
  )
}