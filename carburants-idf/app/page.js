import Comparator from './comparator';
import stations from '../data/prix-des-carburants-j-7.json';

export default function Home() {
  return <Comparator stations={stations} />;
}
