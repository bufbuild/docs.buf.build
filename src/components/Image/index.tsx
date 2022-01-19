import React from "react";
import useBaseUrl from '@docusaurus/useBaseUrl';

type Props = {
  alt: string;
  src: string;
  caption?: string;
  title?: string; // Browsers display this as a tooltip on hover
};

const Image = ({ alt, src, caption, title }: Props) => {
  const url: string = useBaseUrl(src);
  const imgTitle: string = title || caption;

  return (
    <figure>
      <a href={url} target="_blank">
        <img alt={alt} src={url} title={imgTitle} />
      </a>

      {caption && (
        <figcaption>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default Image;