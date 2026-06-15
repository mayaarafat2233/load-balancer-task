import React, { useState, useEffect } from 'react';

// تعريف بنية السيرفر
interface Server {
  id: string;
  name: string;
  weight: number;
  activeConnections: number;
  status: 'healthy' | 'unhealthy';
  processedRequests: number;
}

// تعريف بنية الطلب (Log)
interface RequestLog {
  id: string;
  timestamp: string;
  algorithm: string;
  assignedServer: string;
  status: 'Success' | 'Failed';
}

export default function App() {
  // 1. إعداد السيرفرات الافتراضية
  const [servers, setServers] = useState<Server[]>([
    { id: '1', name: 'Server A (Main)', weight: 5, activeConnections: 0, status: 'healthy', processedRequests: 0 },
    { id: '2', name: 'Server B (Backup)', weight: 3, activeConnections: 0, status: 'healthy', processedRequests: 0 },
    { id: '3', name: 'Server C (Light)', weight: 1, activeConnections: 0, status: 'healthy', processedRequests: 0 },
  ]);

  // 2. حالات التحكم بالواجهة
  const [algorithm, setAlgorithm] = useState<'RR' | 'WRR' | 'LC'>('RR');
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [rrIndex, setRrIndex] = useState<number>(0); // مؤشر الـ Round Robin
  const [wrrIndex, setWrrIndex] = useState<number>(0); // مؤشر الـ Weighted
  const [wrrCurrentWeight, setWrrCurrentWeight] = useState<number>(0);

  // تفعيل محاكاة تغير الاتصالات النشطة تلقائياً لإعطاء حيوية للتاسك
  useEffect(() => {
    const interval = setInterval(() => {
      setServers(prev => prev.map(srv => {
        if (srv.status === 'unhealthy') return { ...srv, activeConnections: 0 };
        // زيادة أو نقصان عشوائي في الاتصالات النشطة لمحاكاة الواقع
        const change = Math.floor(Math.random() * 3) - 1; 
        const newConn = Math.max(0, srv.activeConnections + change);
        return { ...srv, activeConnections: newConn };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 3. توجيه الطلبات بناءً على الخوارزمية المختارة
  const handleSendRequest = () => {
    const healthyServers = servers.filter(s => s.status === 'healthy');
    
    if (healthyServers.length === 0) {
      alert("جميع السيرفرات خارج الخدمة حالياً!");
      return;
    }

    let selectedServer: Server | null = null;

    // --- خوارزمية Round Robin ---
    if (algorithm === 'RR') {
      const index = rrIndex % healthyServers.length;
      selectedServer = healthyServers[index];
      setRrIndex(prev => prev + 1);
    } 
    // --- خوارزمية Weighted Round Robin ---
    else if (algorithm === 'WRR') {
      // البحث عن السيرفر ذو الوزن الأعلى المتاح
      let maxWeightServer = healthyServers[0];
      for (let i = 1; i < healthyServers.length; i++) {
        if (healthyServers[i].weight > maxWeightServer.weight) {
          maxWeightServer = healthyServers[i];
        }
      }
      selectedServer = maxWeightServer; // توجيه ذكي مبسط للأوزان
    } 
    // --- خوارزمية Least Connections ---
    else if (algorithm === 'LC') {
      // اختيار السيرفر الذي يملك أقل عدد اتصالات نشطة حالياً
      selectedServer = healthyServers.reduce((prev, curr) => 
        prev.activeConnections < curr.activeConnections ? prev : curr
      );
    }

    if (selectedServer) {
      const targetId = selectedServer.id;
      
      // تحديث إحصائيات السيرفر المستهدف
      setServers(prev => prev.map(srv => {
        if (srv.id === targetId) {
          return {
            ...srv,
            activeConnections: srv.activeConnections + 1,
            processedRequests: srv.processedRequests + 1
          };
        }
        return srv;
      }));

      // إضافة سجل جديد للعملية (Log)
      const newLog: RequestLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        algorithm: algorithm === 'RR' ? 'Round Robin' : algorithm === 'WRR' ? 'Weighted RR' : 'Least Connections',
        assignedServer: selectedServer.name,
        status: 'Success'
      };

      setLogs(prev => [newLog, ...prev].slice(0, 10)); // الاحتفاظ بآخر 10 طلبات فقط
    }
  };

  // تغيير حالة السيرفر (تشغيل / إيقاف)
  const toggleServerStatus = (id: string) => {
    setServers(prev => prev.map(srv => 
      srv.id === id ? { ...srv, status: srv.status === 'healthy' ? 'unhealthy' : 'healthy', activeConnections: 0 } : srv
    ));
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '20px', color: '#333' }}>
      
      {/* الهيدر الرئيسي */}
      <header style={{ textAlign: 'center', marginBottom: '30px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', padding: '25px', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 10px 0' }}>Distributed Systems Load Balancer Dashboard</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>محاكاة تفاعلية لأنظمة توزيع الأحمال الموزعة لمشروع الجامعة</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* القسم الأيسر: التحكم والخوارزميات */}
        <section style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', color: '#4f46e5' }}>🤖 تفعيل الخوارزمية والتحكم</h2>
          
          <div style={{ marginBottom: '20px', marginTop: '15px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>اختر خوارزمية توزيع الحمل:</label>
            <select 
              value={algorithm} 
              onChange={(e) => setAlgorithm(e.target.value as any)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }}
            >
              <option value="RR">Round Robin (التوزيع الدوري المنسق)</option>
              <option value="WRR">Weighted Round Robin (التوزيع بناءً على وزن السيرفر)</option>
              <option value="LC">Least Connections (التوجيه لأقل سيرفر مضغوط)</option>
            </select>
          </div>

          <button 
            onClick={handleSendRequest}
            style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
          >
            🚀 إرسال طلب جديد (Send HTTP Request)
          </button>

          {/* سجل العمليات المباشر */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ color: '#1e293b' }}>⏱️ سجل الطلبات الفوري (Live Logs)</h3>
            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', backgroundColor: '#f8fafc' }}>
              {logs.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center' }}>اضغط على الزر بالأعلى لبدء إرسال طلبات للموازن...</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>
                    <span style={{ color: '#64748b' }}>[{log.timestamp}]</span>
                    <strong style={{ color: '#4f46e5' }}>{log.algorithm}</strong>
                    <span style={{ color: '#0284c7' }}>➡️ {log.assignedServer}</span>
                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{log.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* القسم الأيمن: حالة السيرفرات الحية */}
        <section style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', color: '#4f46e5' }}>🖥️ حالة السيرفرات (Cluster Nodes)</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {servers.map(server => (
              <div 
                key={server.id} 
                style={{ 
                  padding: '15px', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0', 
                  backgroundColor: server.status === 'healthy' ? '#fff' : '#fef2f2',
                  borderLeft: server.status === 'healthy' ? '6px solid #4f46e5' : '6px solid #ef4444',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '18px', color: '#1e293b' }}>{server.name}</strong>
                  <button 
                    onClick={() => toggleServerStatus(server.id)}
                    style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', backgroundColor: server.status === 'healthy' ? '#fee2e2' : '#dcfce7', color: server.status === 'healthy' ? '#ef4444' : '#15803d' }}
                  >
                    {server.status === 'healthy' ? 'محاكاة إسقاط السيرفر ❌' : 'إعادة تشغيل السيرفر  ✅'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '14px', color: '#475569' }}>
                  <div>الوزن المحدد: <strong>{server.weight}</strong></div>
                  <div>الاتصالات الحالية: <strong style={{ color: '#0284c7' }}>{server.activeConnections}</strong></div>
                  <div>الطلبات المعالجة: <strong style={{ color: '#16a34a' }}>{server.processedRequests}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}