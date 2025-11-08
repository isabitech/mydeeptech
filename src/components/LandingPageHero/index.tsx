import { motion } from "framer-motion";

interface LandingPageHeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  bottomText?: string;
  highlightedText?: string;
  className?: string;
}

const defaultFeatures = [
  "Competitive pay rates",
  "Work remotely from anywhere",
  "Flexible schedule",
  "All domains needed",
];

export default function LandingPageHero({
  title = "MyDeepTech",
  subtitle = "Get Paid to Train AI",
  description = "No experience needed, all backgrounds welcome.",
  features = defaultFeatures,
  bottomText = "Join hundreds of experts earning",
  highlightedText = "$30/hr",
  className = ""
}: LandingPageHeroProps) {
  return (
    <div className={`p-10 justify-center  h-full flex flex-col bg-[#333333] text-white ${className}`}>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="md:text-4xl text-xl font-bold "
      >
        {title}
      </motion.h1>
      
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-2 text-2xl font-semibold"
      >
        {subtitle}
      </motion.h2>
      
      <motion.p 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-2"
      >
        {description}
      </motion.p>

      <motion.ul 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-6 space-y-3"
      >
        {features.map((feature, index) => (
          <motion.li 
            key={feature}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            className="flex items-center gap-2"
          >
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1, type: "spring", stiffness: 260, damping: 20 }}
              className="w-2 h-2 bg-secondary rounded-full"
            />
            {feature}
          </motion.li>
        ))}
      </motion.ul>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-6 text-sm text-secondary"
      >
        {bottomText}{" "}
        <span className="font-semibold text-white">{highlightedText}</span>{" "}
        already with MyDeepTech
      </motion.p>
    </div>
  );
}