import { useEffect, useState } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import Swal from 'sweetalert2';
import withReactContent from "sweetalert2-react-content";
import api from '../api/axios';

const MySwal = withReactContent(Swal);
export default function ResidentsList() {
    const [residents, setResidents] = useState([]);
    const [selectedResident, setSelectedResident] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [ktpFile, setKtpFile] = useState(null);

    const [newResident, setNewResident] = useState({
        nama_lengkap: '',
        status: 'Tetap',
        nomor_telepon: '',
        status_pernikahan: 'Menikah',
    });

    const fetcthResidents = () => {
        api.get('/residents').then((res) => setResidents(res.data));
    };

    useEffect(() => {
        fetcthResidents();
    }, []);

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setNewResident((prev) => ({ ...prev, [name]: value }));
    }

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedResident((prev) => ({ ...prev, [name]: value }));
    }

    const handleEdit = (resident) => {
        setSelectedResident({ ...resident });
        setShowEditModal(true);
    };

    const handleDelete = (id) => {
        MySwal.fire({
            title: 'Apakah Anda yakin?',
            text: "Anda tidak dapat mengembalikan data yang dihapus!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!'
        }).then((result) => {
            if (result.isConfirmed) {
                api.delete(`/residents/${id.id}`).then(() => {
                    fetcthResidents();
                    MySwal.fire(
                        'Terhapus!',
                        'Data telah dihapus.',
                        'success'
                    )
                });
            }
        })
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        for (const key in newResident) {
            formData.append(key, newResident[key]);
        }

        if (ktpFile) {
            formData.append('foto_ktp', ktpFile);
        }

        try {
            await api.post('/residents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setShowAddModal(false);
            setNewResident({
                nama_lengkap: '',
                status: 'Tetap',
                nomor_telepon: '',
                status_pernikahan: 'Menikah',
            });
            setKtpFile(null);
            fetcthResidents();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        for (const key in selectedResident) {
            formData.append(key, selectedResident[key]);
        }
        if (ktpFile) {
            formData.append('foto_ktp', ktpFile);
        }
        try {
            formData.append('_method', 'PUT');
            await api.post(`/residents/${selectedResident.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setShowEditModal(false);
            setSelectedResident(null);
            setKtpFile(null);
            fetcthResidents();
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileChange = (e) => {
        setKtpFile(e.target.files[0]);
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items center mb-3">
                <h2>Daftar Penghuni</h2>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Tambah Penghuni
                </Button>
            </div>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Lengkap</th>
                            <th>Status</th>
                            <th>Nomor Telepon</th>
                            <th>Status Pernikahan</th>
                            <th>KTP</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {residents.map((resident) => (
                            <tr key={resident.id}>
                                <td>{residents.indexOf(resident) + 1}</td>
                                <td>{resident.nama_lengkap}</td>
                                <td>{resident.status}</td>
                                <td>{resident.nomor_telepon}</td>
                                <td>{resident.status_pernikahan}</td>
                                <td>
                                    {resident.foto_ktp ? (
                                        <a href={`http://127.0.0.1:8000/storage/${resident.foto_ktp}`}
                                            target="_blank" rel="noreferrer"
                                        >
                                            Lihat
                                        </a>
                                    ) : (
                                        <span>Tidak ada</span>
                                    )}
                                </td>
                                <td>
                                    <Button variant="warning" style={{ marginRight: '2px' }} onClick={() => handleEdit(resident)}>Edit</Button>
                                    <Button variant="danger" onClick={() => handleDelete(resident)}>Hapus</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* Modal Add */}
                <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                    <Form onSubmit={handleAddSubmit}>
                    <Modal.Header closeButton>
                    <Modal.Title>Tambah Penghuni</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Nama Lengkap</Form.Label>
                        <Form.Control
                        name="nama_lengkap"
                        value={newResident.nama_lengkap}
                        onChange={handleAddChange}
                        required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select name="status" value={newResident.status} onChange={handleAddChange}>
                        <option value="Tetap">Tetap</option>
                        <option value="Kontrak">Kontrak</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Nomor Telepon</Form.Label>
                        <Form.Control
                        name="nomor_telepon"
                        value={newResident.nomor_telepon}
                        onChange={handleAddChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Status Pernikahan</Form.Label>
                        <Form.Select
                        name="status_pernikahan"
                        value={newResident.status_pernikahan}
                        onChange={handleAddChange}
                        >
                        <option value="Menikah">Menikah</option>
                        <option value="Belum Menikah">Belum Menikah</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Upload KTP</Form.Label>
                        <Form.Control
                        type="file"
                        name="foto_ktp"
                        onChange={handleFileChange}
                        accept="image/*"
                        />
                    </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Batal
                    </Button>
                    <Button variant="success" type="submit">
                        Simpan
                    </Button>
                    </Modal.Footer>
                    </Form>
                </Modal>

                {/* Modal Edit */}
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                    <Form onSubmit={handleEditSubmit}>
                        <Modal.Header closeButton>
                            <Modal.Title>Edit Penghuni</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <Form.Group className="mb-3">
                        <Form.Label>Nama Lengkap</Form.Label>
                        <Form.Control
                            name="nama_lengkap"
                            value={selectedResident?.nama_lengkap || ''}
                            onChange={handleEditChange}
                            required
                        />
                        </Form.Group>
                        <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select name="status" value={selectedResident?.status || ''} onChange={handleEditChange}>
                            <option value="Tetap">Tetap</option>
                            <option value="Kontrak">Kontrak</option>
                        </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                        <Form.Label>Nomor Telepon</Form.Label>
                        <Form.Control
                            name="nomor_telepon"
                            value={selectedResident?.nomor_telepon || ''}
                            onChange={handleEditChange}
                        />
                        </Form.Group>
                        <Form.Group className="mb-3">
                        <Form.Label>Status Pernikahan</Form.Label>
                        <Form.Select
                            name="status_pernikahan"
                            value={selectedResident?.status_pernikahan || ''}
                            onChange={handleEditChange}
                        >
                            <option value="Menikah">Menikah</option>
                            <option value="Belum Menikah">Belum Menikah</option>
                        </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                        <Form.Label>Upload KTP</Form.Label>
                        <Form.Control
                            type="file"
                            name="foto_ktp"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                                Batal
                            </Button>
                            <Button variant="success" type="submit">
                                Simpan
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
        </div>
    );
}