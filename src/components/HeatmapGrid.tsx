import { useMemo } from 'react';
import type { RoadmapData } from '../utils/excel';

const PILLAR_PALETTE = [
  '#219EBC', // blue green
  '#FB8500', // tiger orange
  '#023047', // deep space blue
  '#06B6D4', // cyan
  '#D63384', // warm rose
  '#EF4444', // red
  '#2D6A4F', // forest green
  '#9B5DE5', // purple
];

const NONE_COLOR = '#CED4DA';

interface HeatmapGridProps {
  data: RoadmapData;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({ data }) => {
  const { teams, quarters, pillars, grid } = data;

  const pillarColorMap = useMemo(() => {
    const map = new Map<string, string>();
    pillars.forEach((p, i) => {
      map.set(p, PILLAR_PALETTE[i % PILLAR_PALETTE.length]);
    });
    return map;
  }, [pillars]);

  // Group teams by suite for section headers
  const teamsBySuite = useMemo(() => {
    const groups: { suite: string; teams: typeof teams }[] = [];
    let currentSuite = '';
    let currentGroup: typeof teams = [];

    for (const team of teams) {
      if (team.suite !== currentSuite) {
        if (currentGroup.length > 0) {
          groups.push({ suite: currentSuite, teams: currentGroup });
        }
        currentSuite = team.suite;
        currentGroup = [];
      }
      currentGroup.push(team);
    }
    if (currentGroup.length > 0) {
      groups.push({ suite: currentSuite, teams: currentGroup });
    }
    return groups;
  }, [teams]);

  // Returns one dot per initiative, colored by pillar, sorted by pillar order
  const getDots = (teamName: string, quarter: string) => {
    const teamMap = grid.get(teamName);
    const initiatives = teamMap?.get(quarter) || [];
    if (initiatives.length === 0) return [];

    return initiatives
      .slice()
      .sort((a, b) => {
        const ai = pillars.indexOf(a.strategyPillar);
        const bi = pillars.indexOf(b.strategyPillar);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      })
      .map((init) => ({
        color: init.strategyPillar
          ? (pillarColorMap.get(init.strategyPillar) || NONE_COLOR)
          : NONE_COLOR,
        pillar: init.strategyPillar || 'None',
        name: init.name,
      }));
  };

  return (
    <div className="heatmap-container">
      {/* Legend */}
      <div className="heatmap-legend">
        {pillars.map((p) => (
          <span key={p} className="heatmap-legend-item">
            <span
              className="heatmap-legend-swatch"
              style={{ backgroundColor: pillarColorMap.get(p) }}
            />
            {p}
          </span>
        ))}
      </div>

      <div className="heatmap-grid-wrapper">
        <table className="heatmap-grid">
          <thead>
            <tr>
              <th className="heatmap-team-header">Team</th>
              {quarters.map((q) => (
                <th key={q} className="heatmap-quarter-header">{q}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamsBySuite.map((group) => (
              <>
                <tr key={`suite-${group.suite}`} className="heatmap-suite-row">
                  <td colSpan={quarters.length + 1} className="heatmap-suite-cell">
                    {group.suite}
                  </td>
                </tr>
                {group.teams.map((team) => (
                  <tr key={team.name} className="heatmap-team-row">
                    <td className="heatmap-team-cell">{team.name}</td>
                    {quarters.map((q) => {
                      const dots = getDots(team.name, q);
                      return (
                        <td key={q} className="heatmap-data-cell">
                          {dots.length > 0 && (
                            <div className="heatmap-dots">
                              {dots.map((dot, i) => (
                                <span
                                  key={i}
                                  className="heatmap-dot"
                                  style={{ backgroundColor: dot.color }}
                                  title={`${dot.name} (${dot.pillar})`}
                                />
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
