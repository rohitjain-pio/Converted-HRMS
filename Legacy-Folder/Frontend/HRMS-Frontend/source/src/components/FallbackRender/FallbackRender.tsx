import { ErrorsBoundary } from "@/interfaces";

const FallbackRender = ({ error }: ErrorsBoundary) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre className="text-danger">{error.message}</pre>
    </div>
  );
};

export default FallbackRender;
