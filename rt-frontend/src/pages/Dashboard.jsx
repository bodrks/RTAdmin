import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from "recharts";
import api from "../api/axios";

export default function ReportSummary() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    const res = await api.get('/report/monthly-summary?year=2025');
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const result = res.data.map(item => ({
      bulan: months[item.bulan - 1],
      pemasukan: item.pemasukan,
      pengeluaran: item.pengeluaran,
      saldo: item.saldo
    }));
    setData(result);
  };

  return (
    <div style={{ padding: "2rem",minWidth:"1000px", maxWidth: "1000px", marginLeft: "auto", marginRight: "auto" }}>
      <h4>Ringkasan Keuangan (2025)</h4>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bulan" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="pemasukan" fill="#82ca9d" />
          <Bar dataKey="pengeluaran" fill="#ff6b6b" />
          <Bar dataKey="saldo" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}