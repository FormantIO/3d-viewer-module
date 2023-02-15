// @ts-ignore
import parse from "color-rgba";

export function parseColor(color: string): string {
  const vals = parse(color);
  return `rgba(${vals[0]}, ${vals[1]}, ${vals[2]}, ${vals[3]})`;
}
