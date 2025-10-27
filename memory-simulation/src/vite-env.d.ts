/// <reference types="vite/client" />

// Declaración de módulos CSS
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
