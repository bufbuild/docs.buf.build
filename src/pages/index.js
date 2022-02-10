import React from "react";
import { Redirect } from "react-router-dom";

// TODO(tstamm): post launch, re-implement start page
//  note: the pre-restyle also patched `Logo` to render "Docs Home" on the start page, "Docs" on other pages

export default function Home() {
  return <Redirect to="/introduction" />;
}
