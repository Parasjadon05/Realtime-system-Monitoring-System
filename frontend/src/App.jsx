import React, { useState, useEffect } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Button } from 'react-bootstrap';
import Chart from 'chart.js/auto';

// Custom plugin to display text in the center of Doughnut chart
Chart.register({
  id: 'doughnutCenterText',
  beforeDraw: function(chart) {
    if (chart.config.type === 'doughnut') {
      const { width } = chart;
      const ctx = chart.ctx;
      ctx.restore();
      const fontSize = (width / 6).toFixed(2); // Adjust the font size based on chart size
      ctx.font = `${fontSize}px Arial`;
      ctx.textBaseline = 'middle';

      const text = `${chart.data.datasets[0].data[0]}%`;
      const textX = Math.round((chart.width - ctx.measureText(text).width) / 2);
      const textY = chart.height / 2;

      ctx.fillText(text, textX, textY);
      ctx.save();
    }
  }
});

function App() {
  const [stats, setStats] = useState({
    cpuUsage: 0,
    totalMemory: 0,
    usedMemory: 0,
    totalStorage: 0,
    usedStorage: 0,
    gpuUsage: 0, 
    hbmUsage: 0,
    trainingProgress: 0 // Progress of the ML training
  });
  const [dataHistory, setDataHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0); // To iterate through historical data

  useEffect(() => {
    // Connect to WebSocket server
    const socket = new WebSocket('ws://localhost:8000');

    // Listen for messages from the WebSocket server
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStats(data); // Set the latest stats

      // Update the data history for charting
      setDataHistory(prevHistory => [...prevHistory, data]);
    };

    // Clean up the WebSocket connection on unmount
    return () => {
      socket.close();
    };
  }, []);

  // Handle forward and backward iteration through historical data
  const handleBackward = () => {
    if (historyIndex > 0) setHistoryIndex(historyIndex - 1);
  };

  const handleForward = () => {
    if (historyIndex < dataHistory.length - 1) setHistoryIndex(historyIndex + 1);
  };

  const currentStats = dataHistory[historyIndex] || stats; // Get the stats from history or current stats

  // Define colors for different metrics
  const colors = {
    cpu: ['#FF6384', '#FFCE56'],  // Red and Yellow for CPU
    memory: ['#36A2EB', '#FF6384'],  // Blue and Red for Memory
    storage: ['#4BC0C0', '#FF9F40'],  // Teal and Orange for Storage
    gpu: ['#9966FF', '#FF6384'],  // Purple and Red for GPU
    hbm: ['#FF9F40', '#36A2EB'],  // Orange and Blue for HBM
    training: ['#FFCE56', '#36A2EB'] // Yellow and Blue for Training Progress
  };

  // Options to make the chart look modern and 3D-like
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    cutout: '80%', // Make the doughnut thinner
  };

  // Line Chart Data for All Metrics
  const lineChartData = {
    labels: dataHistory.map((_, i) => `T+${i * 2}s`), // Time labels for X-axis
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: dataHistory.map(d => d.cpuUsage),
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false
      },
      {
        label: 'Memory Usage (%)',
        data: dataHistory.map(d => d.usedMemory),
        borderColor: 'rgba(54, 162, 235, 1)',
        fill: false
      },
      {
        label: 'Storage Usage (%)',
        data: dataHistory.map(d => d.usedStorage),
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false
      },
      {
        label: 'GPU Usage (%)',
        data: dataHistory.map(d => d.gpuUsage),
        borderColor: 'rgba(153, 102, 255, 1)',
        fill: false
      },
      {
        label: 'HBM Usage (%)',
        data: dataHistory.map(d => d.hbmUsage),
        borderColor: 'rgba(255, 159, 64, 1)',
        fill: false
      }
    ]
  };

  return (
    <div className="App">
      <h1>Real-Time System Monitoring with ML Training Progress</h1>
<button>Logs</button>
      {/* Display real-time system stats with titles */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px' }}>
        
        {/* CPU Usage */}
        <div style={{ width: '20%' }}>
          
          <Doughnut
            data={{
              labels: ['Used', 'Available'],
              datasets: [{
                data: [currentStats.cpuUsage, 100 - currentStats.cpuUsage],
                backgroundColor: colors.cpu
              }]
            }}
            options={chartOptions}
            plugins={[{
              id: 'doughnutCenterText',
            }]}
          />
          <h3>CPU Usage (%)</h3>
        </div>

        {/* Memory Usage */}
        <div style={{ width: '20%' }}>
          
          <Doughnut
            data={{
              labels: ['Used', 'Available'],
              datasets: [{
                data: [currentStats.usedMemory, 100 - currentStats.usedMemory],
                backgroundColor: colors.memory
              }]
            }}
            options={chartOptions}
            plugins={[{
              id: 'doughnutCenterText',
            }]}
          />
          <h3>Memory Usage (%)</h3>
        </div>

        {/* Storage Usage */}
        <div style={{ width: '20%' }}>
          
          <Doughnut
            data={{
              labels: ['Used', 'Available'],
              datasets: [{
                data: [currentStats.usedStorage, 100 - currentStats.usedStorage],
                backgroundColor: colors.storage
              }]
            }}
            options={chartOptions}
            plugins={[{
              id: 'doughnutCenterText',
            }]}
          />
          <h3>Storage Usage (%)</h3>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px' }}>
        {/* GPU Usage */}
        <div style={{ width: '20%' }}>
         
          <Doughnut
            data={{
              labels: ['Used', 'Available'],
              datasets: [{
                data: [currentStats.gpuUsage, 100 - currentStats.gpuUsage],
                backgroundColor: colors.gpu
              }]
            }}
            options={chartOptions}
            plugins={[{
              id: 'doughnutCenterText',
            }]}
          />
           <h3>GPU Usage(%)</h3>
        </div>

        {/* HBM Usage */}
        <div style={{ width: '20%' }}>
          
          <Doughnut
            data={{
              labels: ['Used', 'Available'],
              datasets: [{
                data: [currentStats.hbmUsage, 100 - currentStats.hbmUsage],
                backgroundColor: colors.hbm
              }]
            }}
            options={chartOptions}
            plugins={[{
              id: 'doughnutCenterText',
            }]}
          />
          <h3>HBM Usage(%)</h3>
        </div>

        {/* Training Progress */}
        <div style={{ width: '20%' }}>
          
          <Doughnut
            data={{
              labels: ['Completed', 'Remaining'],
              datasets: [{
                data: [currentStats.trainingProgress, 100 - currentStats.trainingProgress],
                backgroundColor: colors.training
              }]
            }}
            options={chartOptions}
            plugins={[{
              id: 'doughnutCenterText',
            }]}
          />
          <h3>Training Progress (%)</h3>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <Button onClick={handleBackward} disabled={historyIndex === 0}>Previous</Button>
        <Button onClick={handleForward} disabled={historyIndex >= dataHistory.length - 1}>Next</Button>
      </div>
      {/* Line Chart for All Metrics */}
      <div style={{ width: '80%', margin: '0 auto' }}>
        <Line data={lineChartData} />
      </div>

      {/* Playback Controls */}
    
    </div>
  );
}

export default App;
