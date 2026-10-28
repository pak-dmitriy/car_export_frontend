import { useEffect, useState } from 'react';
import { apiRequest } from './api/client';

export default function App() {
  const [text, setText] = useState('Loading...');

  useEffect(() => {
    apiRequest('/api/cars')
        .then((data) => setText(`Cars in catalogue: ${data.totalCount}`))
        .catch((e) => setText(`Error: ${e.message}`));
  }, []);

  return <h1>{text}</h1>;
}