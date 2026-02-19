import { useMemo, useState } from 'react';
import type { RoadmapData } from '../utils/excel';

// 8 distinguishable hues — enough for 4 pillars with room to grow
const PILLAR_PALETTE = [
  { border: '#1a73e8', bg: 'rgba(26, 115, 232, 0.08)' },   // blue
  { border: '#e8781a', bg: 'rgba(232, 120, 26, 0.08)' },    // orange
  { border: '#0d9488', bg: 'rgba(13, 148, 136, 0.08)' },    // teal
  { border: '#7c3aed', bg: 'rgba(124, 58, 237, 0.08)' },    // purple
  { border: '#dc3545', bg: 'rgba(220, 53, 69, 0.08)' },     // red
  { border: '#16a34a', bg: 'rgba(22, 163, 74, 0.08)' },     // green
  { border: '#ca8a04', bg: 'rgba(202, 138, 4, 0.08)' },     // gold
  { border: '#db2777', bg: 'rgba(219, 39, 119, 0.08)' },    // pink
];

const NONE_STYLE = { border: '#adb5bd', bg: 'rgba(173, 181, 189, 0.08)' };

interface RoadmapGridProps {
  data: RoadmapData;
}

export const RoadmapGrid: React.FC<RoadmapGridProps> = ({ data }) => {
  const { teams, quarters, pillars, grid } = data;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [suiteFilter, setSuiteFilter] = useState<string>('');

  const suites = useMemo(
    () => Array.from(new Set(teams.map((t) => t.suite))).sort(),
    [teams],
  );

  // Map each pillar value to a color from the palette
  const pillarColors = useMemo(() => {
    const map = new Map<string, { border: string; bg: string }>();
    pillars.forEach((p, i) => {
      map.set(p, PILLAR_PALETTE[i % PILLAR_PALETTE.length]);
    });
    return map;
  }, [pillars]);

  const filteredTeams = suiteFilter
    ? teams.filter((t) => t.suite === suiteFilter)
    : teams;

  const toggleCell = (team: string, quarter: string) => {
    const key = `${team}|${quarter}`;
    setExpanded((prev) => (prev === key ? null : key));
  };

  const getPillarStyle = (pillar: string) => {
    return pillarColors.get(pillar) || NONE_STYLE;
  };

  return (
    <div>
      <div className="roadmap-filters">
        <label className="filter-label" htmlFor="suite-filter">Suite:</label>
        <select
          id="suite-filter"
          className="filter-select"
          value={suiteFilter}
          onChange={(e) => setSuiteFilter(e.target.value)}
        >
          <option value="">All</option>
          {suites.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {pillars.length > 0 && (
          <div className="pillar-legend">
            {pillars.map((p) => {
              const color = getPillarStyle(p);
              return (
                <span key={p} className="pillar-legend-item">
                  <span
                    className="pillar-legend-swatch"
                    style={{ backgroundColor: color.border }}
                  />
                  {p}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="roadmap-grid-wrapper">
        <table className="roadmap-grid">
          <thead>
            <tr>
              <th className="roadmap-team-header">Team</th>
              <th className="roadmap-suite-header">Suite</th>
              {quarters.map((q) => (
                <th key={q} className="roadmap-quarter-header">{q}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team) => {
              const teamMap = grid.get(team.name);
              return (
                <tr key={team.name}>
                  <td className="roadmap-team-cell">{team.name}</td>
                  <td className="roadmap-suite-cell">{team.suite}</td>
                  {quarters.map((q) => {
                    const initiatives = teamMap?.get(q) || [];
                    const cellKey = `${team.name}|${q}`;
                    const isExpanded = expanded === cellKey;

                    return (
                      <td
                        key={q}
                        className={`roadmap-cell${initiatives.length > 0 ? ' roadmap-cell--has-items' : ''}${isExpanded ? ' roadmap-cell--expanded' : ''}`}
                        onClick={() => initiatives.length > 0 && toggleCell(team.name, q)}
                      >
                        {initiatives.map((init, i) => {
                          const color = getPillarStyle(init.strategyPillar);
                          return (
                            <div
                              key={i}
                              className="roadmap-initiative"
                              style={{
                                borderLeftColor: color.border,
                                backgroundColor: color.bg,
                              }}
                            >
                              <div className="roadmap-initiative-name">{init.name}</div>
                              {isExpanded && init.value && (
                                <div className="roadmap-initiative-value">{init.value}</div>
                              )}
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
