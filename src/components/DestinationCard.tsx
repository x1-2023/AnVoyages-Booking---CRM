import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface DestinationCardProps {
  id: string;
  image: string;
  name: string;
  propertyCount: number;
  featured?: boolean;
}

const DestinationCard = ({
  id,
  image,
  name,
  propertyCount,
  featured = false,
}: DestinationCardProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/5]"
    >
      <Link to={`/destinations/${id}`}>
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-overlay" />
        
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <h3 className="font-display text-2xl font-bold text-card mb-1">
            {name}
          </h3>
          <p className="text-card/80 text-sm flex items-center gap-2">
            {propertyCount} {t('destinations.properties')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default DestinationCard;
