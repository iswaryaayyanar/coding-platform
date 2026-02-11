/**
 * Calculate rank of all users based on score
 * @param {Array<{id: number, username: string, solved_count: number}>} users
 * @returns {Array<{id: number, username: string, solved_count: number, score: number, rank: number}>}
 */
export const calculateRank = (users) => {
  // Compute score (10 points per solved problem)
  const usersWithScore = users.map((u) => ({
    ...u,
    score: u.solved_count * 10,
  }));

  // Sort descending by score
  usersWithScore.sort((a, b) => b.score - a.score);

  // Assign rank (handle ties)
  let currentRank = 1;
  usersWithScore.forEach((user, index) => {
    if (index > 0 && user.score === usersWithScore[index - 1].score) {
      user.rank = usersWithScore[index - 1].rank;
    } else {
      user.rank = currentRank;
    }
    currentRank++;
  });

  return usersWithScore;
};
