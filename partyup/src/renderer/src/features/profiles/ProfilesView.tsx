import { useState } from 'react';
import { useVault } from '../local/vault';
import '../local/pages.scss';

export function ProfilesView() {
  const people = useVault((s) => s.people);
  const active = useVault((s) => s.activePerson);
  const addPerson = useVault((s) => s.addPerson);
  const setActive = useVault((s) => s.setActivePerson);
  const [name, setName] = useState('');

  return (
    <div className="pu-page">
      <div>
        <h1>Profiles</h1>
        <p className="sub">Who is playing on this PC. Snapshots use the active profile.</p>
      </div>
      <form
        className="pu-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          addPerson(name.trim());
          setName('');
        }}
      >
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Profile name" aria-label="Profile name" />
        <button className="btn btn-primary" type="submit">Add profile</button>
      </form>
      <div className="pu-grid">
        {people.map((person) => (
          <button key={person.id} type="button" className="pu-card" onClick={() => setActive(person.id)}>
            <h2 style={{ color: person.color }}>{person.name}</h2>
            <p>{person.id === active ? 'Active' : 'Switch to this profile'}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
