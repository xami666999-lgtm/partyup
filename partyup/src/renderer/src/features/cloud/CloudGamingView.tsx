import '../local/pages.scss';

const SERVICES = [
  { name: 'Moonlight', detail: 'Stream a PC you already own.', href: 'https://moonlight-stream.org/' },
  { name: 'GeForce Now', detail: 'NVIDIA’s cloud service.', href: 'https://www.nvidia.com/en-us/geforce-now/' },
  { name: 'Xbox Cloud', detail: 'Play from an Xbox library you subscribe to.', href: 'https://www.xbox.com/play' },
  { name: 'Steam Link', detail: 'Stream your own Steam library.', href: 'https://store.steampowered.com/remoteplay' },
];

export function CloudGamingView() {
  return (
    <div className="pu-page">
      <div>
        <h1>Cloud</h1>
        <p className="sub">Official streaming apps. PartyUp opens their sites. It does not log in for you.</p>
      </div>
      <div className="pu-grid">
        {SERVICES.map((service) => (
          <article key={service.name} className="pu-card">
            <h2>{service.name}</h2>
            <p>{service.detail}</p>
            <a className="btn btn-secondary btn-sm" href={service.href} target="_blank" rel="noreferrer">Open</a>
          </article>
        ))}
      </div>
    </div>
  );
}
