import { Plugin } from 'chart.js';
import { Point } from '../models/point.model';

export const glowTrailPlugin: Plugin = {
  id: 'glowTrail',
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 20;
  },
  afterDraw: (chart) => {
    chart.ctx.restore();
  }
};

export const vanShadowPlugin: Plugin = {
  id: 'vanShadow',
  beforeDatasetDraw: (chart, args) => {
    if (args.index === 3) {
      const ctx = chart.ctx;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 6;
    }
  },
  afterDatasetDraw: (chart, args) => {
    if (args.index === 3) {
      chart.ctx.restore();
    }
  }
};

export const getDirectionArrowsPlugin = (getRoute: () => Point[]): Plugin => ({
  id: 'directionArrows',
  afterDraw: (chart) => {
    const route = getRoute();
    if (route.length < 2) return;
    
    const ctx = chart.ctx;
    const xAxis = chart.scales['x'];
    const yAxis = chart.scales['y'];

    ctx.save();
    ctx.fillStyle = '#00ffcc';
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;

    for (let i = 0; i < route.length - 1; i++) {
      const start = route[i];
      const end = route[i + 1];

      const startX = xAxis.getPixelForValue(start.x ?? 0);
      const startY = yAxis.getPixelForValue(start.y ?? 0);
      const endX = xAxis.getPixelForValue(end.x ?? 0);
      const endY = yAxis.getPixelForValue(end.y ?? 0);

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const angle = Math.atan2(endY - startY, endX - startX);
      const arrowSize = 15;

      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-arrowSize, -arrowSize / 2);
      ctx.lineTo(-arrowSize, arrowSize / 2);
      ctx.closePath();
      ctx.fillStyle = '#00ffcc';
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
});