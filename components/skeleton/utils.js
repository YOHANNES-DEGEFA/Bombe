const WIDTH_PRESETS = [72, 81, 63, 95, 58, 88, 76, 67, 84, 91];

export function getSkeletonWidth(seed, index = 0, min = 55, max = 95) {
  const input = `${seed}-${index}`;
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  const preset = WIDTH_PRESETS[hash % WIDTH_PRESETS.length];
  const range = max - min;
  const normalized = min + Math.round((preset / 100) * range);

  return Math.min(max, Math.max(min, normalized));
}

export function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}
