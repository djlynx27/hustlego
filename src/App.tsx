import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminScreen from './pages/AdminScreen';
import DriveScreen from './pages/DriveScreen';
import EventsScreen from './pages/EventsScreen';
import TodayScreen from './pages/TodayScreen';
import PlanningScreen from './pages/PlanningScreen';
import ZonesScreen from './pages/ZonesScreen';
import NotFound from './pages/NotFound';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminScreen />} />
            <Route path="/drive" element={<DriveScreen />} />
            <Route path="/events" element={<EventsScreen />} />
            <Route path="/today" element={<TodayScreen />} />
            <Route path="/planning" element={<PlanningScreen />} />
            <Route path="/zones" element={<ZonesScreen />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
