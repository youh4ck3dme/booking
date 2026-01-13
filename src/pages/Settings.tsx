import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import {
  Clock,
  Globe,
  Bell,
  Save,
  Building,
  MapPin,
  Phone,
} from "lucide-react";

const DAYS = [
  { id: "monday", label: "Pondelok" },
  { id: "tuesday", label: "Utorok" },
  { id: "wednesday", label: "Streda" },
  { id: "thursday", label: "Štvrtok" },
  { id: "friday", label: "Piatok" },
  { id: "saturday", label: "Sobota" },
  { id: "sunday", label: "Nedeľa" },
];

export const Settings: React.FC = () => {
  const [businessInfo, setBusinessInfo] = useState({
    name: "BookFlow Studio",
    address: "Mýtna 1, Bratislava",
    phone: "+421 900 000 000",
    email: "info@bookflow.sk",
  });

  const [workingHours, setWorkingHours] = useState<
    Record<string, { start: string; end: string; closed: boolean }>
  >({
    monday: { start: "09:00", end: "17:00", closed: false },
    tuesday: { start: "09:00", end: "17:00", closed: false },
    wednesday: { start: "09:00", end: "17:00", closed: false },
    thursday: { start: "09:00", end: "17:00", closed: false },
    friday: { start: "09:00", end: "17:00", closed: false },
    saturday: { start: "10:00", end: "14:00", closed: true },
    sunday: { start: "10:00", end: "14:00", closed: true },
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert("Nastavenia boli úspešne uložené.");
  };

  return (
    <div className="container py-xl max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-xl"
      >
        <div>
          <h1 className="text-3xl font-bold">Nastavenia systému</h1>
          <p className="text-secondary">
            Konfigurácia vášho biznisu a globálnych pravidiel
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-lg">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <Building size={20} className="text-primary" />
                Informácie o prevádzke
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="grid grid-1 md:grid-2 gap-md">
                <Input
                  label="Názov biznisu"
                  value={businessInfo.name}
                  onChange={(e) =>
                    setBusinessInfo({ ...businessInfo, name: e.target.value })
                  }
                  leftIcon={<Building size={18} />}
                  required
                />
                <Input
                  label="Email prevádzky"
                  value={businessInfo.email}
                  onChange={(e) =>
                    setBusinessInfo({ ...businessInfo, email: e.target.value })
                  }
                  leftIcon={<Globe size={18} />}
                  required
                />
                <Input
                  label="Adresa"
                  value={businessInfo.address}
                  onChange={(e) =>
                    setBusinessInfo({
                      ...businessInfo,
                      address: e.target.value,
                    })
                  }
                  leftIcon={<MapPin size={18} />}
                />
                <Input
                  label="Telefón"
                  value={businessInfo.phone}
                  onChange={(e) =>
                    setBusinessInfo({ ...businessInfo, phone: e.target.value })
                  }
                  leftIcon={<Phone size={18} />}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <Clock size={20} className="text-secondary" />
                Otváracie hodiny
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-sm">
                {DAYS.map((day) => (
                  <div
                    key={day.id}
                    className="flex items-center justify-between p-sm glass-card border-none"
                  >
                    <span className="font-medium w-24">{day.label}</span>
                    <div className="flex items-center gap-md">
                      {!workingHours[day.id].closed ? (
                        <>
                          <input
                            type="time"
                            value={workingHours[day.id].start}
                            onChange={(e) =>
                              setWorkingHours({
                                ...workingHours,
                                [day.id]: {
                                  ...workingHours[day.id],
                                  start: e.target.value,
                                },
                              })
                            }
                            className="bg-bg-primary border border-border rounded px-2 py-1 text-sm"
                          />
                          <span className="text-secondary">-</span>
                          <input
                            type="time"
                            value={workingHours[day.id].end}
                            onChange={(e) =>
                              setWorkingHours({
                                ...workingHours,
                                [day.id]: {
                                  ...workingHours[day.id],
                                  end: e.target.value,
                                },
                              })
                            }
                            className="bg-bg-primary border border-border rounded px-2 py-1 text-sm"
                          />
                        </>
                      ) : (
                        <span className="text-red-400 text-sm font-bold uppercase">
                          Zatvorené
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setWorkingHours({
                            ...workingHours,
                            [day.id]: {
                              ...workingHours[day.id],
                              closed: !workingHours[day.id].closed,
                            },
                          });
                        }}
                      >
                        {workingHours[day.id].closed ? "Otvoriť" : "Zatvoriť"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <Bell size={20} className="text-accent" />
                Notifikácie a systém
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex items-center justify-between p-sm">
                <div>
                  <p className="font-medium mb-0">Emailové notifikácie</p>
                  <p className="text-xs text-secondary">
                    Posielať potvrdenia o rezerváciách
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 accent-primary"
                />
              </div>
              <div className="flex items-center justify-between p-sm">
                <div>
                  <p className="font-medium mb-0">SMS pripomienky</p>
                  <p className="text-xs text-secondary">
                    Posielať pripomienku 2h pred termínom
                  </p>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-primary" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-md">
            <Button
              type="submit"
              leftIcon={<Save size={18} />}
              isLoading={isSaving}
            >
              Uložiť všetky nastavenia
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Settings;
