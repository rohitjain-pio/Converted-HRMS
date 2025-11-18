import { r as o, a as t, j as e, c as f, p as c, s as u } from "./utils-NXLET2if.js";
const g = ({
  url: n = "https://copilotstudio.microsoft.com/environments/16f1612e-cf67-e716-a05c-3b7fac7905d2/bots/cr78d_agent1_qGCp6K/webchat?__version__=2",
  title: s = "Ask PIO",
  width: i = "320px",
  height: l = "100%",
  className: d = "",
  drawerstyle: h = {},
  headerstyle: b = {}
}) => {
  const [r, m] = o.useState(!1);
  return o.useEffect(() => {
    const w = t.subscribe(m), a = (p) => {
      p.key === "Escape" && t.closeDrawer();
    };
    return document.addEventListener("keydown", a), () => {
      w(), document.removeEventListener("keydown", a);
    };
  }, []), /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    /* @__PURE__ */ e.jsx("style", { children: f }),
    r && /* @__PURE__ */ e.jsxs(
      "section",
      {
        className: `chatbot-drawer ${r ? "open" : ""} ${d}`,
        role: "dialog",
        "aria-label": `${s} chat window`,
        "aria-modal": "false",
        style: {
          width: i,
          height: l,
          display: "flex",
          flexDirection: "column",
          background: "white",
          ...c(h)
        },
        children: [
          /* @__PURE__ */ e.jsxs("header", { className: "chatbot-header", style: { ...c(b) }, children: [
            /* @__PURE__ */ e.jsx("span", { children: s }),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                className: "chatbot-close",
                "aria-label": "Close chat",
                title: "Close",
                onClick: t.closeDrawer,
                children: "×"
              }
            )
          ] }),
          /* @__PURE__ */ e.jsx(
            "iframe",
            {
              className: "chatbot-frame",
              src: n,
              title: `${s} iframe`,
              allow: "clipboard-read; clipboard-write",
              referrerPolicy: "strict-origin-when-cross-origin",
              loading: "lazy",
              style: {
                flexGrow: 1,
                border: "none",
                width: "100%"
              }
            }
          )
        ]
      }
    )
  ] });
}, y = u(g, {
  props: {
    url: "string",
    title: "string",
    width: "string",
    height: "string",
    className: "string",
    drawerstyle: "string",
    headerstyle: "string"
  }
});
customElements.define("web-chatdrawer", y);
