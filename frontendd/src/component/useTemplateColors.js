import { useEffect, useState } from "react";

const WHITE = { background: "#ffffff", border: "#e5e7eb", hover: "#ffffff" };

// Find the dominant light background color and gently lift its brightness
// so the cards blend with the template's lighter paper/background surface.
export default function useTemplateColors(url) {
  const [sample, setSample] = useState(null);
  useEffect(() => {
    if (!url) return;
    let active = true;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (!active) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 32;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, 0, 0, 32, 32);
        const pixels = context.getImageData(0, 0, 32, 32).data;
        const groups = new Map();
        const fallbackGroups = new Map();
        for (let i = 0; i < pixels.length; i += 4) {
          const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
          const high = Math.max(...rgb);
          const low = Math.min(...rgb);
          const brightness = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
          if (pixels[i + 3] < 128) continue;
          const key = rgb.map(value => Math.floor(value / 24)).join(",");
          // Keep neutral and dark pixels as a fallback so gray/dark templates
          // also produce their own palette instead of always becoming white.
          const targets = [fallbackGroups];
          if (brightness >= 160 && high - low >= 12) targets.push(groups);
          for (const target of targets) {
            const group = target.get(key) || { count: 0, total: [0, 0, 0] };
            group.count += 1;
            rgb.forEach((value, channel) => { group.total[channel] += value; });
            target.set(key, group);
          }
        }
        const candidates = groups.size ? groups : fallbackGroups;
        const dominant = [...candidates.values()].sort((a, b) => b.count - a.count)[0];
        if (!dominant) {
          setSample({ url, colors: WHITE });
          return;
        }
        const rgb = dominant.total.map(value => value / dominant.count);
        const brightness = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        const lift = Math.max(0.35, (205 - brightness) / (255 - brightness || 1));
        const surface = rgb.map(value => Math.round(value + (255 - value) * lift));
        const background = `rgb(${surface.join(", ")})`;
        const border = `rgb(${surface.map(value => Math.round(value * 0.94)).join(", ")})`;
        setSample({ url, colors: { background, border, hover: background } });
      } catch {
        // Unreadable cross-origin images retain the neutral fallback.
      }
    };
    image.onerror = () => {};
    image.src = url;
    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [url]);
  return url && sample?.url === url ? sample.colors : WHITE;
}
