import React, { useState, useEffect } from 'react';
// 引入组件专属样式文件
import './App.css';

function App() {
  // 状态管理：locations 用于存储历史位置数组，status 用于在界面显示当前的操作提示信息
  const [locations, setLocations] = useState([]);
  const [status, setStatus] = useState('');

  // 1. 初始化 (Read - CRUD 的读取)
  // useEffect 钩子，传入空数组 [] 表示只在组件第一次加载时运行一次
  useEffect(() => {
    // 尝试从浏览器的 localStorage 中读取键名为 'travel_locations' 的数据
    // 如果没有数据，则返回 null，此时使用 || [] 赋予一个空数组作为默认值
    const savedLocations = JSON.parse(localStorage.getItem('travel_locations')) || [];
    // 将读取到的数据存入 React 的状态中，渲染到界面上
    setLocations(savedLocations);
  }, []);

  // 2. 写入本地存储 (Create/Update - CRUD 的创建和更新)
  // 这是一个辅助函数，用于统一处理状态更新和本地存储同步
  const saveToLocal = (newLocs) => {
    setLocations(newLocs);
    // localStorage 只能存储字符串，所以需要用 JSON.stringify 将数组转换为字符串
    localStorage.setItem('travel_locations', JSON.stringify(newLocs));
  };

  // 3. 获取地理位置 (Geolocation API)
  const handleRecordLocation = () => {
    setStatus('Fetching location...');
    
    // 检查当前浏览器是否支持 Geolocation API
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by your browser');
      return;
    }

    // 调用 API 获取当前设备位置
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 从返回的位置对象中提取纬度(latitude)和经度(longitude)
        const { latitude, longitude } = position.coords;
        
        // 构建一个新的位置记录对象
        const newRecord = {
          id: Date.now(), // 使用当前时间戳作为唯一标识符
          lat: latitude.toFixed(6), // 保留六位小数
          lng: longitude.toFixed(6),
          timestamp: new Date().toLocaleString(), // 转换为可读的本地时间字符串
          synced: false // 标记该记录是否已经成功发送给服务器，初始为 false
        };

        // 将新记录添加到现有记录数组的最前面
        const updatedLocations = [newRecord, ...locations];
        // 保存到本地存储
        saveToLocal(updatedLocations);
        
        // 尝试将新记录同步到服务器
        attemptSync(newRecord.id, updatedLocations);
      },
      (error) => {
        // 如果用户拒绝授权或获取失败，显示错误信息
        setStatus('Failed to get location: ' + error.message);
      }
    );
  };

  // 4. 模拟发送数据到服务器 (断网及失败重试逻辑)
  const attemptSync = (id, currentLocations) => {
    setStatus('Attempting to sync to server...');
    
    // 检查设备的网络连接状态 (Offline Capabilities 离线能力检测)
    if (!navigator.onLine) {
      setStatus('Offline. Saved to local storage.');
      return;
    }

    // 使用 setTimeout 模拟网络请求的延迟 (1秒)
    setTimeout(() => {
      // 随机生成一个布尔值，模拟 50% 的概率网络请求成功或失败
      // 这可以用来向老师展示当网络不佳时，应用如何引导用户使用 SMS 备用方案
      const isSuccess = Math.random() > 0.5; 
      
      if (isSuccess) {
        setStatus('Location synced to server successfully!');
        // 如果成功，遍历数组，将对应 id 的记录的 synced 状态改为 true
        const updated = currentLocations.map(loc => 
          loc.id === id ? { ...loc, synced: true } : loc
        );
        // 更新本地存储
        saveToLocal(updated);
      } else {
        setStatus('Sync failed. Please use SMS backup.');
      }
    }, 1000);
  };

  // 5. 删除单条记录 (Delete - CRUD 的删除)
  const handleDelete = (id) => {
    // 使用 filter 方法过滤掉指定 id 的记录，保留其他记录
    const updated = locations.filter(loc => loc.id !== id);
    saveToLocal(updated);
  };

  // 6. 清空所有记录
  const handleClearAll = () => {
    // 传入空数组，清空状态和本地存储
    saveToLocal([]);
    setStatus('History cleared');
  };

  // 渲染界面的 JSX 代码
  return (
    <div className="container">
      <h1>SafeTravel Locator</h1>
      <p>Record your location periodically for travel safety.</p>
      
      {/* 触发记录位置的按钮 */}
      <button onClick={handleRecordLocation} className="btn-primary">
        Record & Send Location
      </button>

      {/* 显示当前状态提示 */}
      <p className="status-msg">{status}</p>

      <div className="history-header">
        <h2>Location History</h2>
        {/* 只有当存在记录时，才显示清空按钮 */}
        {locations.length > 0 && (
          <button onClick={handleClearAll} className="btn-clear">Clear All</button>
        )}
      </div>

      <ul className="location-list">
        {/* 遍历 locations 数组，渲染每一条记录 */}
        {locations.map((loc) => (
          <li key={loc.id} className="location-card">
            <div className="loc-info">
              <div><strong>Time:</strong> {loc.timestamp}</div>
              <div><strong>Coordinates:</strong> {loc.lat}, {loc.lng}</div>
              <div className="status-badge">
                {/* 根据 synced 状态显示不同的文字 */}
                {loc.synced ? 'Synced' : 'Not Synced'}
              </div>
            </div>
            
            <div className="card-actions">
              {/* SMS API: 如果未同步，提供通过系统短信发送数据的选项 */}
              {!loc.synced && (
                <a 
                  // 使用 sms: 协议调用手机原生短信应用，并预填入包含经纬度的内容
                  href={`sms:?body=Safety Alert! My last location is Lat:${loc.lat}, Lng:${loc.lng} Time:${loc.timestamp}`} 
                  className="btn-sms"
                >
                  Send via SMS
                </a>
              )}
              {/* 删除按钮 */}
              <button onClick={() => handleDelete(loc.id)} className="btn-danger">Delete</button>
            </div>
          </li>
        ))}
        {/* 如果数组为空，显示暂无记录的提示 */}
        {locations.length === 0 && <p className="empty-state">No records found</p>}
      </ul>
    </div>
  );
}

export default App;