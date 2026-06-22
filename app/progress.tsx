import { apiFetch } from "./utils/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { rf, scale, wp, hp } from "./utils/responsive";

const SCREEN_WIDTH = wp(100);

const themeColors: [string, string, string] = ["#F3E8FF", "#E0C3FC", "#F5D5E0"]; // Reverted to Lavender/Pink

export default function ProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    recent: any[];
    weekly: any[];
    distribution: any[];
    daily: any[];
  } | null>(null);

  // Default chart data if empty
  const [chartData, setChartData] = useState<any>({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }],
  });
  const [graphType, setGraphType] = useState<"line" | "bar">("line");

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, []),
  );

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/emotion/stats");

      if (!res.ok) {
        const text = await res.text();
        console.error(`[Stats] Server returned error: ${text}`);
        setLoading(false);
        return;
      }

      const json = await res.json();
      console.log(
        "[Stats] Successfully fetched data points:",
        json.recent?.length || 0,
      );
      setData(json);
      processChartData(json.recent);
    } catch (err) {
      console.error("[Stats] Network or fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (recent: any[]) => {
    if (!recent || recent.length === 0) {
      console.log(
        "[Stats] No recent emotions found, keeping default chart state.",
      );
      return;
    }

    // Map emotions to numeric values for "Flow" visualization
    const emotionValue = (e: string) => {
      const em = (e || "neutral").toLowerCase();
      if (em === "happy" || em === "joy") return 4;
      if (em === "neutral") return 2.5;
      if (em === "anxious" || em === "anger") return 1.5;
      if (em === "fearful" || em === "fear") return 1;
      if (em === "sad" || em === "sadness") return 0.5;
      return 2;
    };

    // Take last 7-10 data points
    const subset = recent.slice(-8);
    const values = subset.map((r: any) => emotionValue(r.emotion));
    const labels = subset.map((r: any) => {
      if (!r.date) return "?";
      const d = new Date(r.date);
      return isNaN(d.getTime()) ? "?" : `${d.getDate()}/${d.getMonth() + 1}`;
    });

    console.log("[Stats] Updating chartData with values:", values);
    setChartData({
      labels,
      datasets: [{ data: values }],
    });
  };

  const getPieData = () => {
    if (!data?.distribution || data.distribution.length === 0) return [];

    const colors = ["#a48aff", "#ff9f43", "#ff6b6b", "#1dd1a1", "#54a0ff"];
    return data.distribution.map((item: any, index: number) => ({
      name: item._id,
      population: item.count,
      color: colors[index % colors.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: rf(12),
    }));
  };

  const getBarData = () => {
    if (!data?.daily || data.daily.length === 0) {
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{ data: [0] }],
      };
    }

    const labels = data.daily.map((d: any) => {
      const date = new Date(d._id);
      return `${date.getDate()}`; // Just day number to save space
    });
    const values = data.daily.map((d: any) => d.count);

    return {
      labels,
      datasets: [{ data: values }],
    };
  };

  const getDominantEmotion = (emotions: string[]) => {
    if (!emotions || emotions.length === 0) return "Neutral";
    const counts: Record<string, number> = {};
    for (const e of emotions) counts[e] = (counts[e] || 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const getInsightText = () => {
    if (!data?.recent || data.recent.length === 0)
      return "Your journey is just beginning.";

    // Look at last 3 emotions
    const last3 = data.recent.slice(-3).map((x: any) => x.emotion);
    const hasHappy = last3.includes("happy");
    const hasSadness = last3.includes("sad");

    if (hasHappy && !hasSadness)
      return "You’ve been moving gently toward light.";
    if (hasSadness)
      return "Things have been heavy lately, but you're still here.";
    return "A quiet flow of emotions recently.";
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={themeColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={scale(24)} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emotional Flow</Text>
          <TouchableOpacity onPress={fetchStats} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={scale(20)} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* 1. Emotional Flow Wave */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Your Journey 📈</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  onPress={() => setGraphType("line")}
                  style={[
                    styles.toggleBtn,
                    graphType === "line" && styles.toggleBtnActive,
                  ]}
                >
                  <Ionicons
                    name="stats-chart"
                    size={16}
                    color={graphType === "line" ? "#fff" : "#8d44ff"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setGraphType("bar")}
                  style={[
                    styles.toggleBtn,
                    graphType === "bar" && styles.toggleBtnActive,
                  ]}
                >
                  <Ionicons
                    name="bar-chart"
                    size={16}
                    color={graphType === "bar" ? "#fff" : "#8d44ff"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {loading ? (
              <View style={{ height: 220, justifyContent: "center" }}>
                <ActivityIndicator color="#8d44ff" size="large" />
              </View>
            ) : graphType === "line" ? (
              <LineChart
                data={chartData}
                width={SCREEN_WIDTH - 20}
                height={220}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(141, 68, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: "4", strokeWidth: "2", stroke: "#8d44ff" },
                  propsForBackgroundLines: { strokeDasharray: "" }, // Solid lines
                }}
                style={{ marginVertical: 8, borderRadius: 16 }}
                fromZero
                verticalLabelRotation={0}
                formatYLabel={(value) => {
                  const v = parseFloat(value);
                  if (v >= 3.5) return "😊";
                  if (v >= 2.2) return "😐";
                  if (v >= 1.2) return "😰";
                  if (v >= 0.8) return "😨";
                  if (v >= 0) return "😢";
                  return "";
                }}
              />
            ) : (
              <BarChart
                data={chartData}
                width={SCREEN_WIDTH - 20}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: ((opacity = 1) =>
                    `rgba(141, 68, 255, ${opacity})`) as any,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  barPercentage: 0.6,
                }}
                style={{ marginVertical: 8, borderRadius: 16 }}
                showValuesOnTopOfBars
                fromZero
              />
            )}

            <View style={{ marginTop: scale(10), alignItems: "center" }}>
              <Text
                style={{
                  color: "#6a1b9a",
                  fontSize: rf(12),
                  fontStyle: "italic",
                }}
              >
                {graphType === "line"
                  ? "Wave of your recent emotions"
                  : "Emotion Intensity Profile"}
              </Text>
            </View>
          </View>

          {/* 2. One-Line Insight */}
          <View style={[styles.card, styles.insightCard]}>
            <Ionicons
              name="sparkles"
              size={scale(20)}
              color="#8d44ff"
              style={{ marginRight: scale(8) }}
            />
            <Text style={styles.insightText}>{getInsightText()}</Text>
          </View>

          {/* 3. Weekly Reflection Cards */}
          <Text style={styles.sectionTitle}>Weekly Reflections</Text>

          {loading && <ActivityIndicator />}

          {!loading &&
            data?.weekly?.map((week: any, index: number) => {
              const dom = getDominantEmotion(week.emotions);
              const weekNum = index + 1; // Or calculate actual week number

              let reflection = "A quiet week — and that’s okay.";
              if (dom === "happy")
                reflection = "More ease in your words this week.";
              if (dom === "sad") reflection = "Things felt heavier.";
              if (dom === "anxious")
                reflection = "A lot on your mind recently.";

              return (
                <View
                  key={week._id || week.date || `week-${index}`}
                  style={styles.weekCard}
                >
                  <View style={styles.weekHeader}>
                    <Text style={styles.weekTitle}>Week {weekNum}</Text>
                    <Text style={styles.weekDate}>
                      {new Date(week.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.weekReflection}>{reflection}</Text>
                </View>
              );
            })}

          {!loading && (!data?.weekly || data?.weekly.length === 0) && (
            <Text style={styles.emptyText}>
              No weekly data yet. Chat more to see reflections!
            </Text>
          )}

          {/* 4. Emotion Distribution (Pie Chart) */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
            Emotion Mix
          </Text>
          <View style={styles.card}>
            {loading ? (
              <ActivityIndicator color="#8d44ff" />
            ) : (
              <PieChart
                data={getPieData()}
                width={SCREEN_WIDTH - 60}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            )}
            {(!data?.distribution || data.distribution.length === 0) &&
              !loading && (
                <Text style={{ color: "#888" }}>
                  No data to show distribution.
                </Text>
              )}
          </View>

          {/* 5. Activity Levels (Bar Chart) */}
          <Text style={styles.sectionTitle}>Activity Level</Text>
          <View style={styles.card}>
            {loading ? (
              <ActivityIndicator color="#8d44ff" />
            ) : (
              <BarChart
                data={getBarData()}
                width={SCREEN_WIDTH - 60}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff", // White background
                  decimalPlaces: 0,
                  color: ((opacity = 1) =>
                    `rgba(141, 68, 255, ${opacity})`) as any, // Purple bars
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  barPercentage: 0.7,
                }}
                style={{
                  borderRadius: 16,
                }}
                showValuesOnTopOfBars={true}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(15),
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    padding: scale(8),
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: scale(20),
    marginRight: scale(15),
  },
  headerTitle: {
    fontSize: rf(24),
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  refreshBtn: {
    padding: scale(8),
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: scale(20),
  },
  content: {
    padding: scale(20),
    paddingBottom: scale(50),
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: scale(24),
    padding: scale(20),
    marginBottom: scale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(10),
    elevation: 5,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: rf(18),
    fontWeight: "600",
    color: "#3d006c",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    marginBottom: scale(10),
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: scale(20),
    padding: scale(3),
  },
  toggleBtn: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(16),
  },
  toggleBtnActive: {
    backgroundColor: "#8d44ff",
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(15),
    backgroundColor: "#fff",
  },
  insightText: {
    fontSize: rf(16),
    color: "#3d006c",
    fontWeight: "500",
    flex: 1,
  },
  sectionTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: scale(15),
    marginLeft: scale(5),
  },
  weekCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: scale(18),
    padding: scale(16),
    marginBottom: scale(12),
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(6),
  },
  weekTitle: {
    fontSize: rf(16),
    fontWeight: "700",
    color: "#6a1b9a",
  },
  weekDate: {
    fontSize: rf(12),
    color: "#888",
  },
  weekReflection: {
    fontSize: rf(15),
    color: "#444",
    fontStyle: "italic",
  },
  emptyText: {
    color: "#fff",
    textAlign: "center",
    opacity: 0.8,
    marginTop: scale(20),
  },
});
