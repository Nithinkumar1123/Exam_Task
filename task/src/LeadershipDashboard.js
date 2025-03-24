import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Spinner, Alert, ProgressBar, Button, Badge } from "react-bootstrap";
import { supabase } from "./supabaseClient";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import './App.css';

const COLORS = ["#28a745", "#ffc107", "#007bff", "#dc3545", "#17a2b8", "#6610f2"];

// ✅ AI-Powered Motivational Messages
const motivationalQuotes = {
  high: [
    "🌟 You're on fire! Keep pushing forward!",
    "💯 Almost there—finish strong!",
    "🔥 Your hard work is paying off!"
  ],
  medium: [
    "🚀 Great progress! Keep going!",
    "📚 Halfway done—stay consistent!",
    "💡 You're making steady progress!"
  ],
  low: [
    "🔥 Every small step counts—keep moving!",
    "💡 Stay consistent and don't give up!",
    "🌱 Growth takes time—keep learning!"
  ]
};

const LeadershipDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Pause/Resume Functionality
  const [isPaused, setIsPaused] = useState(false);
  const [pauseTimeLeft, setPauseTimeLeft] = useState(60);  // 1-minute pause countdown
  const intervalRef = useRef(null);
  const pauseTimerRef = useRef(null);

  const refreshInterval = 5000;  // Default refresh interval: 5 seconds

  useEffect(() => {
    fetchData();
    startAutoRefresh(refreshInterval);

    // ✅ Real-time Supabase subscription
    const subscription = supabase
      .channel("realtime-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "subjects" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "topics" }, fetchData)
      .subscribe();

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(pauseTimerRef.current);
      supabase.removeChannel(subscription);
    };
  }, []);

  // ✅ Start auto-refresh with specified interval
  const startAutoRefresh = (interval = refreshInterval) => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchData, interval);
  };

  // ✅ Pause auto-refresh for 1 minute
  const pauseAutoRefresh = () => {
    setIsPaused(true);
    clearInterval(intervalRef.current);

    // Pause countdown timer
    let timeLeft = 60;
    setPauseTimeLeft(timeLeft);

    pauseTimerRef.current = setInterval(() => {
      timeLeft -= 1;
      setPauseTimeLeft(timeLeft);

      if (timeLeft <= 0) {
        resumeAutoRefresh();
      }
    }, 1000);
  };

  // ✅ Manually resume auto-refresh
  const resumeAutoRefresh = () => {
    clearTimeout(pauseTimerRef.current);
    clearInterval(pauseTimerRef.current);

    setIsPaused(false);
    setPauseTimeLeft(60);  // Reset the countdown
    startAutoRefresh(refreshInterval);
  };

  // ✅ Fetch data from Supabase
  async function fetchData() {
    if (isPaused) return;

    setLoading(true);
    try {
      const { data: subjects, error: subjectError } = await supabase
        .from("subjects")
        .select("*");

      if (subjectError) throw subjectError;

      const { data: topics, error: topicError } = await supabase
        .from("topics")
        .select("*");

      if (topicError) throw topicError;

      const chartData = mapData(subjects, topics);
      setData(chartData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data.");
      setLoading(false);
    }
  }

  // ✅ Map subjects and topics into chart data
  function mapData(subjects, topics) {
    return subjects.map((subject, index) => {
      const subjectTopics = topics.filter((topic) => topic.subject_id === subject.id);
      const completedCount = subjectTopics.filter((topic) => topic.completed).length;
      const totalTopics = subjectTopics.length;
      const pendingCount = totalTopics - completedCount;

      const completionRate = totalTopics > 0 ? ((completedCount / totalTopics) * 100).toFixed(1) : 0;

      return {
        id: subject.id,
        name: subject.name,
        completed: completedCount,
        pending: pendingCount,
        total: totalTopics,
        completionRate: parseFloat(completionRate),
        color: COLORS[index % COLORS.length]
      };
    });
  }

  // ✅ Get AI-powered motivational message based on completion percentage
  function getMotivationalMessage(completionRate) {
    if (completionRate >= 80) {
      return motivationalQuotes.high[Math.floor(Math.random() * motivationalQuotes.high.length)];
    } else if (completionRate >= 50) {
      return motivationalQuotes.medium[Math.floor(Math.random() * motivationalQuotes.medium.length)];
    } else {
      return motivationalQuotes.low[Math.floor(Math.random() * motivationalQuotes.low.length)];
    }
  }

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4"> Dashboard with Smart Auto-Resume</h2>

      {/* ✅ Pause/Resume Button */}
      <div className="text-center mb-4">
        <Button
          variant={isPaused ? "success" : "warning"}
          onClick={isPaused ? resumeAutoRefresh : pauseAutoRefresh}
          className="me-2"
        >
          {isPaused ? "▶️ Resume Now" : "⏸️ Pause for 1 Min"}
        </Button>
        {isPaused && (
          <Badge bg="info" className="ms-2">
            Auto-resuming in {pauseTimeLeft}s...
          </Badge>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
          <Spinner animation="border" size="lg" />
          <p className="ms-3">Loading data...</p>
        </div>
      ) : (
        <Row>
          {data.length > 0 ? (
            data.map((subject, index) => {
              const motivationalMessage = getMotivationalMessage(subject.completionRate);

              return (
                <Col md={6} lg={4} key={index}>
                  <Card className="shadow-sm mb-4 animate__animated animate__fadeIn">
                    <Card.Body className="p-4">

                      {/* ✅ Subject Title */}
                      <h5 className="text-center mb-3">{subject.name}</h5>

                      {/* ✅ Progress Bar */}
                      <ProgressBar className="mb-4">
                        <ProgressBar 
                          variant="success" 
                          now={(subject.completed / subject.total) * 100}
                          label={`✅ ${subject.completed} Completed`}
                        />
                        <ProgressBar 
                          variant="warning" 
                          now={(subject.pending / subject.total) * 100}
                          label={`⚠️ ${subject.pending} Pending`}
                        />
                      </ProgressBar>

                      {/* ✅ Motivational Message */}
                      <Alert variant="info" className="text-center">
                        {motivationalMessage}
                      </Alert>

                      {/* ✅ Pie Chart */}
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Completed", value: subject.completed },
                              { name: "Pending", value: subject.pending }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label
                          >
                            <Cell fill="#28a745" />
                            <Cell fill="#ffc107" />
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>

                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          ) : (
            <p className="text-center">No subjects found</p>
          )}
        </Row>
      )}
    </Container>
  );
};

export default LeadershipDashboard;
