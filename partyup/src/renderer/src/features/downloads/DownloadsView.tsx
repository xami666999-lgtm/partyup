import { useState } from 'react';
import { useVault } from '../local/vault';
import '../local/pages.scss';

export function DownloadsView() {
  const files = useVault((s) => s.files);
  const addFile = useVault((s) => s.addFile);
  const removeFile = useVault((s) => s.removeFile);
  const [name, setName] = useState('');
  const [path, setPath] = useState('');

  return (
    <div className="pu-page">
      <div>
        <h1>Files</h1>
        <p className="sub">Keep notes of installers you already have on disk. PartyUp does not download games or connect to repack sites.</p>
      </div>
      <form
        className="pu-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          addFile(name.trim(), path.trim());
          setName('');
          setPath('');
        }}
      >
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" aria-label="File name" />
        <input value={path} onChange={(event) => setPath(event.target.value)} placeholder="Path" aria-label="File path" />
        <button className="btn btn-primary" type="submit">Add</button>
      </form>
      <div className="pu-list">
        {files.length === 0 ? <p>No local files yet.</p> : null}
        {files.map((file) => (
          <article key={file.id}>
            <div>
              <strong>{file.name}</strong>
              <p>{file.path || 'No path yet'}</p>
            </div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => removeFile(file.id)}>Remove</button>
          </article>
        ))}
      </div>
    </div>
  );
}
