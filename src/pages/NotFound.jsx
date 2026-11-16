import { Link } from 'react-router-dom';
import { Empty } from '../components/ui.jsx';

export default function NotFound() {
  return <Empty title="Page not found" text="The page you are looking for does not exist in this workspace." action={<Link className="btn btn--primary" to="/dashboard">Back to overview</Link>} />;
}
