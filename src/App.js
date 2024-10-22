import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/Landing';
import HomePage from './Pages/Home';
import EventsPage from './Pages/Events';
import LoveStoryPage from './Pages/OurStory';
import RegistryPage from './Pages/Registry';
import UploadPage from './Pages/Upload';
import Gallery from './Pages/Gallery';
// Import other pages as needed

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/story" element={<LoveStoryPage />} />
        <Route path="/registry" element={<RegistryPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/gallery" element={<Gallery />} />



   
      </Routes>
      
    </Router>
    
  );
};

export default App;
