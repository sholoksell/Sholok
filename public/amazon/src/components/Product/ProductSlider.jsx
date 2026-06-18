import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useLanguage } from '../../contexts/LanguageContext';
import ProductCard from './ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';

const ProductSlider = ({ title, products = [], seeMoreLink }) => {
  const { t } = useLanguage();
  return (
  <section className="bg-white rounded shadow-amazon p-4">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl font-bold text-amazon-dark">{title}</h2>
      {seeMoreLink && (
        <Link to={seeMoreLink} className="see-more-link shrink-0">
          {t('seeAll')}
        </Link>
      )}
    </div>

    <div className="relative">
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        autoplay={{ delay: 4000, disableOnInteraction: true, pauseOnMouseEnter: true }}
        loop={products.length > 5}
        spaceBetween={12}
        slidesPerView={2}
        breakpoints={{
          480:  { slidesPerView: 2 },
          640:  { slidesPerView: 3 },
          768:  { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 6 },
        }}
      >
        {products.map((p) => (
          <SwiperSlide key={p.id}>
            <ProductCard product={p} compact />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  </section>
  );
};

export default ProductSlider;
