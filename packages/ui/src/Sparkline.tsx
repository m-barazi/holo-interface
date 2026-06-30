import { useEffect, useRef } from 'react';

export function Sparkline({
  data,
  color = '#22D3EE',
  width = 80,
  height = 24,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c || data.length < 2) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const max = Math.max(...data, 1);
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (v / max) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [data, color, width, height]);

  return <canvas ref={ref} width={width} height={height} aria-hidden="true" />;
}