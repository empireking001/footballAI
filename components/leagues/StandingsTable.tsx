import Image from "next/image";
import { Standing } from "@/types/api";

interface StandingsTableProps {
  standings: Standing[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted">
        No standings available for this competition yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-surface-elevated text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-3 py-3 font-medium">#</th>
            <th className="px-3 py-3 font-medium">Team</th>
            <th className="px-3 py-3 text-center font-medium">P</th>
            <th className="px-3 py-3 text-center font-medium">W</th>
            <th className="px-3 py-3 text-center font-medium">D</th>
            <th className="px-3 py-3 text-center font-medium">L</th>
            <th className="px-3 py-3 text-center font-medium">GF</th>
            <th className="px-3 py-3 text-center font-medium">GA</th>
            <th className="px-3 py-3 text-center font-medium">GD</th>
            <th className="px-3 py-3 text-center font-medium">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {standings.map((row) => (
            <tr key={row._id} className="hover:bg-surface/50">
              <td className="px-3 py-3 font-mono text-muted">{row.position}</td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  {row.team.logoUrl ? (
                    <Image
                      src={row.team.logoUrl}
                      alt={row.team.name}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-elevated text-[10px] text-muted">
                      {row.team.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="font-medium">
                    {row.team.shortName || row.team.name}
                  </span>
                </div>
              </td>
              <td className="px-3 py-3 text-center">{row.playedGames}</td>
              <td className="px-3 py-3 text-center">{row.won}</td>
              <td className="px-3 py-3 text-center">{row.draw}</td>
              <td className="px-3 py-3 text-center">{row.lost}</td>
              <td className="px-3 py-3 text-center">{row.goalsFor}</td>
              <td className="px-3 py-3 text-center">{row.goalsAgainst}</td>
              <td className="px-3 py-3 text-center">{row.goalDifference}</td>
              <td className="px-3 py-3 text-center font-semibold text-foreground">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
