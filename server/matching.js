// Automated Matching Engine for LF System (Process 5)

function calculateMatchScore(lostItem, foundItem) {
  let score = 0;
  let maxPossibleScore = 100;
  let matches = [];

  // 1. Category Match (30 Points)
  if (lostItem.CategoryID === foundItem.CategoryID) {
    score += 30;
    matches.push("Category Matches");
  }

  // 2. Brand Match (15 Points)
  if (lostItem.Brand && foundItem.Brand) {
    const lBrand = lostItem.Brand.trim().toLowerCase();
    const fBrand = foundItem.Brand.trim().toLowerCase();
    if (lBrand === fBrand || lBrand.includes(fBrand) || fBrand.includes(lBrand)) {
      score += 15;
      matches.push(`Brand Matches (${foundItem.Brand})`);
    }
  }

  // 3. Color Match (15 Points)
  if (lostItem.Color && foundItem.Color) {
    const lColor = lostItem.Color.trim().toLowerCase();
    const fColor = foundItem.Color.trim().toLowerCase();
    if (lColor === fColor || lColor.includes(fColor) || fColor.includes(lColor)) {
      score += 15;
      matches.push(`Color Matches (${foundItem.Color})`);
    }
  }

  // 4. Location Match (20 Points)
  if (lostItem.LocationID === foundItem.LocationID) {
    score += 20;
    matches.push("Location Matches");
  }

  // 5. Date Proximity (10 Points)
  if (lostItem.DateLost && foundItem.DateFound) {
    const dateLost = new Date(lostItem.DateLost);
    const dateFound = new Date(foundItem.DateFound);
    const diffTime = Math.abs(dateFound - dateLost);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      score += 10;
      matches.push("Same/Next Day Proximity");
    } else if (diffDays <= 3) {
      score += 7;
      matches.push("Date within 3 days");
    } else if (diffDays <= 7) {
      score += 4;
      matches.push("Date within 7 days");
    }
  }

  // 6. Text / Description Similarity (10 Points)
  const lText = (lostItem.ItemName + " " + lostItem.Description).toLowerCase();
  const fText = (foundItem.ItemName + " " + foundItem.Description).toLowerCase();
  const lWords = lText.split(/\s+/).filter(w => w.length > 3);
  const fWords = fText.split(/\s+/).filter(w => w.length > 3);

  let commonWords = lWords.filter(word => fWords.includes(word));
  if (commonWords.length > 0) {
    const bonus = Math.min(10, commonWords.length * 3.5);
    score += bonus;
    matches.push(`Keywords Match (${commonWords.slice(0, 3).join(", ")})`);
  }

  const scorePercentage = Math.min(100, Math.round(score));
  return {
    score: scorePercentage,
    reasons: matches,
    isMatch: scorePercentage >= 40
  };
}

function findMatchesForLostItem(lostItem, foundItemsList) {
  return foundItemsList
    .map(found => {
      const matchResult = calculateMatchScore(lostItem, found);
      return {
        lostItem,
        foundItem: found,
        matchScore: matchResult.score,
        matchReasons: matchResult.reasons,
        isMatch: matchResult.isMatch
      };
    })
    .filter(item => item.isMatch)
    .sort((a, b) => b.matchScore - a.matchScore);
}

function findMatchesForFoundItem(foundItem, lostItemsList) {
  return lostItemsList
    .map(lost => {
      const matchResult = calculateMatchScore(lost, foundItem);
      return {
        lostItem: lost,
        foundItem,
        matchScore: matchResult.score,
        matchReasons: matchResult.reasons,
        isMatch: matchResult.isMatch
      };
    })
    .filter(item => item.isMatch)
    .sort((a, b) => b.matchScore - a.matchScore);
}

function getAllMatches(lostItemsList, foundItemsList) {
  let allMatches = [];
  lostItemsList.forEach(lost => {
    foundItemsList.forEach(found => {
      const result = calculateMatchScore(lost, found);
      if (result.isMatch) {
        allMatches.push({
          lostItem: lost,
          foundItem: found,
          matchScore: result.score,
          matchReasons: result.reasons
        });
      }
    });
  });
  return allMatches.sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = {
  calculateMatchScore,
  findMatchesForLostItem,
  findMatchesForFoundItem,
  getAllMatches
};
