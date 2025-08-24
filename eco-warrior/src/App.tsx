import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Header from './components/Header';
import Home from './pages/Home';
import PostDetail from './components/PostDetail';
import About from './components/About'
import AdminPanel from './pages/AdminPanel';
// import ProtectedRoute from "./components/ProtectedRoute.tsx";
// import AdminLogin from "./components/AdminLogin.tsx";

function App() {
  return (
    <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/about" element={<About />} />
              {/* Admin route (admins + superadmins allowed) */}
              <Route path="/admin-panel" element={< AdminPanel/>} />
              {/* Superadmin-only route */}
              {/*<Route*/}
              {/*    path="/superadmin"*/}
              {/*    element={*/}
              {/*        <ProtectedRoute requiredRole="superadmin">*/}
              {/*            <SuperAdminPanel />*/}
              {/*        </ProtectedRoute>*/}
              {/*    }*/}
              {/*/>*/}
            {/*<Route path="/admin-panel" element={<AdminPanel />} />*/}
          </Routes>
    </Router>
  );
}

export default App;