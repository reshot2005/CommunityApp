const inputClassName =
  "w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-brand-500 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_0_24px_rgba(59,130,246,0.12)]";

function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-100">
        {label}
      </label>
      <input
        id={id}
        name={name || id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClassName}
      />
    </div>
  );
}

export default TextField;
