export default function AuthLayout({ children, title, description }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    <p className="mt-2 text-gray-500">{description}</p>
                </div>
                {children}
            </div>
        </div>
    );
}