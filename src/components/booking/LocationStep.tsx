import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  Navigation,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { useLocations } from "../../hooks/useLocations";

interface LocationStepProps {
  selectedId?: string;
  onSelect: (locationId: string, locationName: string) => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  selectedId,
  onSelect,
}) => {
  const [userCoords, setUserCoords] = useState<
    { lat: number; lng: number } | undefined
  >();

  // Get live geolocation for smart distance sorting
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log("Geolocation error:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const { data: locations = [], isLoading, error } = useLocations(userCoords);

  if (isLoading) {
    return (
      <div className="grid gap-md">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24">
              <div className="w-full h-full bg-white/5 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Chyba"
        description="Nepodarilo sa načítať prevádzky."
      />
    );
  }

  if (locations.length === 0) {
    return (
      <EmptyState
        title="Žiadne prevádzky"
        description="Momentálne nemáme žiadne voľné prevádzky."
      />
    );
  }

  return (
    <div className="grid gap-md">
      <div className="flex justify-between items-end mb-md">
        <h3 className="text-xl font-bold">Vyberte si prevádzku</h3>
        {userCoords && (
          <span className="text-[10px] text-secondary flex items-center gap-xs uppercase tracking-tighter font-bold">
            <Navigation size={10} className="text-primary" /> Zoradené podľa
            vzdialenosti
          </span>
        )}
      </div>

      <div className="space-y-md">
        <AnimatePresence mode="popLayout">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Card
                onClick={() => onSelect(location.id, location.name)}
                className={`relative group cursor-pointer border-2 transition-all duration-500 overflow-hidden ${
                  selectedId === location.id
                    ? "border-secondary bg-secondary/10 ring-1 ring-secondary"
                    : "border-white/5 bg-white/5 hover:bg-white/10"
                }`}
              >
                {/* Nearest Badge */}
                {index === 0 && userCoords && location.distance && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-secondary text-primary-dark text-[9px] font-black px-3 py-1 rounded-bl-xl flex items-center gap-xs shadow-lg uppercase tracking-widest">
                      <Sparkles size={8} className="animate-pulse" /> Najbližšia
                      k vám
                    </div>
                  </div>
                )}

                <CardContent className="p-lg flex items-center gap-lg">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                      selectedId === location.id
                        ? "bg-secondary text-primary-dark"
                        : "bg-white/5 text-secondary"
                    }`}
                  >
                    <MapPin size={28} />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-xl mb-1">{location.name}</h4>
                    <p className="text-sm text-secondary flex items-center gap-xs font-medium">
                      <Navigation size={12} className="text-muted" />{" "}
                      {location.address}
                      {location.distance && (
                        <span className="text-primary font-bold ml-1">
                          • {location.distance.toFixed(1)} km
                        </span>
                      )}
                    </p>

                    <div className="flex gap-md mt-3 text-[10px] uppercase tracking-wider font-bold text-muted">
                      <span className="flex items-center gap-xs bg-white/5 px-2 py-1 rounded-md">
                        <Phone size={10} /> {location.phone}
                      </span>
                      <span className="flex items-center gap-xs bg-white/5 px-2 py-1 rounded-md">
                        <Clock size={10} /> Otvorené dnes
                      </span>
                    </div>
                  </div>

                  <ChevronRight
                    className={`transition-all duration-500 ${
                      selectedId === location.id
                        ? "translate-x-1 text-secondary scale-125"
                        : "text-muted group-hover:translate-x-1"
                    }`}
                  />
                </CardContent>

                {/* Background Glow Effect */}
                {selectedId === location.id && (
                  <motion.div
                    layoutId="active-bg"
                    className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent -z-10"
                  />
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
