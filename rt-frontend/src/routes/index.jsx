import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Residents from '../pages/Residents';
import Houses from '../pages/Houses';
import Payments from '../pages/Payments';
import Report from '../pages/Report';
import MonthlyReport from '../pages/MonthlyReport';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/penghuni" element={<Residents />} />
            <Route path="/rumah" element={<Houses />} />
            <Route path="/pembayaran" element={<Payments />} />
            <Route path="/laporan-bulanan" element={<MonthlyReport />} />
        </Routes>
    );
}