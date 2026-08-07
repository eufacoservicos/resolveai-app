// Com react-native-svg-transformer, importar um .svg devolve um componente
// react-native-svg em vez de um asset de imagem.
declare module "*.svg" {
  import type { FC } from "react";
  import type { SvgProps } from "react-native-svg";

  const content: FC<SvgProps>;
  export default content;
}
