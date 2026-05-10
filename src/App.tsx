import { RouterProvider } from 'react-router-dom';
import router from './app/routes';
import './App.css';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-body text-sm font-bold',
          style: {
            background: '#ffffff',
            color: '#1a1a1a',
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,0.1)'
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;