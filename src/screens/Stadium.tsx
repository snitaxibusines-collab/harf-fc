import { stadiumState } from '../lib/progress';

// Le stade, construit bloc par bloc avec les récompenses.
export function Stadium({ blocks, compact = false }: { blocks: number; compact?: boolean }) {
  const [pitch, goals, north, south, lights, board] = stadiumState(blocks);
  const cells = (n: number, have: number, cls: string) =>
    Array.from({ length: n }, (_, k) => <span key={k} className={`blk ${k < have ? cls : 'empty'}`} />);
  return (
    <div className={`stadium ${compact ? 'compact' : ''}`} role="img" aria-label={`Ton stade : ${blocks} blocs posés`}>
      <div className="stand stand-north">{cells(north.blocks, north.have, 'seat')}</div>
      <div className="stadium-mid">
        <div className="lights">{cells(lights.blocks / 2, Math.min(lights.have, lights.blocks / 2), 'light')}</div>
        <div className="pitch-wrap">
          <div className={`pitch ${pitch.have ? '' : 'bare'}`} style={{ opacity: 0.35 + (0.65 * pitch.have) / pitch.blocks }}>
            <span className="pitch-line" />
            <span className="pitch-circle" />
            {goals.have >= 3 && <span className="goal-post left" />}
            {goals.have >= 6 && <span className="goal-post right" />}
          </div>
        </div>
        <div className="lights">{cells(lights.blocks / 2, Math.max(0, lights.have - lights.blocks / 2), 'light')}</div>
      </div>
      <div className="stand stand-south">{cells(south.blocks, south.have, 'seat red')}</div>
      {board.have > 0 && (
        <div className="scoreboard" style={{ opacity: 0.3 + (0.7 * board.have) / board.blocks }}>
          HARF FC
        </div>
      )}
    </div>
  );
}
