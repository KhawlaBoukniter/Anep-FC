"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface CarouselItem {
    id: number
    title: string
    description: string
    image: string
    color: string
}

const carouselItems: CarouselItem[] = [
    {
        id: 1,
        title: "Service Premium",
        description: "Découvrez nos services de qualité supérieure pour votre entreprise",
        image: "/images/img5.jpeg",
        color: "#06668C",
    },
    {
        id: 2,
        title: "Innovation Continue",
        description: "Nous innovons constamment pour vous offrir les meilleures solutions",
        image: "/images/img4.jpeg",
        color: "#16a34a", // Equivalent to bg-green-600
    },
    {
        id: 3,
        title: "Expertise Reconnue",
        description: "Plus de 10 ans d'expérience dans notre domaine d'activité",
        image: "/images/img2.jpeg",
        color: "#06668C",
    },
    {
        id: 4,
        title: "Expertise Reconnue",
        description: "Plus de 10 ans d'expérience dans notre domaine d'activité",
        image: "/images/img1.jpeg",
        color: "#06668C",
    },
]

const Carousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Auto-rotation du carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1))
        }, 4000) // Change toutes les 4 secondes

        return () => clearInterval(interval)
    }, [])

    const goToPrevious = () => {
        setCurrentIndex(currentIndex === 0 ? carouselItems.length - 1 : currentIndex - 1)
    }

    const goToNext = () => {
        setCurrentIndex(currentIndex === carouselItems.length - 1 ? 0 : currentIndex + 1)
    }

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    return (
        <div className="relative w-full h-[500px] overflow-hidden rounded-lg shadow-lg md:h-[600px] sm:h-[400px]">
            {/* Carousel items */}
            <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {carouselItems.map((item) => (
                    <div
                        key={item.id}
                        className="min-w-full h-full flex items-center justify-center relative"
                        style={{
                            backgroundImage: `url(${item.image})`,
                            backgroundSize: "cover", // Ensure image covers the slide
                            backgroundPosition: "center", // Center the image
                            backgroundRepeat: "no-repeat", // Prevent repeating
                            backgroundColor: item.color, // Use direct color value
                        }}
                    >
                        {/* Overlay for better text readability */}
                        <div className="absolute inset-0 bg-black bg-opacity-30"></div>

                        <div className="relative text-center text-white px-8 z-10">
                            <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                            <p className="text-lg opacity-90">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation arrows */}
            <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {carouselItems.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentIndex ? "bg-white" : "bg-white bg-opacity-50 hover:bg-opacity-75"
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

export default Carousel