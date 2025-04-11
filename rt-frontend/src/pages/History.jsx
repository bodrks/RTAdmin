import { useEfect, useState } from "react";
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Table } from 'react-bootstrap';

export default function HouseHistory() {
    const { id } = useParams();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        api.get(`/houses/${id}/history`)
            .then((res) => setHistory(res.data))
            .catch((err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong while fetching the history!',
                });
            });
    }, [id]);

    return (
        <div>
            <h2>Riwayat Penghuni Rumah #{id}</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Nama Penghuni</th>
                        <th>Tanggal Masuk</th>
                        <th>Tanggal Keluar</th>
                    </tr>
                </thead>
                <tbody>
                    {history.length === 0 ? (
                        <tr>
                            <td colSpan={3}>Belum ada data</td>
                        </tr>
                    ) : (
                        history.map((item) => (
                            <tr key={item.id}>
                                <td>{item.resident?.nama_lengkap}</td>
                                <td>{item.tanggal_mulai}</td>
                                <td>{item.tanggal_selesai || 'Masih tinggal'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
}