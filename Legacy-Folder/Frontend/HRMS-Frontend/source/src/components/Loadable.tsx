import { Suspense } from 'react';

// project import
import Loader from '@/components/Loader';

// ==============================|| LOADABLE - LAZY LOADING ||============================== //

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const Loadable = (Component: any) => (props: any) =>
  (
    <Suspense fallback={<Loader />}>
      <Component {...props} />
    </Suspense>
  );

export default Loadable;
