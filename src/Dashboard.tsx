import React from 'react';

import { useLoadBalancer } from './m.ts'; 


interface Server {
  id: string;
  name: string;
  isHealthy: boolean;
  connections: number;
  cpu: number;
  latency: number;
  weight: number;
}

const initialMockServers: Server[] = [
  { id: 'A', name: 'Server-A (Primary)', isHealthy: true, connections: 10, cpu: 15, latency: 45, weight: 5 },
  { id: 'B', name: 'Server-B (Replica)', isHealthy: true, connections: 5, cpu: 8, latency: 12, weight: 3 },
  { id: 'C', name: 'Server-C (Overflow)', isHealthy: true, connections: 0, cpu: 0, latency: 15, weight: 1 },
];

export const Dashboard = () => {

  const { 
    servers, 
    strategy, 
    setStrategy, 
    logs, 
    triggerTrafficBurst, 
    routeRequest, 
    toggleServerStatus,
    resetMetrics 
  } = useLoadBalancer(initialMockServers);

  return (
    <div style={{ padding: '20px', direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
      <h2>📋 لوحة تحكم موازن الأحمال (Load Balancer Dashboard)</h2>
      
     
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontWeight: 'bold' }}>اختر خوارزمية التوجيه: </label>
        <select value={strategy} onChange={(e) => setStrategy(e.target.value as any)} style={{ padding: '5px', marginRight: '10px' }}>
          <option value="round-robin">Round Robin (التناوب الدوري)</option>
          <option value="least-connections">Least Connections (الأقل اتصالات)</option>
          <option value="latency-based">Latency-Based (الأسرع استجابة)</option>
          <option value="weighted-round-robin">Weighted Round Robin (التناوب الموزون)</option>
        </select>
      </div>

    
      <div style={{ margin: '15px 0' }}>
        <button onClick={() => routeRequest({ data: "test" })} style={{ padding: '8px 12px', cursor: 'pointer' }}>إرسال طلب واحد 🚀</button>
        <button onClick={() => triggerTrafficBurst(100)} style={{ marginRight: '10px', padding: '8px 12px', cursor: 'pointer', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px' }}>محاكاة ضغط عالي (100 طلب) 💥</button>
        <button onClick={resetMetrics} style={{ marginRight: '10px', padding: '8px 12px', cursor: 'pointer' }}>تصفير العدادات 🔄</button>
      </div>

     
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        {servers.map(server => (
          <div key={server.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: server.isHealthy ? '#e6f4ea' : '#fce8e6', minWidth: '220px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{server.name}</h3>
            <p>الحالة: {server.isHealthy ? '🟢 شغال' : '🔴 متوقف عن الخدمة'}</p>
            <p>الروابط النشطة: <strong>{server.connections}</strong></p>
            <p>استهلاك المعالج: <strong>{server.cpu}%</strong></p>
            <p>سرعة الاستجابة: <strong>{server.latency}ms</strong></p>
            <button onClick={() => toggleServerStatus(server.id)} style={{ marginTop: '10px', width: '100%', padding: '5px', cursor: 'pointer' }}>
              تغيير الحالة يدوياً 🔌
            </button>
          </div>
        ))}
      </div>

    
      <h3 style={{ marginTop: '30px' }}>📜 سجل الأحداث المباشر (Live Logs):</h3>
      <div style={{ background: '#333', color: '#fff', padding: '15px', height: '180px', overflowY: 'scroll', fontFamily: 'monospace', borderRadius: '6px', direction: 'ltr', textAlign: 'left' }}>
        {logs.length === 0 ? "No events logged yet. Trigger traffic to start..." : logs.map((log, index) => <div key={index} style={{ marginBottom: '4px' }}>{log}</div>)}
      </div>
    </div>
  );
};