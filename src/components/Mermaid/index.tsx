import React, { useEffect } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true
});

type Props = {
  chart: string;
  id: number;
};

// TODO: would be nice if we could have this read from
// a code block instead of having to put the charts into
// a component, but this will suffice.
const Mermaid = ({ chart, id }: Props) => {
  useEffect(() => {
    mermaid.contentLoaded();
  }, []);
  return <div className="mermaid" id={id}>{chart}</div>;
}

export default Mermaid;
