import { useState, useEffect, useCallback } from "react";
import { Button } from "antd";
import { LeftOutlined, RightOutlined, BookOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import SlackNotification from "./slack-notification";
import AssessmentsModal from "./assessments-modal";

const NotificationCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const totalSlides = 2;

  const next = useCallback(() => {
    setDirection(1);
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prev = useCallback(() => {
    setDirection(-1);
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setDirection(index > activeSlide ? 1 : -1);
    setActiveSlide(index);
  };

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      next();
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <motion.div 
      whileHover={{ 
        scale: 1.005,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1), 0 0 20px 2px rgba(255, 255, 255, 0.05)"
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative w-full overflow-hidden group rounded-xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Navigation Buttons */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          shape="circle"
          size="middle"
          icon={<LeftOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="bg-black/20 hover:!bg-black/40 border-0 text-white backdrop-blur-sm shadow-md"
        />
      </div>

      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          shape="circle"
          size="middle"
          icon={<RightOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="bg-black/20 hover:!bg-black/40 border-0 text-white backdrop-blur-sm shadow-md"
        />
      </div>

      <div className="min-h-[140px] flex items-center px-10 md:px-14 pb-8 pt-2">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.4 },
            }}
            className="w-full"
          >
            {/* SLIDE 1 */}
            {activeSlide === 0 && <SlackNotification />}

            {/* SLIDE 2 */}
            {activeSlide === 1 && (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <BookOutlined className="text-white text-xl" />
                    </div>

                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        MyDeepTech Core Assessments
                      </h3>

                      <p className="text-purple-100 text-sm">
                        Complete your core skills and skill assessments
                      </p>
                    </div>
                  </div>

                  <p className="text-purple-100 text-sm leading-relaxed max-w-2xl">
                    Ready to showcase your skills? Take the British Council
                    English test and our Problem Solving assessments to improve
                    your profile and unlock more opportunities on the platform.
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <Button
                    type="primary"
                    size="large"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModalOpen(true);
                    }}
                    className="bg-white text-purple-600 border-0 hover:!bg-yellow-500 shadow-lg font-semibold px-6 py-5 h-auto"
                    icon={<RightOutlined />}
                    iconPosition="end"
                  >
                    View Assessments
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicator Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {[...Array(totalSlides)].map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeSlide === i ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <AssessmentsModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
};

export default NotificationCarousel;