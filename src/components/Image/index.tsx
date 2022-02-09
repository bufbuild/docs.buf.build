import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

type Props = {
  alt: string;
  src: string;
  caption?: string;
  title?: string; // Browsers display this as a tooltip on hover
  width?: number;
};

const Image = ({ alt, src, caption, title, width }: Props) => {
  const url: string = useBaseUrl(src);
  const imgTitle: string = title || caption;
  const imgWidth: number = width || 100;

  return (
    <figure>
      <a href={url} target="_blank">
        <img alt={alt} src={url} title={imgTitle} width={`${imgWidth}%`} />
      </a>

      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};

export default Image;
