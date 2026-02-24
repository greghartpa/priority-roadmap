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

  const getBarSegments = (teamName: string, quarter: string) => {
    const teamMap = grid.get(teamName);
    const initiatives = teamMap?.get(quarter) || [];
    if (initiatives.length === 0) return [];

    // Count initiatives per pillar
    const counts = new Map<string, number>();
    for (const init of initiatives) {
      const key = init.strategyPillar || '';
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const total = initiatives.length;
    const segments: { color: string; pct: number; pillar: string; count: number }[] = [];

    // Sort by pillar order for consistent coloring
    const sortedKeys = Array.from(counts.keys()).sort((a, b) => {
      if (!a) return 1;
      if (!b) return -1;
      return pillars.indexOf(a) - pillars.indexOf(b);
    });

    for (const key of sortedKeys) {
      const count = counts.get(key)!;
      segments.push({
        color: key ? (pillarColorMap.get(key) || NONE_COLOR) : NONE_COLOR,
        pct: (count / total) * 100,
        pillar: key || 'None',
        count,
      });
    }

    return segments;
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
                      const segments = getBarSegments(team.name, q);
                      return (
                        <td key={q} className="heatmap-data-cell">
                          {segments.length > 0 ? (
                            <div
                              className="heatmap-bar"
                              title={segments.map((s) => `${s.pillar}: ${s.count}`).join(', ')}
                            >
                              {segments.map((seg, i) => (
                                <div
                                  key={i}
                                  className="heatmap-bar-segment"
                                  style={{
                                    width: `${seg.pct}%`,
                                    backgroundColor: seg.color,
                                  }}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="heatmap-bar heatmap-bar--empty" />
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
