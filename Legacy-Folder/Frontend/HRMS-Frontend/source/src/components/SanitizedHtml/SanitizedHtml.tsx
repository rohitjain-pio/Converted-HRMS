import Box, { BoxProps } from "@mui/material/Box";
import DOMPurify, { Config } from "dompurify";
import { useEffect, useMemo } from "react";

type SanitizedHtmlProps = Omit<BoxProps, "children"> & {
  htmlString: string;
  config?: Config;
};

let linkHookRegistered = false;

function registerOpenAllLinksInBlankHook() {
  if (linkHookRegistered) return;

  DOMPurify.addHook("afterSanitizeAttributes", (node: Element) => {
    if (node.tagName !== "A") return;
    const hasHref =
      node.hasAttribute("href") || node.hasAttribute("xlink:href");
    if (!hasHref) return;

    node.setAttribute("target", "_blank");

    const existingRel = node.getAttribute("rel") || "";
    const relTokens = new Set(existingRel.split(/\s+/).filter(Boolean));
    relTokens.add("noopener");
    relTokens.add("noreferrer");
    node.setAttribute("rel", Array.from(relTokens).join(" "));
  });

  linkHookRegistered = true;
}

const DEFAULT_CONFIG: Config = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ["target", "rel"],
};

const SanitizedHtml = (props: SanitizedHtmlProps) => {
  const { htmlString, config, ...rest } = props;

  useEffect(() => {
    registerOpenAllLinksInBlankHook();
  }, []);

  const effectiveConfig = useMemo<Config>(() => {
    return { ...DEFAULT_CONFIG, ...(config || {}) };
  }, [config]);

  const sanitized = useMemo(() => {
    if (!htmlString) return "";

    return DOMPurify.sanitize(htmlString, effectiveConfig);
  }, [htmlString, effectiveConfig]);

  return <Box {...rest} dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

export default SanitizedHtml;
