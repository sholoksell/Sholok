import { motion } from 'framer-motion';
import WebtoonCard from '../cards/WebtoonCard';
import { staggerContainer } from '../../animations/variants';

export default function WebtoonGrid({ webtoons, cols = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className={`grid ${cols} gap-4`}
    >
      {webtoons.map((w, i) => (
        <WebtoonCard key={w.id} webtoon={w} index={i} />
      ))}
    </motion.div>
  );
}
