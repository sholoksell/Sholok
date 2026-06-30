import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination as SwiperPagination, EffectFade } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    title: 'হাজারো বইয়ের ভান্ডার আপনার হাতের মুঠোয়',
    subtitle: 'বাংলা সাহিত্য, ইসলামিক, থ্রিলার, কবিতা — সব ধরনের বই এক জায়গায়',
    cta: 'এখনই পড়া শুরু করুন',
    to: '/categories',
    gradient: 'from-brand-700 via-brand-800 to-brand-950',
  },
  {
    title: 'জনপ্রিয় ওয়েব নভেল পড়ুন প্রতি সপ্তাহে',
    subtitle: 'নতুন নতুন অধ্যায়, রোমাঞ্চকর কাহিনি, প্রিয় লেখকদের লেখা',
    cta: 'নভেল দেখুন',
    to: '/novels',
    gradient: 'from-emerald2-700 via-brand-800 to-brand-950',
  },
  {
    title: 'আজকের বিশেষ অফারে বই সংগ্রহ করুন',
    subtitle: 'ফ্রি বই ও বিশাল ছাড়ে প্রিয় বইগুলো এখনই সংগ্রহ করুন',
    cta: 'অফার দেখুন',
    to: '/offers',
    gradient: 'from-gold-600 via-brand-700 to-brand-950',
  },
];

function HeroSlider() {
  return (
    <Swiper
      modules={[Autoplay, SwiperPagination, EffectFade]}
      effect="fade"
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop
      className="hero-swiper rounded-3xl"
    >
      {slides.map((slide, i) => (
        <SwiperSlide key={i}>
          <div className={`relative flex min-h-[320px] items-center overflow-hidden rounded-3xl bg-gradient-to-br ${slide.gradient} px-6 py-12 sm:px-12 md:min-h-[400px]`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.18),transparent_55%)]" />
            <div className="relative z-10 max-w-xl">
              <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">{slide.title}</h1>
              <p className="mt-4 text-sm text-white/85 sm:text-base">{slide.subtitle}</p>
              <Link
                to={slide.to}
                className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-soft transition hover:bg-gold-100"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default HeroSlider;
