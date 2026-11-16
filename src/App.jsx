import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useStore } from './store/AppStore.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Accounts from './pages/Accounts.jsx';
import AccountDetail from './pages/AccountDetail.jsx';
import OpenAccount from './pages/OpenAccount.jsx';
import Transfer from './pages/Transfer.jsx';
import Cashier from './pages/Cashier.jsx';
import Statements from './pages/Statements.jsx';
import Rewards from './pages/Rewards.jsx';
import Live from './pages/Live.jsx';
import Support from './pages/Support.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

function Protected({ children }) {
  const { state } = useStore();
  const loc = useLocation();
  if (!state.auth.loggedIn) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  return children;
}

export default function App() {
  const { state } = useStore();
  return (
    <Routes>
      <Route path="/" element={<Navigate to={state.auth.loggedIn ? '/dashboard' : '/login'} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/open" element={<OpenAccount />} />
        <Route path="/accounts/transfer" element={<Transfer />} />
        <Route path="/accounts/:id" element={<AccountDetail />} />
        <Route path="/cashier" element={<Cashier />} />
        <Route path="/statements" element={<Statements />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/live" element={<Live />} />
        <Route path="/support" element={<Support />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
