import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, ChevronRight, Navigation } from "lucide-react";
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
  const { data: locations = [], isLoading, error } = useLocations();

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
      <h3 className="text-xl font-bold mb-md">Vyberte si prevádzku</h3>
      <div className="space-y-md">
        {locations.map((location) => (
          <motion.div
            key={location.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Card
              onClick={() => onSelect(location.id, location.name)}
              className={`cursor-pointer border-2 transition-all duration-300 ${
                selectedId === location.id
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <CardContent className="p-md flex items-center gap-md">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <MapPin size={24} />
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-lg">{location.name}</h4>
                  <p className="text-sm text-secondary flex items-center gap-xs">
                    <Navigation size={12} /> {location.address}
                  </p>
                  <div className="flex gap-md mt-xs text-[10px] uppercase tracking-wider font-bold text-muted">
                    <span className="flex items-center gap-xs">
                      <Phone size={10} /> {location.phone}
                    </span>
                    <span className="flex items-center gap-xs">
                      <Clock size={10} /> Otvorené dnes
                    </span>
                  </div>
                </div>

                <ChevronRight
                  className={`transition-transform ${
                    selectedId === location.id
                      ? "translate-x-1 text-primary"
                      : "text-muted"
                  }`}
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
