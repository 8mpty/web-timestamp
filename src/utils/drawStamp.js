/**
 * Draws a date/time/location stamp onto a canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width - canvas width
 * @param {number} height - canvas height
 * @param {string} dateStr - formatted date string
 * @param {string} timeStr - formatted time string
 * @param {string} location - optional location string (empty = omit line)
 */
export function drawStamp(ctx, width, height, dateStr, timeStr, location) {
  const fontSize = Math.round(width * 0.042);
  const paddingX = Math.round(width * 0.025);
  const paddingY = Math.round(height * 0.025);
  const lineHeight = Math.round(fontSize * 1);

  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';

  const lines = location.trim()
    ? [dateStr, timeStr, location.trim()]
    : [dateStr, timeStr];

  ctx.fillStyle = '#ffffff';

  lines.forEach((line, i) => {
    const x = width - paddingX;
    const y = height - paddingY - lineHeight * (lines.length - 1 - i);
    ctx.fillText(line, x, y);
  });
}
