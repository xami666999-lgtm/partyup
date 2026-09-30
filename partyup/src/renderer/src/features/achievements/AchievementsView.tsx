import { useVault } from '../local/vault';
import '../local/pages.scss';

export function AchievementsView() {
  const achievements = useVault((s) => s.achievements);
  const toggle = useVault((s) => s.toggleAchievement);
  const unlocked = achievements.filter((item) => item.unlocked).length;

  return (
    <div className="pu-page">
      <div>
        <h1>Achievements</h1>
        <p className="sub">{unlocked} of {achievements.length} marked on this PC.</p>
      </div>
      <div className="pu-list">
        {achievements.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <p>{item.game} · {item.platform || 'Local'}</p>
            </div>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => toggle(item.id)}>
              {item.unlocked ? 'Unlocked' : 'Locked'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
