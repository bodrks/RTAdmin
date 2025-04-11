import { useState, useEffect } from "react";
import { Button, Modal, Form, Table, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../api/axios";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MySwal = withReactContent(Swal);

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);
  const [previewTahunan, setPreviewTahunan] = useState(null);

  const [form, setForm] = useState({
    resident_id: "",
    house_id: null,
    jenis_iuran: "Satpam",
    tipe_pembayaran: "Bulanan",
    periode: "",
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (
      form.tipe_pembayaran === "Tahunan" &&
      form.resident_id &&
      form.periode &&
      form.jenis_iuran
    ) {
      fetchPreviewTahunan(form.resident_id, form.periode, form.jenis_iuran);
    }
  }, [form.resident_id, form.periode, form.jenis_iuran, form.tipe_pembayaran]);

  const fetchPayments = async () => {
    const res = await api.get("/payments");
    setPayments(res.data);
  };

  const fetchResidents = async () => {
    const res = await api.get("/residents-with-house");
    setResidents(res.data);
  };

  const fetchPreviewTahunan = async (resident_id, year, jenis) => {
    if (!resident_id || !year || !jenis) return;
    try {
      const res = await api.get(`/payments/preview-tahunan`, {
        params: {
          resident_id,
          tahun: year,
          jenis_iuran: jenis,
        },
      });
      setPreviewTahunan(res.data);
    } catch (err) {
      if (err.response?.status === 422 || err.response?.status === 400) {
        setPreviewTahunan({
          jumlah_bulan: 0,
          nominal: 0,
          error: err.response?.data?.message,
        });
      } else {
        MySwal.fire("Gagal", "Gagal mendapatkan preview tahunan", "error");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "resident_id") {
      const selected = residents.find((r) => r.id == value);
      setForm((prev) => ({
        ...prev,
        resident_id: value,
        house_id: selected?.house?.id || null,
      }));
      return;
    }

    const updated = { ...form, [name]: value };

    if (name === "tipe_pembayaran") {
      updated.periode = "";
      setPreviewTahunan(null);
    }

    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.tipe_pembayaran === "Tahunan" && previewTahunan?.jumlah_bulan === 0) {
      return MySwal.fire("Gagal", previewTahunan?.error || "Sudah lunas tahun ini", "error");
    }

    try {
      await api.post("/payments", {
        ...form,
        tanggal_bayar: new Date().toISOString().slice(0, 10),
      });

      MySwal.fire("Berhasil", "Pembayaran berhasil ditambahkan", "success");
      setShowModal(false);
      fetchPayments();
    } catch (err) {
      const error = err.response?.data?.message || "Gagal menyimpan pembayaran";
      MySwal.fire("Gagal", error, "error");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Daftar Pembayaran</h4>
        <Button
          onClick={() => {
            fetchResidents();
            setForm({
              resident_id: "",
              house_id: null,
              jenis_iuran: "Satpam",
              tipe_pembayaran: "Bulanan",
              periode: "",
            });
            setPreviewTahunan(null);
            setShowModal(true);
          }}
        >
          Tambah Pembayaran
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>No</th>
            <th>Penghuni</th>
            <th>Rumah</th>
            <th>Total Bayar</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((item, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{item.nama_lengkap}</td>
              <td>{item.nomor_rumah}</td>
              <td>{parseInt(item.total).toLocaleString("id-ID")}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => {
                    setSelected(item);
                    setShowDetail(true);
                  }}
                >
                  Detail
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Tambah Pembayaran</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Penghuni</Form.Label>
              <Form.Select
                name="resident_id"
                value={form.resident_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Pilih Penghuni --</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama_lengkap} - Rumah {r.house?.nomor_rumah}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Jenis Iuran</Form.Label>
              <Form.Select
                name="jenis_iuran"
                value={form.jenis_iuran}
                onChange={handleChange}
              >
                <option value="Satpam">Satpam</option>
                <option value="Kebersihan">Kebersihan</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipe Pembayaran</Form.Label>
              <Form.Select
                name="tipe_pembayaran"
                value={form.tipe_pembayaran}
                onChange={handleChange}
              >
                <option value="Bulanan">Bulanan</option>
                <option value="Tahunan">Tahunan</option>
              </Form.Select>
            </Form.Group>

            {form.tipe_pembayaran === "Bulanan" && (
              <Form.Group className="mb-3">
                <Form.Label>Pilih Bulan</Form.Label>
                <Form.Control
                  type="month"
                  name="periode"
                  value={form.periode}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            )}

            {form.tipe_pembayaran === "Tahunan" && (
                <Form.Group className="mb-3">
                <Form.Label>Pilih Tahun</Form.Label>
                <DatePicker
                    selected={form.periode ? new Date(`${form.periode}-01-01`) : null}
                    onChange={(date) => {
                    const selectedYear = date.getFullYear();
                    handleChange({ target: { name: "periode", value: selectedYear } });
                    }}
                    showYearPicker
                    dateFormat="yyyy"
                    className="form-control"
                    placeholderText="Pilih Tahun"
                />
                </Form.Group>
            )}

            {previewTahunan?.error ? (
            <Alert variant="danger" className="mt-3">
                {previewTahunan.error}
            </Alert>
            ) : previewTahunan && (
            <Alert variant="info" className="mt-3">
                <p>
                Periode: <strong>{dayjs(previewTahunan.periode_awal).format("MMMM YYYY")}</strong>
                – <strong>{dayjs(previewTahunan.periode_akhir).format("MMMM YYYY")}</strong>
                </p>
                <p>Jumlah Bulan: <strong>{previewTahunan.jumlah_bulan}</strong></p>
                <p>Total Bayar: <strong>Rp {parseInt(previewTahunan.nominal).toLocaleString("id-ID")}</strong></p>
            </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button variant="success" type="submit">
              Simpan
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detail Pembayaran - {selected?.nama_lengkap}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected?.payments.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Jenis</th>
                  <th>Tipe</th>
                  <th>Periode</th>
                  <th>Nominal</th>
                  <th>Tanggal Bayar</th>
                </tr>
              </thead>
              <tbody>
                {selected.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.jenis_iuran}</td>
                    <td>{p.tipe_pembayaran}</td>
                    <td>
                      {p.tipe_pembayaran === "Bulanan"
                        ? dayjs(p.periode_awal).format("MMMM YYYY")
                        : `${dayjs(p.periode_awal).format("MMMM YYYY")} - ${dayjs(p.periode_akhir).format("MMMM YYYY")}`}
                    </td>
                    <td>{parseInt(p.nominal).toLocaleString("id-ID")}</td>
                    <td>{dayjs(p.tanggal_bayar).format("DD-MM-YYYY")}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>Belum ada pembayaran.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}