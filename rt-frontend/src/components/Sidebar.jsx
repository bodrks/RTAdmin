import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-title">RT Admin</div>
      <Nav className="flex-column">
        <Nav.Link as={NavLink} to="/" end>Dashboard</Nav.Link>
        <Nav.Link as={NavLink} to="/penghuni">Penghuni</Nav.Link>
        <Nav.Link as={NavLink} to="/rumah">Rumah</Nav.Link>
        <Nav.Link as={NavLink} to="/pembayaran">Pembayaran Iuran</Nav.Link>
        <Nav.Link as={NavLink} to="/laporan-bulanan">Laporan Bulanan</Nav.Link>
      </Nav>
    </div>
  );
}