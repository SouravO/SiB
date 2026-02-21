'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1541339907198-e08756defe93?q=80&w=2070&auto=format&fit=crop',
        title: 'Premium Campus Placements',
        subtitle: "Connecting you with the world's leading institutions and career opportunities."
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop',
        title: 'World-Class Infrastructure',
        subtitle: 'Experience learning in environments designed for innovation and excellence.'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2070&auto=format&fit=crop',
        title: 'Expert Academic Guidance',
        subtitle: 'Navigate your educational journey with personalized support from industry veterans.'
    }
];

export default function BannerCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrent(current === banners.length - 1 ? 0 : current + 1);
    };

    const prevSlide = () => {
        setCurrent(current === 0 ? banners.length - 1 : current - 1);
    };

    return (
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden group mb-12">
            {/* Slides */}
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                        index === current ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
                    }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
                    <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover grayscale opacity-60"
                    />
                    <div className="absolute inset-0 z-20 flex flex-col justify-center px-12 md:px-20 max-w-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-[1px] w-8 bg-purple-500"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-purple-400">Featured</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-white mb-6 leading-tight">
                            {banner.title}
                        </h2>
                        <p className="text-sm md:text-base text-zinc-400 font-light max-w-lg leading-relaxed italic">
                            {banner.subtitle}
                        </p>
                    </div>
                </div>
            ))}

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 border border-white/10 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black"
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 border border-white/10 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black"
            >
                <ChevronRight size={20} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-8 left-12 md:left-20 z-30 flex gap-2">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`h-[2px] transition-all duration-500 ${
                            index === current ? 'w-12 bg-white' : 'w-4 bg-white/20 hover:bg-white/50'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
