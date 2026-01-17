const path = require("path");
const { createCanvas, loadImage, registerFont } = require("@napi-rs/canvas");
const fs = require("fs");

function num(query, key, fallback) {
  const v = Number(query[key]);
  return Number.isFinite(v) ? v : fallback;
}

function str(query, key, fallback) {
  const v = query[key];
  return typeof v === "string" && v.length ? v : fallback;
}

function color(query, key, fallback) {
  const raw = str(query, key, "");
  if (!raw) return fallback;
  return raw.startsWith("#") ? raw : `#${raw}`;
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

async function loadImageSafe(url) {
  if (!url) return null;
  try {
    return await loadImage(url);
  } catch {
    return null;
  }
}

const fontDir = path.join(__dirname, "..", "fonts");
let fontsRegistered = false;

function ensureFonts() {
  if (fontsRegistered) return;
  const regular = path.join(fontDir, "OpenSans-Regular.ttf");
  const semibold = path.join(fontDir, "OpenSans-SemiBold.ttf");
  const bold = path.join(fontDir, "OpenSans-Bold.ttf");

  const missing = [regular, semibold, bold].filter((file) => !fs.existsSync(file));
  if (missing.length) {
    console.warn("Missing font files:", missing);
    fontsRegistered = true;
    return;
  }

  registerFont(regular, { family: "Open Sans", weight: "400" });
  registerFont(semibold, { family: "Open Sans", weight: "600" });
  registerFont(bold, { family: "Open Sans", weight: "700" });
  fontsRegistered = true;
}

module.exports = async (req, res) => {
  try {
    ensureFonts();
    const query = req.query || {};

    const bgParam = str(query, "bg", "");
    let bg = await loadImageSafe(bgParam);
    if (!bg) {
      const bgPath = path.join(__dirname, "..", "original.png");
      bg = await loadImage(bgPath);
    }

    const width = num(query, "w", bg.width || 1530);
    const height = num(query, "h", bg.height || 383);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0, width, height);

    const labelX = num(query, "labelX", 300);
    const valueX = num(query, "valueX", 520);
    const barY = num(query, "barY", 90);
    const barHeight = num(query, "barH", 48);
    const barGap = num(query, "barGap", 14);
    const labelW = num(query, "labelW", 190);
    const valueW = num(query, "valueW", 650);
    const radius = num(query, "radius", 24);

    const labelBg = color(query, "labelBg", "#2b3360");
    const valueBg = color(query, "valueBg", "#000000");
    const labelColor = color(query, "labelColor", "#ffffff");
    const valueColor = color(query, "valueColor", "#ffffff");

    const fontFamilyRaw = str(query, "font", "Open Sans");
    const fontFamily =
      fontFamilyRaw.includes(",") || fontFamilyRaw.includes("sans-serif")
        ? fontFamilyRaw
        : `${fontFamilyRaw}, sans-serif`;
    const labelFont = num(query, "labelSize", 24);
    const valueFont = num(query, "valueSize", 24);
    const labelWeight = num(query, "labelWeight", 700);
    const valueWeight = num(query, "valueWeight", 600);

    const labels = [
      str(query, "l1", "PLAYER"),
      str(query, "l2", "FISH"),
      str(query, "l3", "WEIGHT"),
      str(query, "l4", "MUTATION")
    ];

    const values = [
      str(query, "v1", str(query, "player", "Big Frostborn Sharks")),
      str(query, "v2", str(query, "fish", "Shark Megalodon BIG")),
      str(query, "v3", str(query, "weight", "WEIGHT")),
      str(query, "v4", str(query, "mutation", "MUTATION"))
    ];

    for (let i = 0; i < 4; i++) {
      const y = barY + i * (barHeight + barGap);

      ctx.fillStyle = labelBg;
      roundRect(ctx, labelX, y, labelW, barHeight, radius);
      ctx.fill();

      ctx.fillStyle = valueBg;
      roundRect(ctx, valueX, y, valueW, barHeight, radius);
      ctx.fill();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = labelColor;
      ctx.font = `${labelWeight} ${labelFont}px ${fontFamily}`;
      ctx.fillText(labels[i], labelX + labelW / 2, y + barHeight / 2);

      ctx.fillStyle = valueColor;
      ctx.font = `${valueWeight} ${valueFont}px ${fontFamily}`;
      ctx.fillText(values[i], valueX + valueW / 2, y + barHeight / 2);
    }

    const circleX = num(query, "circleX", 40);
    const circleY = num(query, "circleY", 95);
    const circleSize = num(query, "circleSize", 180);
    const squareX = num(query, "squareX", 1260);
    const squareY = num(query, "squareY", 95);
    const squareSize = num(query, "squareSize", 170);
    const strokeWidth = num(query, "strokeW", 4);

    const circleFill = color(query, "circleFill", "#333333");
    const circleStroke = color(query, "circleStroke", "#111111");
    const squareFill = color(query, "squareFill", "#333333");
    const squareStroke = color(query, "squareStroke", "#111111");

    const circleImg = await loadImageSafe(str(query, "circleUrl", ""));
    const squareImg = await loadImageSafe(str(query, "squareUrl", ""));

    if (circleImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        circleX + circleSize / 2,
        circleY + circleSize / 2,
        circleSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(circleImg, circleX, circleY, circleSize, circleSize);
      ctx.restore();
    } else {
      ctx.fillStyle = circleFill;
      ctx.beginPath();
      ctx.arc(
        circleX + circleSize / 2,
        circleY + circleSize / 2,
        circleSize / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = circleStroke;
    ctx.beginPath();
    ctx.arc(
      circleX + circleSize / 2,
      circleY + circleSize / 2,
      circleSize / 2,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    if (squareImg) {
      ctx.drawImage(squareImg, squareX, squareY, squareSize, squareSize);
    } else {
      ctx.fillStyle = squareFill;
      ctx.fillRect(squareX, squareY, squareSize, squareSize);
    }

    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = squareStroke;
    ctx.strokeRect(squareX, squareY, squareSize, squareSize);

    const download = str(query, "download", "") === "1";
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader(
      "Content-Disposition",
      download ? 'attachment; filename="result.png"' : 'inline; filename="result.png"'
    );

    const png = canvas.toBuffer("image/png");
    res.status(200).end(png);
  } catch (err) {
    console.error("Generate error:", err);
    res.status(500).setHeader("Content-Type", "text/plain");
    const message = err && err.stack ? err.stack : String(err);
    res.end(`Failed to generate image.\n\n${message}`);
  }
};
