import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import PageTransition from "../components/motion/PageTransition";

function NotFoundPage() {
  return (
    <PageTransition className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">404 Error</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Page Not Found</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          The page you requested does not exist or the route has changed.
        </p>
        <Link to="/" className="mt-8 inline-flex">
          <Button>Go Home</Button>
        </Link>
      </Card>
    </PageTransition>
  );
}

export default NotFoundPage;
