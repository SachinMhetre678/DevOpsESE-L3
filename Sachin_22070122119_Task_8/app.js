const express = require("express");
const app = express();
const port = 5000;

// 🧊 GENTLE CPU FUNCTION - Won't overheat your laptop
function gentleCpuTask() {
  let result = 0;

  // Light nested loops - gentle on CPU
  for (let i = 0; i < 300; i++) {
    for (let j = 0; j < 300; j++) {
      result += Math.sqrt(i * j) * Math.sin(i);
    }
  }

  // Light Fibonacci
  let fibonacci = (n) => {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  };

  result += fibonacci(25); // Light calculation

  return result;
}

app.get("/", (req, res) => {
  res.send("🚀 IoT Sensor API - Home (GENTLE CPU VERSION)");
});

app.get("/data", (req, res) => {
  res.json({
    sensorId: "sensor-001",
    temperature: Math.random() * 50 + 20,
    humidity: Math.random() * 100,
    timestamp: new Date().toISOString(),
  });
});

// 🎯 GENTLE CPU LOAD ENDPOINT
app.get("/cpu-load", (req, res) => {
  const startTime = Date.now();

  const result = gentleCpuTask();

  const endTime = Date.now();
  const duration = endTime - startTime;

  res.json({
    message: "Gentle CPU calculation completed",
    calculationTime: duration + "ms",
    cpuIntensity: "GENTLE",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`📡 GENTLE CPU IoT Sensor API running on port ${port}`);
});
