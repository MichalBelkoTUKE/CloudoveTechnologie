import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  try {
    return <RouterProvider router={router} />;
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading App</h1>
          <pre className="text-sm text-gray-700">{String(error)}</pre>
        </div>
      </div>
    );
  }
}
