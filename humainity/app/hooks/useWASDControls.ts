'use client';

import { useRef, useEffect } from 'react';

// useWASDControls Hook - WASD 键盘控制
export function useWASDControls(speed = 0.1) {
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        e.preventDefault(); // 在游戏聚焦时阻止默认行为
        keys.current[key as keyof typeof keys.current] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        e.preventDefault();
        keys.current[key as keyof typeof keys.current] = false;
      }
    };

    // 添加到 document
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    console.log('WASD controls initialized');

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 使用 useRef 保持 speed 的引用，或者直接在计算时传入
  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // 返回一个获取当前移动向量的函数
  return () => {
    const movement = { x: 0, z: 0 };
    const s = speedRef.current;
    
    if (keys.current.w) movement.z -= s;
    if (keys.current.s) movement.z += s;
    if (keys.current.a) movement.x -= s;
    if (keys.current.d) movement.x += s;
    
    return movement;
  };
}

