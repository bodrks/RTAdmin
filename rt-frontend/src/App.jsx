import Sidebar from './components/Sidebar';
import AppRoutes from './routes';
import { Container } from 'react-bootstrap';

export default function App() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', padding: '20px', width: '100%' }}>
        <Container fluid>
          <AppRoutes />
        </Container>
      </div>
    </div>
  );
}