import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

import "./TrajectoryCanvas.css";

// 定义坐标点类型
export interface Point {
  x: number;
  y: number;
  timestamp: number;
}

// 组件属性类型
interface TrajectoryCanvasProps {
  size?: number;
  duration?: number;
  pointColor?: string;
  // 必需属性：通过props传入点数组
  points: Point[];
  // 回调函数
  onPointsChange: (points: Point[]) => void;
  onAddPoint?: (point: Point) => void;
  onClearPoints?: () => void;
}

// 组件暴露给父组件的方法
export interface TrajectoryCanvasRef {
  addPoint: (x: number, y: number) => void;
  clearPoints: () => void;
  getPoints: () => Point[];
}

const TrajectoryCanvas = forwardRef<TrajectoryCanvasRef, TrajectoryCanvasProps>(
  function TrajectoryCanvas(
    {
      size = 800,
      duration = 5000,
      pointColor = "#ef4444",
      points = [],
      onPointsChange,
      onAddPoint,
      onClearPoints,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    // 清理过期的点
    const cleanupOldPoints = useCallback(
      (currentPoints: Point[]): Point[] => {
        const now = Date.now();
        return currentPoints.filter((point) => now - point.timestamp <= duration);
      },
      [duration],
    );

    // 添加点的方法
    const addPoint = useCallback(
      (x: number, y: number) => {
        if (x < 0 || x > size || y < 0 || y > size) {
          console.warn(`坐标必须在画布范围内 (0-${size}, 0-${size})`);
          return;
        }

        const newPoint: Point = {
          x,
          y,
          timestamp: Date.now(),
        };
        onAddPoint?.(newPoint);

        const updatedPoints = [...points, newPoint];
        onPointsChange(cleanupOldPoints(updatedPoints));
      },
      [size, points, onPointsChange, onAddPoint, cleanupOldPoints],
    );

    // 清空点的方法
    const clearPoints = useCallback(() => {
      onClearPoints?.();
      onPointsChange([]);
    }, [onPointsChange, onClearPoints]);

    // 获取当前所有点的方法
    const getPoints = useCallback((): Point[] => {
      return [...points];
    }, [points]);

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        addPoint,
        clearPoints,
        getPoints,
      }),
      [addPoint, clearPoints, getPoints],
    );

    // 绘制轨迹到画布
    const drawTrajectory = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      // 清除画布
      ctx.clearRect(0, 0, size, size);

      // 画坐标尺
      ctx.beginPath();
      ctx.moveTo(0, size / 2);
      ctx.lineTo(size, size / 2);
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size / 2, size);
      ctx.moveTo(size * 0.625, size / 2);
      ctx.arc(size / 2, size / 2, size * 0.125, 0, Math.PI * 2, true);
      ctx.moveTo(size * 0.75, size / 2);
      ctx.arc(size / 2, size / 2, size * 0.25, 0, Math.PI * 2, true);
      ctx.moveTo(size * 0.875, size / 2);
      ctx.arc(size / 2, size / 2, size * 0.375, 0, Math.PI * 2, true);
      ctx.moveTo(size, size / 2);
      ctx.arc(size / 2, size / 2, size * 0.5, 0, Math.PI * 2, true);
      ctx.strokeStyle = "rgba(255, 255, 255, 1)";
      ctx.stroke();

      // 计算时间范围
      const now = Date.now();
      const timeRange = duration;

      // 绘制坐标点（带时间衰减效果）
      points.forEach((point) => {
        const age = now - point.timestamp;
        const opacity = 1.0 - age / timeRange;

        // 绘制点
        ctx.beginPath();
        if (point === points[points.length - 1]) {
          ctx.fillStyle = pointColor;
        } else {
          ctx.fillStyle = `rgba(200, 200, 200, ${opacity})`;
        }
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });

      // 继续动画循环
      animationRef.current = requestAnimationFrame(drawTrajectory);
    }, [points, size, duration, pointColor]);

    // 自动清理过期点（通知父组件）
    useEffect(() => {
      const interval = setInterval(() => {
        const cleanedPoints = cleanupOldPoints(points);
        if (cleanedPoints.length !== points.length) {
          onPointsChange(cleanedPoints);
        }
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }, [points, cleanupOldPoints, onPointsChange]);

    // 动画循环
    useEffect(() => {
      animationRef.current = requestAnimationFrame(drawTrajectory);

      return () => {
        if (animationRef.current != null) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [drawTrajectory]);

    return (
      <div className="trajectory-wrapper">
        <span className="ped-title">G-FORCE</span>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{
            display: "block",
            backgroundColor: "transparent",
            marginTop: 8,
          }}
        />
        <span>4.0G</span>
      </div>
    );
  },
);

export default TrajectoryCanvas;
