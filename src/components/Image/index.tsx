import React from "react";
import useBaseUrl from '@docusaurus/useBaseUrl';

type Props = {
  alt: string;
  src: string;
};

const Image = ({ alt, src }: Props) => {
  return (
    <div align="center">
      <img alt={alt} src={useBaseUrl(src)}/>
    </div>
  );
}

export default Image;