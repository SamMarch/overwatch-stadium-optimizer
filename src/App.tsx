import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import OptimizerPage from './pages/OptimizerPage';
import InventoryPage from './pages/InventoryPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/optimizer" element={<OptimizerPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
