import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ScoreBenchmark {
  sectorName: string;
  avgScore: number;
  percentileData: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  userPercentile: number | null;
}

interface ScoreEvolution {
  currentScore: number;
  previousScore: number | null;
  changeAmount: number;
  changeDirection: "up" | "down" | "stable";
  firstScore: number | null;
  firstScoreDate: Date | null;
  totalChange: number;
}

export function useScoreBenchmark() {
  const { user, profile } = useAuth();
  const [benchmark, setBenchmark] = useState<ScoreBenchmark | null>(null);
  const [evolution, setEvolution] = useState<ScoreEvolution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        // Fetch user's current and historical scores
        const { data: scoreHistory, error: historyError } = await supabase
          .from("tax_score_history")
          .select("score_total, score_grade, calculated_at")
          .eq("user_id", user.id)
          .order("calculated_at", { ascending: true });

        if (historyError) throw historyError;

        // Fetch user's current score
        const { data: currentScoreData, error: scoreError } = await supabase
          .from("tax_score")
          .select("score_total, score_grade")
          .eq("user_id", user.id)
          .maybeSingle();

        if (scoreError) throw scoreError;

        const currentScore = currentScoreData?.score_total || 0;

        // Calculate evolution
        if (scoreHistory && scoreHistory.length > 0) {
          const sortedHistory = [...scoreHistory].sort(
            (a, b) => new Date(a.calculated_at).getTime() - new Date(b.calculated_at).getTime()
          );
          
          const firstEntry = sortedHistory[0];
          const previousEntry = sortedHistory.length > 1 ? sortedHistory[sortedHistory.length - 2] : null;
          
          const changeAmount = previousEntry 
            ? currentScore - previousEntry.score_total 
            : 0;
          
          setEvolution({
            currentScore,
            previousScore: previousEntry?.score_total || null,
            changeAmount: Math.abs(changeAmount),
            changeDirection: changeAmount > 0 ? "up" : changeAmount < 0 ? "down" : "stable",
            firstScore: firstEntry.score_total,
            firstScoreDate: new Date(firstEntry.calculated_at),
            totalChange: currentScore - firstEntry.score_total,
          });
        }

        // Fetch sector benchmark
        const userSetor = profile?.setor;
        
        if (userSetor && currentScore > 0) {
          // Try to find matching sector benchmark
          const { data: benchmarkData } = await supabase
            .from("sector_benchmarks")
            .select("sector_name, avg_score, score_percentile_data")
            .ilike("sector_name", `%${userSetor}%`)
            .limit(1)
            .maybeSingle();

          if (benchmarkData) {
            const percentileData = benchmarkData.score_percentile_data as {
              p25: number;
              p50: number;
              p75: number;
              p90: number;
            } || { p25: 45, p50: 60, p75: 75, p90: 85 };

            // Calculate user's percentile based on their score
            let userPercentile = 50;
            if (currentScore >= percentileData.p90) {
              userPercentile = 90 + ((currentScore - percentileData.p90) / (100 - percentileData.p90)) * 10;
            } else if (currentScore >= percentileData.p75) {
              userPercentile = 75 + ((currentScore - percentileData.p75) / (percentileData.p90 - percentileData.p75)) * 15;
            } else if (currentScore >= percentileData.p50) {
              userPercentile = 50 + ((currentScore - percentileData.p50) / (percentileData.p75 - percentileData.p50)) * 25;
            } else if (currentScore >= percentileData.p25) {
              userPercentile = 25 + ((currentScore - percentileData.p25) / (percentileData.p50 - percentileData.p25)) * 25;
            } else {
              userPercentile = (currentScore / percentileData.p25) * 25;
            }

            setBenchmark({
              sectorName: benchmarkData.sector_name,
              avgScore: benchmarkData.avg_score || 65,
              percentileData,
              userPercentile: Math.min(99, Math.max(1, Math.round(userPercentile))),
            });
          } else {
            // Use default benchmark if no sector found
            setBenchmark({
              sectorName: "Geral",
              avgScore: 65,
              percentileData: { p25: 45, p50: 60, p75: 75, p90: 85 },
              userPercentile: calculateDefaultPercentile(currentScore),
            });
          }
        }
      } catch (error) {
        console.error("Error fetching score benchmark:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, profile]);

  return { benchmark, evolution, loading };
}

function calculateDefaultPercentile(score: number): number {
  if (score >= 85) return 90;
  if (score >= 75) return 75;
  if (score >= 60) return 50;
  if (score >= 45) return 25;
  return 10;
}
