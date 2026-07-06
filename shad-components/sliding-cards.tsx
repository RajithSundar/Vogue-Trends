import { FaStar, FaBolt, FaHeart } from 'react-icons/fa';
import SlidingCards from '@/components/lightswind/SlidingCards';

const cardItems = [
  { id: 1, icon: <FaStar />, bgClass: 'bg-gradient-to-br from-yellow-400 to-red-400' },
  { id: 2, icon: <FaBolt />, bgClass: 'bg-gradient-to-br from-purple-400 to-pink-400' },
  { id: 3, icon: <FaHeart />, bgClass: 'bg-gradient-to-br from-teal-400 to-cyan-300' },
];

<SlidingCards cards={cardItems} cardSize="w-20 h-20" className="mx-auto" />;