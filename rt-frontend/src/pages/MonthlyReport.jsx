import { useEffect, useState } from "react";
import { Form, Button, Table, Card } from "react-bootstrap";
import api from "../api/axios";
import dayjs from "dayjs";

export default function MonthlyReport() {
  const [bulan, setBulan] = useState(() => dayjs().format("YYYY-MM"));
  const [data, setData] = useState(null);

  const fetchReport = async () => {
    const res = await api.get("/report/monthly-detail", {
      params: { bulan },
    });
    setData(res.data);
  };

  useEffect(() => {
    fetchReport();
  }, [bulan]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Laporan Bulanan</h4>
        <Form.Control
          type="month"
          value={bulan}
          onChange={(e) => setBulan(e.target.value)}
          style={{ width: 200 }}
        />
      </div>

      {data && (
        <>
          <Card className="mb-3">
            <Card.Body>
              <h5>Ringkasan Bulan {dayjs(bulan).format("MMMM YYYY")}</h5>
              <p>Total Pemasukan: <strong>Rp {data.total_pemasukan.toLocaleString("id-ID")}</strong></p>
              <p>Total Pengeluaran: <strong>Rp {data.total_pengeluaran.toLocaleString("id-ID")}</strong></p>
              <p>Saldo Bulan Ini: <strong>Rp {data.saldo.toLocaleString("id-ID")}</strong></p>
            </Card.Body>
          </Card>

          <h5 className="mt-4">Daftar Pemasukan</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Penghuni</th>
                <th>Jenis Iuran</th>
                <th>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {data.pemasukan.map((item) => (
                <tr key={item.id}>
                  <td>{dayjs(item.tanggal_bayar).format("DD-MM-YYYY")}</td>
                  <td>{item.resident?.nama_lengkap || "-"}</td>
                  <td>{item.jenis_iuran}</td>
                  <td>Rp {parseInt(item.nominal).toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h5 className="mt-4">Daftar Pengeluaran</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama Pengeluaran</th>
                <th>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {data.pengeluaran.map((item) => (
                <tr key={item.id}>
                  <td>{dayjs(item.tanggal).format("DD-MM-YYYY")}</td>
                  <td>{item.nama_pengeluaran}</td>
                  <td>Rp {parseInt(item.nominal).toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
}