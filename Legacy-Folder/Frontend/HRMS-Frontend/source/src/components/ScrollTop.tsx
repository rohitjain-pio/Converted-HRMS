import PropTypes from 'prop-types';
import { useEffect } from 'react';

// ==============================|| NAVIGATION - SCROLL TO TOP ||============================== //

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ScrollTop = ({ children }: { children: any }) => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);

  return children || null;
};

ScrollTop.propTypes = {
  children: PropTypes.node,
};

export default ScrollTop;
