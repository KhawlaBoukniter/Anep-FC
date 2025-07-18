import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Dashboard from "./pages/Dashboard.tsx";
import Home from "./pages/Home.tsx";
import AboutPage from "./components/AboutPage.tsx";
import FormationPage from "./components/FormationPage.tsx";
import ProfilePage from "./pages/profile.tsx";
import Indisponibilite from "./components/Indisponibilite.tsx";
import FormationPersonnel from "./components/formationPersonnel.tsx";
import "./App.css";

// Configuration du client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile/:employeeId" element={<ProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/formation" element={<FormationPage />} />
            <Route path="/indisponibilite" element={<Indisponibilite />} />
            <Route path="/formationPersonnel" element={<FormationPersonnel />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;