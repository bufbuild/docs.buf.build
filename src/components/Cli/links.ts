const link = (name: string, text?: string): string => {
  const txt = text ? text : name;
  return `<a href="${links[name]}">${txt}</a>`;
};

const links: Record<string, string> = {
  bsr: "/bsr/overview",
  inputs: "/reference/inputs",
  source: "#arg-source"
};

export { link };
