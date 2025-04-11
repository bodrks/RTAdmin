import { useEffect, useState } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../api/axios";

const MySwal = withReactContent(Swal);
export default function Houses() {
    const [houses, setHouses]                       = useState([]);
    const [selectedHouse, setSelectedHouse]         = useState(null);
    const [showAddModal, setShowAddModal]           = useState(false);
    const [showEditModal, setShowEditModal]         = useState(false);
    const [showHistoryModal, setShowHistoryModal]   = useState(false);
    const [historyData, setHistoryData]             = useState([]);
    const [assignModal, setAssignModal]             = useState(false);
    const [assignData, setAssignData]               = useState({
        resident_id: '',
        tanggal_mulai: '',
    });
    const [residents, setResidents]                 = useState([]);

    const [newHouse, setNewHouse]           = useState({
        nomor_rumah: "",
        status_penghuni: "Dihuni",
    });

    const fetchHouses = () => {
        api.get('/houses').then((res) => setHouses(res.data));
    };

    useEffect(() => {
        fetchHouses();
    }, [assignModal]);

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setNewHouse((prev) => ({ ...prev, [name]: value }));
    }

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedHouse((prev) => ({ ...prev, [name]: value }));
    }

    const handleEdit = (house) => {
        setSelectedHouse({ ...house });
        setShowEditModal(true);
    }

    const handleDelete = (id) => {
        MySwal.fire({
            title: "Apakah anda yakin?",
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Tidak",
        }).then((result) => {
            if (result.isConfirmed) {
                api.delete(`/houses/${id}`).then(() => {
                    fetchHouses();
                    MySwal.fire("Terhapus!", "Data berhasil dihapus.", "success");
                });
            }
        });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        for (const key in newHouse) {
            formData.append(key, newHouse[key]);
        }

        try {
            await api.post("/houses", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setShowAddModal(false);
            setNewHouse({
                nomor_rumah: "",
                status_penghuni: "Dihuni",
            });
            fetchHouses();
            MySwal.fire("Berhasil!", "Data berhasil ditambahkan.", "success");
        } catch (err) {
            MySwal.fire("Gagal!", "Data gagal ditambahkan.", "error");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        for (const key in selectedHouse) {
            formData.append(key, selectedHouse[key]);
        }

        try {
            await api.put(`/houses/${selectedHouse.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setShowEditModal(false);
            setSelectedHouse(null);
            fetchHouses();
            MySwal.fire("Berhasil!", "Data berhasil diubah.", "success");
        } catch (err) {
            MySwal.fire("Gagal!", "Data gagal diubah.", "error");
        }
    };

    const fetchHouseHistory = async (houseId) => {
        try {
            const res = await api.get(`/houses/${houseId}/history`);
            setHistoryData(res.data);
            setShowHistoryModal(true);
        } catch (err) {
            MySwal.fire("Gagal!", "Data gagal diambil.", "error");
        }
    };

    const openAssignModal = async (house) => {
        setSelectedHouse(house);

        try {
            const res = await api.get(`/available-residents/${house.id}`);
            setResidents(res.data);
            setAssignData({
                resident_id: '',
                tanggal_mulai: '',
            });
            setAssignModal(true);
        } catch (err) {
            MySwal.fire("Gagal!", "Data gagal diambil.", "error");
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await api.post('/assign-resident', {
                ...assignData,
                house_id: selectedHouse.id,
            });
            setAssignModal(false);
            setAssignData({ resident_id: '', tanggal_mulai: ''});
            fetchHouses();
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Data gagal ditambahkan.";
            MySwal.fire("Gagal!", errorMessage, "error");
        }
    };

    const handleLeave = async (houseId) => {
        const confirm = await MySwal.fire({
            title: 'Apakah anda yakin?',
            text: 'Penghuni akan dianggap keluar dari rumah.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, keluarkan',
            cancelButtonText: 'Batal',
        });

        if (!confirm.isConfirmed) return;

        try {
            await api.put(`/residents-leave/${houseId}`);
            const response = await api.get('/houses');
            setHouses(response.data);
            MySwal.fire("Berhasil!", "Penghuni berhasil dikeluarkan.", "success");
            fetchHouses();
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Data gagal diubah.";
            MySwal.fire("Gagal!", errorMessage, "error");
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items center mb-3">
                <h2>Data Rumah</h2>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Tambah Rumah
                </Button>
            </div>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nomor Rumah</th>
                            <th>Status Penghuni</th>
                            <th>Penghuni</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {houses.map((house, index) => (
                            <tr key={house.id}>
                                <td>{index + 1}</td>
                                <td>{house.nomor_rumah}</td>
                                <td>{house.status_penghuni}</td>
                                <td>{house.current_resident?.resident?.nama_lengkap || '-'}</td>
                                <td>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={() => handleEdit(house)}
                                        className="me-2"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(house.id)}
                                        className="me-2"
                                    >
                                        Hapus
                                    </Button>
                                    <Button
                                        variant="info"
                                        size="sm"
                                        onClick={() => fetchHouseHistory(house.id)}
                                    >
                                        Riwayat
                                    </Button>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => openAssignModal(house)}
                                        className="ms-2"
                                    >
                                        Assign
                                    </Button>
                                    {house.current_resident && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleLeave(house.id)}
                                            className="ms-2"
                                        >
                                            Keluar
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* Add Modal */}
                <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Tambah Rumah</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleAddSubmit}>
                            <Form.Group controlId="formBasicNomorRumah">
                                <Form.Label>Nomor Rumah</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Masukkan Nomor Rumah"
                                    name="nomor_rumah"
                                    value={newHouse.nomor_rumah}
                                    onChange={handleAddChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicStatusPenghuni">
                                <Form.Label>Status Penghuni</Form.Label>
                                <Form.Select
                                    name="status_penghuni"
                                    value={newHouse.status_penghuni}
                                    onChange={handleAddChange}
                                >
                                    <option value="Dihuni">Dihuni</option>
                                    <option value="Tidak dihuni">Tidak dihuni</option>
                            </Form.Select>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Batal
                        </Button>
                        <Button variant="success" type="submit">
                            Simpan
                        </Button>
                    </Modal.Footer>
                </Modal>
                {/* Edit Modal */}
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Rumah</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleEditSubmit}>
                            <Form.Group controlId="formBasicNomorRumah">
                                <Form.Label>Nomor Rumah</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Masukkan Nomor Rumah"
                                    name="nomor_rumah"
                                    value={selectedHouse?.nomor_rumah}
                                    onChange={handleEditChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicStatusPenghuni">
                                <Form.Label>Status Penghuni</Form.Label>
                                <Form.Select
                                    name="status_penghuni"
                                    value={selectedHouse?.status_penghuni}
                                    onChange={handleEditChange}
                                >
                                    <option value="Dihuni">Dihuni</option>
                                    <option value="Tidak dihuni">Tidak dihuni</option>
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Batal
                        </Button>
                        <Button variant="success" type="submit">
                            Simpan
                        </Button>
                    </Modal.Footer>
                </Modal>
                {/* History Modal */}
                <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Riwayat Penghuni</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {historyData.length === 0 ? (
                            <p>Belum ada data penghuni.</p>
                        ) : (
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Nama Penghuni</th>
                                        <th>Tanggal Masuk</th>
                                        <th>Tanggal Keluar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyData.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.resident?.nama_lengkap}</td>
                                            <td>{item.tanggal_mulai}</td>
                                            <td>{item.tanggal_selesai || 'Masih tinggal'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Modal.Body>
                </Modal>

                {/* Assign Modal */}
                <Modal show={assignModal} onHide={() => setAssignModal(false)}>
                    <Form onSubmit={handleAssign}>
                        <Modal.Header closeButton>
                        <Modal.Title>Assign Penghuni ke Rumah {selectedHouse?.nomor_rumah}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Pilih Penghuni</Form.Label>
                            <Form.Select
                            name="resident_id"
                            value={assignData.resident_id}
                            onChange={(e) => setAssignData({ ...assignData, resident_id: e.target.value })}
                            >
                            <option value="">-- Pilih Penghuni --</option>
                            {residents.map((r) => (
                                <option key={r.id} value={r.id}>{r.nama_lengkap}</option>
                            ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Tanggal Mulai</Form.Label>
                            <Form.Control
                            type="date"
                            value={assignData.tanggal_mulai}
                            onChange={(e) => setAssignData({ ...assignData, tanggal_mulai: e.target.value })}
                            />
                        </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={() => setAssignModal(false)}>Batal</Button>
                        <Button variant="primary" type="submit">Simpan</Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </div>
    )
}