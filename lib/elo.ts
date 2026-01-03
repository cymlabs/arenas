export function calculateElo({
  winner,
  loser,
  k = 32
}: {
  winner: number;
  loser: number;
  k?: number;
}) {
  const expectedWinner = 1 / (1 + 10 ** ((loser - winner) / 400));
  const expectedLoser = 1 / (1 + 10 ** ((winner - loser) / 400));

  const newWinner = Math.round(winner + k * (1 - expectedWinner));
  const newLoser = Math.round(loser + k * (0 - expectedLoser));
  return { newWinner, newLoser };
}
