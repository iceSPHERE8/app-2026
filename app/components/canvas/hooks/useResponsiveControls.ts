// hooks/useResponsiveControls.ts
"use client";

import { useState, useEffect } from "react";
import { desktopControls, mobileControls } from "../utils/config";

export function useResponsiveControls() {
  const [controls, setControls] = useState(desktopControls);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 只有在客户端才会执行
    const checkMobile = () => {
      // 768px 是常见的移动端与平板/桌面断点
      if (window.innerWidth < 768) {
        setControls(mobileControls);
      } else {
        setControls(desktopControls);
      }
    };

    // 初始检测
    checkMobile();
    setIsMounted(true);

    // 💡 可选：如果你希望用户在电脑上缩放窗口时也能动态切换，取消下面两行的注释
    // window.addEventListener('resize', checkMobile);
    // return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { controls, isMounted };
}