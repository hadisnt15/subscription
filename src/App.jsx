import { AuthProvider } from './hooks/useAuth';
import { RouterProvider } from 'react-router-dom';
import router from './routes';

export default function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}