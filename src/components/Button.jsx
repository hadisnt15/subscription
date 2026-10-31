export default function Button({
    children,
    type = 'button',
    variant = 'primary',
    loading = false,
    disabled = false,
    onClick,
    className = '',
}) {
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };

    return (
        <button type={type} onClick={onClick} disabled={disabled || loading} className={` rounded-lg px-4 py-2.5 font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className} `}>
            {loading ? 'Processing...' : children}
        </button>
    );
}