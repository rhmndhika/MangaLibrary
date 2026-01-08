import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Search from './pages/Search';
import Reader from './pages/Reader';
import Favorites from './pages/Favorites';
import LatestPage from './pages/LatestPage';
import Login from './pages/Login'; // Pastikan import komponen Login, bukan LogIn (icon)

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/search" element={<Search />} />
            <Route path="/manga/:id" element={<Detail />} />
            <Route path="/reader/:chapterId" element={<Reader />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/latest" element={<LatestPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;