import React from "react";
import useBaseUrl from '@docusaurus/useBaseUrl';

type Props = {
  alt: string;
  src: string;
  caption?: string;
};

const Image = ({ alt, src, caption }: Props) => {
  const url: string = useBaseUrl(src);

  return (
    <figure>
      <a href={url} target="_blank">
        <img alt={alt} src={url} />
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