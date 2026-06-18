const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "Content", "Daesseuyo", "Generated", "Videos");
const frameRoot = path.join(outDir, "_frames");
const width = 640;
const height = 360;
const fps = 30;
const seconds = 2.4;
const totalFrames = Math.round(fps * seconds);

const colors = {
  bgTop: [9, 9, 11],
  bgBottom: [24, 24, 27],
  muted: [63, 63, 70],
  line: [228, 228, 231],
  dim: [113, 113, 122],
  primary: [244, 244, 245],
  field: [31, 41, 33],
  dirt: [82, 60, 43],
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function clearDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

function makeFrame() {
  const pixels = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y += 1) {
    const k = y / (height - 1);
    const base = mix(colors.bgTop, colors.bgBottom, k);
    for (let x = 0; x < width; x += 1) setPixel(pixels, x, y, base);
  }
  return pixels;
}

function mix(a, b, k) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ];
}

function setPixel(pixels, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const i = (Math.round(y) * width + Math.round(x)) * 3;
  pixels[i] = color[0];
  pixels[i + 1] = color[1];
  pixels[i + 2] = color[2];
}

function rect(pixels, x, y, w, h, color) {
  for (let yy = Math.max(0, Math.round(y)); yy < Math.min(height, Math.round(y + h)); yy += 1) {
    for (let xx = Math.max(0, Math.round(x)); xx < Math.min(width, Math.round(x + w)); xx += 1) setPixel(pixels, xx, yy, color);
  }
}

function circle(pixels, cx, cy, r, color) {
  const r2 = r * r;
  for (let y = Math.round(cy - r); y <= Math.round(cy + r); y += 1) {
    for (let x = Math.round(cx - r); x <= Math.round(cx + r); x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) setPixel(pixels, x, y, color);
    }
  }
}

function line(pixels, x0, y0, x1, y1, color, thickness = 2) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    circle(pixels, x, y, thickness, color);
  }
}

function polygon(pixels, points, color) {
  const minY = Math.max(0, Math.floor(Math.min(...points.map((p) => p[1]))));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(...points.map((p) => p[1]))));
  for (let y = minY; y <= maxY; y += 1) {
    const hits = [];
    for (let i = 0; i < points.length; i += 1) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) hits.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
    }
    hits.sort((a, b) => a - b);
    for (let i = 0; i < hits.length; i += 2) rect(pixels, hits[i], y, hits[i + 1] - hits[i], 1, color);
  }
}

function drawField(pixels) {
  rect(pixels, 0, 236, width, 124, colors.field);
  polygon(pixels, [[0, 360], [320, 210], [640, 360]], colors.dirt);
  line(pixels, 0, 360, 320, 210, colors.line, 2);
  line(pixels, 640, 360, 320, 210, colors.line, 2);
}

function drawFence(pixels) {
  rect(pixels, 48, 168, 544, 12, colors.muted);
  for (let x = 64; x <= 576; x += 32) line(pixels, x, 168, x, 218, colors.dim, 1);
  rect(pixels, 48, 180, 544, 40, [24, 24, 27]);
  line(pixels, 48, 220, 592, 220, colors.line, 2);
}

function drawUmpire(pixels, progress) {
  const arm = easeOut(progress);
  circle(pixels, 320, 116, 24, colors.primary);
  rect(pixels, 296, 142, 48, 84, colors.primary);
  line(pixels, 306, 170, 242, 156, colors.primary, 8);
  line(pixels, 334, 166, 382 + 30 * arm, 154 - 82 * arm, colors.primary, 8);
  line(pixels, 307, 226, 286, 292, colors.primary, 8);
  line(pixels, 333, 226, 360, 292, colors.primary, 8);
  drawK(pixels, 508, 116, Math.min(1, progress * 1.4));
}

function drawK(pixels, x, y, alpha) {
  const c = mix(colors.bgBottom, colors.primary, alpha);
  line(pixels, x, y, x, y + 116, c, 8);
  line(pixels, x + 8, y + 56, x + 82, y, c, 8);
  line(pixels, x + 8, y + 60, x + 88, y + 116, c, 8);
}

function drawRunner(pixels, x, y, slide) {
  circle(pixels, x + 8, y - 36, 12, colors.primary);
  line(pixels, x, y - 24, x + 42 * slide, y - 4, colors.primary, 8);
  line(pixels, x + 4, y - 18, x - 28, y + 16, colors.primary, 7);
  line(pixels, x + 34 * slide, y - 4, x + 88 * slide, y + 4, colors.primary, 7);
  line(pixels, x + 18, y - 16, x + 52, y - 28, colors.primary, 6);
}

function drawHomePlate(pixels) {
  polygon(pixels, [[520, 268], [560, 286], [548, 324], [492, 324], [480, 286]], colors.line);
  polygon(pixels, [[524, 276], [552, 288], [542, 316], [498, 316], [488, 288]], colors.bgBottom);
}

function easeOut(t) {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
}

function writeFrame(dir, index, pixels) {
  const header = Buffer.from(`P6\n${width} ${height}\n255\n`);
  fs.writeFileSync(path.join(dir, `frame_${String(index).padStart(3, "0")}.ppm`), Buffer.concat([header, pixels]));
}

function renderScene(name, draw) {
  const dir = path.join(frameRoot, name);
  clearDir(dir);
  for (let i = 0; i < totalFrames; i += 1) {
    const t = i / (totalFrames - 1);
    const pixels = makeFrame();
    draw(pixels, t);
    writeFrame(dir, i, pixels);
  }
  return dir;
}

function encode(name, dir) {
  const webm = path.join(outDir, `${name}.webm`);
  const mp4 = path.join(outDir, `${name}.mp4`);
  execFileSync("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-framerate",
    String(fps),
    "-i",
    path.join(dir, "frame_%03d.ppm"),
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "1M",
    "-pix_fmt",
    "yuv420p",
    webm,
  ], { stdio: "inherit" });
  execFileSync("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-framerate",
    String(fps),
    "-i",
    path.join(dir, "frame_%03d.ppm"),
    "-c:v",
    "libx264",
    "-crf",
    "24",
    "-pix_fmt",
    "yuv420p",
    mp4,
  ], { stdio: "inherit" });
}

function main() {
  ensureDir(outDir);
  clearDir(frameRoot);

  const scenes = {
    homer: renderScene("homer", (pixels, t) => {
      drawField(pixels);
      drawFence(pixels);
      const k = easeOut(t);
      const x = 88 + 442 * k;
      const y = 236 - 168 * Math.sin(k * Math.PI * 0.9);
      line(pixels, 88, 236, x, y, colors.primary, 2);
      circle(pixels, x, y, 7, colors.primary);
      line(pixels, 78, 258, 138, 212, colors.line, 5);
    }),
    strikeout: renderScene("strikeout", (pixels, t) => {
      drawField(pixels);
      drawUmpire(pixels, t);
      rect(pixels, 254, 88, 132, 104, [9, 9, 11]);
      rect(pixels, 260, 94, 120, 92, colors.muted);
      rect(pixels, 266, 100, 108, 80, colors.bgBottom);
      circle(pixels, 320, 140, 7, colors.primary);
    }),
    score: renderScene("score", (pixels, t) => {
      drawField(pixels);
      drawHomePlate(pixels);
      const k = easeOut(t);
      drawRunner(pixels, 70 + 390 * k, 282, k);
      line(pixels, 66, 316, 548, 316, colors.dim, 2);
      circle(pixels, 538, 296, 7 + 8 * Math.max(0, k - 0.74), colors.primary);
    }),
  };

  for (const [name, dir] of Object.entries(scenes)) encode(name, dir);
  fs.rmSync(frameRoot, { recursive: true, force: true });
  console.log(`Generated cutscene videos in ${outDir}`);
}

main();
