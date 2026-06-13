import { localToUtc } from "../../../shared/utils/datetime.js";
import { calculateDistance } from "./distance.js";

export type ScoredCandidate = {
  providerId: string;
  providerServiceId: string;
  startTime: string;
  endTime: string;
  timeSlotIds: string[];
  score: number;
  isFallback: boolean;
};

type CandidateInput = {
  providerId: string;
  providerServiceId: string;
  date: string;
  startTime: string;
  endTime: string;
  slotIds: string[];
  providerLat: number | null;
  providerLng: number | null;
  isFallback: boolean;
};

type ScorePreference = "time" | "location";

function minutesUntilStart(date: string, startTime: string, now: Date): number {
  const startAt = localToUtc(date, startTime);
  return Math.max(0, (startAt.getTime() - now.getTime()) / 60_000);
}

function normalize(values: number[], value: number): number {
  if (values.length === 0) return 50;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return 50;
  return ((value - min) / (max - min)) * 100;
}

/** Lower score is better. Returns top N candidates. */
export function scoreAndRankCandidates(
  candidates: CandidateInput[],
  userLat: number | null,
  userLng: number | null,
  preference: ScorePreference,
  limit = 3,
): ScoredCandidate[] {
  if (candidates.length === 0) return [];

  const now = new Date();
  const timeValues = candidates.map((c) => minutesUntilStart(c.date, c.startTime, now));
  const distanceValues = candidates.map((c) => {
    const dist = calculateDistance(userLat, userLng, c.providerLat, c.providerLng);
    return dist ?? 50;
  });

  const scored = candidates.map((c, i) => {
    const timeScore = normalize(timeValues, timeValues[i]);
    const distanceScore = normalize(distanceValues, distanceValues[i]);

    let score: number;
    if (preference === "time") {
      score = timeScore * 0.9 + distanceScore * 0.1;
    } else if (preference === "location") {
      score = distanceScore * 0.9 + timeScore * 0.1;
    } else {
      score = timeScore * 0.6 + distanceScore * 0.4;
    }

    const startAt = localToUtc(c.date, c.startTime);
    const endAt = localToUtc(c.date, c.endTime);

    return {
      providerId: c.providerId,
      providerServiceId: c.providerServiceId,
      startTime: startAt.toISOString(),
      endTime: endAt.toISOString(),
      timeSlotIds: c.slotIds,
      score: Math.round(score * 100) / 100,
      isFallback: c.isFallback,
    };
  });

  return scored.sort((a, b) => a.score - b.score).slice(0, limit);
}
