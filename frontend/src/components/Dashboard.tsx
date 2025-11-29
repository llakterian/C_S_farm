import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { useVoice } from '../hooks/useVoice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Entity, Task } from '../types/schema';

export const Dashboard: React.FC = () => {
  const { speak } = useVoice();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [yieldData, setYieldData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    speak('Good morning! Here is your farm dashboard.');
  }, [speak]);

  const loadData = async () => {
    const ents = await db.getAllEntities();
    const tsks = await db.getAllTasks();
    setEntities(ents);
    setTasks(tsks);
    // Mock yield data
    setYieldData([
      { month: 'Jan', tea: 100, dairy: 50 },
      { month: 'Feb', tea: 120, dairy: 55 },
      { month: 'Mar', tea: 90, dairy: 60 },
    ]);
  };

  const alerts = entities.filter(e => e.healthStatus === 'critical');

  useEffect(() => {
    if (alerts.length) speak(`You have ${alerts.length} critical alerts.`);
  }, [alerts, speak]);

  return (
    <div className="dashboard p-6">
      <h1 className="text-3xl font-bold mb-6">Good Morning, Farmer!</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Today's Tasks</h3>
          <p className="text-2xl">{tasks.filter(t => t.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Healthy Crops</h3>
          <p className="text-2xl">{entities.filter(e => e.healthStatus === 'healthy').length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Alerts</h3>
          <p className="text-2xl text-red-500">{alerts.length}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Yield Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={yieldData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="tea" stroke="#8884d8" />
            <Line type="monotone" dataKey="dairy" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <button
        onClick={() => speak('Dashboard summary: You have pending tasks and healthy entities.')}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Voice Summary
      </button>
    </div>
  );
};
