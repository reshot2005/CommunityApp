import { Link } from "react-router-dom";
import Button from "./Button";

function EmptyState({ title, description, actionLabel, actionTo }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-700 bg-slate-900/70 p-10 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300">{description}</p>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="mt-6 inline-flex">
          <Button>{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}

export default EmptyState;
