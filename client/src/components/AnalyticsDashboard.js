import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import axios from 'axios';

const AnalyticsDashboard = ({ documentId }) => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await axios.get(`/api/get-analytics/${documentId}`);
        setAnalytics(data.analytics);
      } catch (error) {
        console.error('Failed to fetch analytics:', error.message);
      }
    };
    fetchAnalytics();
  }, [documentId]);

  if (!analytics) return <p>Loading analytics...</p>;

  return (
    <div>
      <h2>Document Analytics</h2>
      <BarChart width={600} height={300} data={analytics.editHistory}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="edits" fill="#8884d8" />
      </BarChart>
      <p>Last Modified: {new Date(analytics.lastModified).toLocaleString()}</p>
      <h4>Collaborators:</h4>
      <ul>
        {analytics.collaborators.map((collaborator, index) => (
          <li key={index}>{collaborator}</li>
        ))}
      </ul>
    </div>
  );
};

export default AnalyticsDashboard;
