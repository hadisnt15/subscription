export default function Input({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    error = '',
    required = false,
    autoComplete,
}) {
    return (
        <div className="space-y-1">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} autoComplete={autoComplete} className={` w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'} `}/>
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}