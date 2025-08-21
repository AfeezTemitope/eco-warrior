import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Header from './components/Header';
import Home from './pages/Home';
import PostDetail from './components/PostDetail';
import About from './components/About'
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
          </Routes>
    </Router>
  );
}

export default App;