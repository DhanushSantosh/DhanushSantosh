import { m, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { useEffect } from "react";

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string;
}

export function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
    // Lock body scroll when modal is open, compensate for scrollbar disappearing
    useEffect(() => {
        if (isOpen) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = "hidden";
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        {/* Modal Container */}
                        <m.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl"
                        >
                            {/* Header / Close Button */}
                            <div className="absolute top-0 right-0 z-10 p-4">
                                <button
                                    onClick={onClose}
                                    className="rounded-full bg-black/50 p-2 text-white/70 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            {/* Video Player */}
                            <div className="aspect-video w-full bg-black">
                                <iframe
                                    src={videoUrl}
                                    className="h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </m.div>
                    </m.div>
                </>
            )}
        </AnimatePresence>
    );
}
