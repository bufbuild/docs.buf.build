// We need to add this so that TypeScript doesn't complain about our direct SVG and CSS imports
declare module "*.svg" {
  const content: any;
  export default content;
}

declare module "*.css" {
  const content: any;
  export default content;
}
