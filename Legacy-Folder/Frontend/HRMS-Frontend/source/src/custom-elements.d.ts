declare namespace JSX {
  interface IntrinsicElements {
    'web-chatdrawer': {
      drawerstyle?: string;
      headerstyle?: string
      title?: string;
      height?: string;
      url?: string
    };
    'web-chatlauncher': {
      label?: string;
      buttonstyle?: string;
    };
  }
}