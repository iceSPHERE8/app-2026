"use client"

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    umami: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    }
  }
}

export function useProjectTracker(projectName: string) {
  const startTime = useRef<number>(0)

  useEffect(() => {
    // 1. 组件挂载时：记录开始时间，并发送“点击/打开”事件
    startTime.current = Date.now()
    
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track('查看作品', { project: projectName })
    }

    // 2. 组件卸载时（离开页面或关闭弹窗）：计算停留时长并发送
    const handleLeave = () => {
      const durationInSeconds = Math.round((Date.now() - startTime.current) / 1000)
      
      // 过滤掉误触（比如打开不到 2 秒就关掉的）
      if (typeof window !== 'undefined' && window.umami && durationInSeconds > 2) {
        window.umami.track('作品停留', { 
          project: projectName, 
          duration: durationInSeconds 
        })
      }
    }

    // 监听组件卸载（路由跳转或弹窗关闭）
    return () => {
      handleLeave()
    }
  }, [projectName]) // 依赖项里加上 projectName，防止闭包陷阱
}