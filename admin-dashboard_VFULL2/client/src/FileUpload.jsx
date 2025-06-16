import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/import-profile', formData);
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Erreur lors de l’import');
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleUpload} />
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;
