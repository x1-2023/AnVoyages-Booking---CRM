import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, type Easing } from "framer-motion";
import { useTranslation } from "react-i18next";
import { 
  Plane, 
  MapPin, 
  Compass, 
  Map, 
  Home, 
  Search,
  Cloud,
  Sun,
  Mountain,
  TreePine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950">
      {/* Animated Background Elements */}
      
      {/* Sun */}
      <motion.div
        className="absolute top-10 right-20 text-yellow-400"
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <Sun className="w-20 h-20 drop-shadow-lg" strokeWidth={1.5} />
      </motion.div>

      {/* Clouds */}
      <motion.div
        className="absolute top-20 text-white/80 dark:text-white/20"
        initial={{ x: "-100%" }}
        animate={{ x: "100vw" }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Cloud className="w-24 h-24" fill="currentColor" />
      </motion.div>
      
      <motion.div
        className="absolute top-40 text-white/60 dark:text-white/15"
        initial={{ x: "-50%" }}
        animate={{ x: "100vw" }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
      >
        <Cloud className="w-32 h-32" fill="currentColor" />
      </motion.div>

      <motion.div
        className="absolute top-32 text-white/70 dark:text-white/10"
        initial={{ x: "0%" }}
        animate={{ x: "150vw" }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <Cloud className="w-20 h-20" fill="currentColor" />
      </motion.div>

      {/* Flying Plane */}
      <motion.div
        className="absolute top-1/4 text-primary"
        initial={{ x: "-10%", y: "10%" }}
        animate={{ x: "110%", y: "-10%" }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
      >
        <Plane className="w-12 h-12 rotate-[-30deg]" />
      </motion.div>

      {/* Mountains Background */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 320" className="w-full text-emerald-200/50 dark:text-emerald-900/30">
          <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 320" className="w-full text-emerald-300/60 dark:text-emerald-800/40">
          <path fill="currentColor" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 320" className="w-full text-emerald-400/80 dark:text-emerald-700/50">
          <path fill="currentColor" d="M0,256L48,261.3C96,267,192,277,288,272C384,267,480,245,576,240C672,235,768,245,864,250.7C960,256,1056,256,1152,245.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Trees */}
      <motion.div 
        className="absolute bottom-20 left-[10%] text-emerald-600 dark:text-emerald-500"
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <TreePine className="w-16 h-16" />
      </motion.div>
      <motion.div 
        className="absolute bottom-24 left-[15%] text-emerald-700 dark:text-emerald-600"
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <TreePine className="w-12 h-12" />
      </motion.div>
      <motion.div 
        className="absolute bottom-16 right-[12%] text-emerald-600 dark:text-emerald-500"
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <TreePine className="w-14 h-14" />
      </motion.div>
      <motion.div 
        className="absolute bottom-20 right-[8%] text-emerald-700 dark:text-emerald-600"
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >
        <TreePine className="w-10 h-10" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Animated 404 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="relative mb-8"
          >
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <span className="text-[150px] md:text-[200px] font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-emerald-500 leading-none select-none">
                4
              </span>
              <motion.div
                className="inline-block"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Compass className="w-24 h-24 md:w-32 md:h-32 text-primary mx-4" strokeWidth={1.5} />
              </motion.div>
              <span className="text-[150px] md:text-[200px] font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-primary leading-none select-none">
                4
              </span>
            </motion.div>

            {/* Floating icons around 404 */}
            <motion.div
              className="absolute -top-4 left-1/4 text-primary/60"
              animate={{ 
                y: [-5, 5, -5],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <MapPin className="w-8 h-8" />
            </motion.div>
            <motion.div
              className="absolute -bottom-4 right-1/4 text-emerald-500/60"
              animate={{ 
                y: [5, -5, 5],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Map className="w-8 h-8" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4"
          >
            Ôi! Bạn đã lạc đường rồi
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg text-muted-foreground mb-8 max-w-md mx-auto"
          >
            Có vẻ như trang bạn đang tìm kiếm đã bay đến một điểm đến khác. 
            Hãy để chúng tôi giúp bạn tìm đường về!
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm điểm đến của bạn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-background/80 backdrop-blur-sm border-2 focus:border-primary"
              />
            </div>
            <Button size="lg" className="h-12 px-6 gap-2">
              <Search className="w-4 h-4" />
              Tìm kiếm
            </Button>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/">
              <Button variant="outline" size="lg" className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background">
                <Home className="w-5 h-5" />
                Về trang chủ
              </Button>
            </Link>
            <Link to="/destinations">
              <Button variant="outline" size="lg" className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background">
                <MapPin className="w-5 h-5" />
                Khám phá điểm đến
              </Button>
            </Link>
            <Link to="/properties">
              <Button variant="outline" size="lg" className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background">
                <Mountain className="w-5 h-5" />
                Xem chỗ ở
              </Button>
            </Link>
          </motion.div>

          {/* Fun fact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-12 p-4 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50 max-w-sm mx-auto"
          >
            <p className="text-sm text-muted-foreground">
              💡 <span className="font-medium text-foreground">Mẹo hay:</span> Đôi khi lạc đường lại dẫn đến những khám phá tuyệt vời nhất!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
