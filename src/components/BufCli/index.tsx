import React from "react";
import data from "../../data/docs.json";

const BufCli = () => {
  const cli = data.buf_cli;

  return <div style={{ border: "1px solid #ddd", padding: "1.25rem 1.75rem 1.25rem 1.75rem", borderRadius: "0.5rem" }}>
    <span style={{ fontSize: "2rem", fontWeight: 700 }}>
      {cli.name}
    </span>

    <div style={{ marginTop: "2rem" }}>
      <p>
        Global flags
      </p>

      <div>
        {Object.keys(cli.global_flags).map(key => (
          <span>
            {JSON.stringify(cli.global_flags[key])}
          </span>
        ))}
      </div>
    </div>

    <div>
      {JSON.stringify(cli)}
    </div>
  </div>
}

export default BufCli;