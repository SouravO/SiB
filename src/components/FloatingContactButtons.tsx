'use client';

import { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';

interface FloatingContactButtonsProps {
    whatsappNumber?: string;
    phoneNumber?: string;
}

export default function FloatingContactButtons({ 
    whatsappNumber = '919876543210', 
    phoneNumber = '919876543210' 
}: FloatingContactButtonsProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleWhatsAppClick = () => {
        window.open(`https://wa.me/${whatsappNumber}`, '_blank');
    };

    const handlePhoneClick = () => {
        window.location.href = `tel:+${phoneNumber}`;
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Expanded Buttons */}
            {isExpanded && (
                <>
                    {/* WhatsApp Button */}
                    <button
                        onClick={handleWhatsAppClick}
                        className="group flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <span className="text-xs font-bold uppercase tracking-wider">Chat</span>
                        <MessageCircle size={20} />
                    </button>

                    {/* Call Button */}
                    <button
                        onClick={handlePhoneClick}
                        className="group flex items-center gap-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <span className="text-xs font-bold uppercase tracking-wider">Call</span>
                        <Phone size={20} />
                    </button>
                </>
            )}

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
                    isExpanded 
                        ? 'bg-red-500 hover:bg-red-600 rotate-90' 
                        : 'bg-purple-600 hover:bg-purple-700'
                }`}
            >
                {isExpanded ? (
                    <X size={24} className="text-white" />
                ) : (
                    <div className="flex gap-1">
                        <MessageCircle size={20} className="text-white" />
                        <Phone size={20} className="text-white" />
                    </div>
                )}
            </button>
        </div>
    );
}
