import ReactDOM from 'react-dom/client';

import App from './App';

import "./index.css";

const rootEle = document.getElementById('root');

if (rootEle) {
  ReactDOM.createRoot(rootEle).render(
    <div>
      <App />
    </div>
  )
}