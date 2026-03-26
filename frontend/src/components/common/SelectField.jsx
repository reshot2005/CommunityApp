const selectClassName =
  "w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-brand-500 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_0_24px_rgba(59,130,246,0.12)]";

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  placeholderValue = ""
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-100">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={selectClassName}
      >
        <option value={placeholderValue}>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectField;
