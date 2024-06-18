import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import App from './App';

import "./index.css";

const router = createBrowserRouter([
  {
    path: 'chatbot/:appCode',
    element: <App />
  }
])

const rootEle = document.getElementById('root');

if (rootEle) {
  ReactDOM.createRoot(rootEle).render(
    <div>
      <RouterProvider router={router} />
    </div>
  )
}