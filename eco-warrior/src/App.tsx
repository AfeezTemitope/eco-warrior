import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PostDetail from './components/PostDetail';
import About from './components/About';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './components/AdminLogin';
import ProtectedRoute from './lib/ProtectedRoute';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/posts/:id" element={<PostDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route
                    path="/admin-panel"
                    element={
                        <ProtectedRoute>
                            <AdminPanel />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
