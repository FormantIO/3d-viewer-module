// expose types for jq-web
declare module "jq-web" {
  export function json(data: any, query: string): any;
}

declare module "color-rgba" {
  export function parse(color: string): [number, number, number, number];
}
