import { j as t, c as o, p as n, a as c, s as r } from "./utils-NXLET2if.js";
const l = ({ label: s = "Ask PIO", buttonstyle: a = {} }) => {
  const e = () => {
    c.toggle();
  };
  return /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
    /* @__PURE__ */ t.jsx("style", { children: o }),
    /* @__PURE__ */ t.jsx(
      "button",
      {
        className: "chatbot-launcher",
        "aria-haspopup": "dialog",
        "aria-controls": "chatbot-chat",
        onClick: e,
        style: { ...n(a) },
        children: s
      }
    )
  ] });
}, h = r(l, {
  props: {
    label: "string",
    buttonstyle: "string"
  }
});
customElements.define("web-chatlauncher", h);
