import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  Clock,
  Scissors,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Users,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { useBookingStore } from "../../stores/bookingStore";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardContent } from "../ui/Card";
import { BookingSkeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { Calendar as CalendarComponent } from "./Calendar";
import { TimeSlots } from "./TimeSlots";
import { LocationStep } from "./LocationStep";
import { useServices } from "../../hooks/useServices";
import { useEmployees } from "../../hooks/useEmployees";
import { useAvailableSlots, useCreateBooking } from "../../hooks/useBookings";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

const steps = [
  { id: 0, title: "Prevádzka", icon: MapPin },
  { id: 1, title: "Služba", icon: Scissors },
  { id: 2, title: "Termín", icon: Calendar },
  { id: 3, title: "Údaje", icon: User },
  { id: 4, title: "Prehľad", icon: Check },
];

export const BookingForm: React.FC = () => {
  const {
    currentStep,
    formData,
    setFormData,
    setStep,
    nextStep,
    prevStep,
    resetForm,
  } = useBookingStore();

  const { user } = useAuthStore();

  // TanStack Query Hooks with Location filtering
  const { data: services = [], isLoading: isServicesLoading } = useServices(
    formData.locationId
  );
  const { data: employees = [], isLoading: isEmployeesLoading } = useEmployees(
    formData.locationId
  );

  const selectedService = services.find((s) => s.id === formData.serviceId);

  const { data: slots = [], isLoading: isSlotsLoading } = useAvailableSlots(
    formData.date,
    selectedService,
    employees
  );

  const createBookingMutation = useCreateBooking();

  // Auto-fill user data if logged in
  useEffect(() => {
    if (user && !formData.customerEmail) {
      setFormData({
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone || "",
      });
    }
  }, [user, setFormData, formData.customerEmail]);

  const handleCreateBooking = async () => {
    if (!selectedService) return;

    try {
      await createBookingMutation.mutateAsync({
        formData,
        service: selectedService,
        userId: user?.id,
      });
      nextStep(); // Move to success step
    } catch (error) {
      console.error("Booking failed:", error);
    }
  };

  const renderStepContent = () => {
    // Shared loading state for initial data
    if (currentStep > 0 && (isServicesLoading || isEmployeesLoading)) {
      return <BookingSkeleton />;
    }

    switch (currentStep) {
      case 0:
        return (
          <LocationStep
            selectedId={formData.locationId}
            onSelect={(id, name) => {
              setFormData({
                locationId: id,
                locationName: name,
                serviceId: "",
                employeeId: undefined,
              });
              nextStep();
            }}
          />
        );

      case 1:
        if (services.length === 0 && !isServicesLoading) {
          return (
            <EmptyState
              title="Žiadne služby nie sú dostupné"
              description="V tejto prevádzke momentálne nemáme žiadne aktívne služby."
              icon={AlertCircle}
            />
          );
        }
        return (
          <div className="grid gap-md">
            <h3 className="text-xl font-bold mb-md">Vyberte si službu</h3>
            <div className="grid grid-2 gap-md">
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    onClick={() => {
                      setFormData({ serviceId: service.id });
                      nextStep();
                    }}
                    className={`cursor-pointer border-2 transition-colors ${
                      formData.serviceId === service.id
                        ? "border-primary bg-primary/10"
                        : "border-transparent"
                    }`}
                  >
                    <CardContent className="flex items-center gap-md p-md">
                      <div className="text-2xl">{service.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-bold">{service.name}</h4>
                        <p className="text-sm text-secondary">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {service.price}€
                        </div>
                        <div className="text-xs text-muted">
                          {service.duration} min
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <h3 className="text-xl font-bold mt-lg mb-md">
              Vyberte pracovníka (voliteľné)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
              <motion.button
                type="button"
                onClick={() => setFormData({ employeeId: undefined })}
                className={`relative group overflow-hidden rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 border border-white/10 ${
                  !formData.employeeId
                    ? "bg-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                    : "bg-white/5 hover:bg-white/10 hover:border-white/20"
                }`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {!formData.employeeId && (
                  <motion.div
                    layoutId="active-employee"
                    className="absolute top-3 right-3 z-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </motion.div>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent" />
                <div
                  className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-transform duration-500 bg-gradient-to-br from-indigo-600 via-primary to-purple-600 ${
                    !formData.employeeId
                      ? "scale-110 shadow-primary/50"
                      : "group-hover:scale-110"
                  }`}
                >
                  <Users size={28} />
                  <Sparkles
                    size={14}
                    className="absolute top-3 right-3 text-yellow-300 animate-pulse"
                  />
                </div>
                <div className="text-center z-10">
                  <span className="block text-sm font-bold text-white mb-0.5">
                    Ktokoľvek
                  </span>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-primary-300">
                    Najrýchlejší termín
                  </span>
                </div>
              </motion.button>

              {employees
                .filter(
                  (e) =>
                    !formData.serviceId ||
                    e.services.includes(formData.serviceId)
                )
                .map((emp) => (
                  <motion.button
                    key={emp.id}
                    type="button"
                    onClick={() => setFormData({ employeeId: emp.id })}
                    className={`relative group overflow-hidden rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 border border-white/10 ${
                      formData.employeeId === emp.id
                        ? "bg-white/10 ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {formData.employeeId === emp.id && (
                      <motion.div
                        layoutId="active-employee"
                        className="absolute top-3 right-3 z-20"
                      >
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      </motion.div>
                    )}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform duration-300 ${
                        formData.employeeId === emp.id
                          ? "scale-110 ring-2 ring-white/20"
                          : "group-hover:scale-105"
                      }`}
                      style={{
                        background: emp.avatar
                          ? `url(${emp.avatar}) center/cover`
                          : `linear-gradient(135deg, ${emp.color} 0%, ${emp.color}dd 100%)`,
                      }}
                    >
                      {!emp.avatar && emp.name.charAt(0)}
                    </div>
                    <div className="text-center z-10 w-full">
                      <span className="block text-sm font-bold text-white truncate px-2">
                        {emp.name.split(" ")[0]}
                      </span>
                      <span className="block text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                        Stylist
                      </span>
                    </div>
                  </motion.button>
                ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-2 gap-xl">
            <div>
              <h3 className="text-xl font-bold mb-md">Dátum</h3>
              <CalendarComponent
                selectedDate={formData.date}
                onDateSelect={(date) => setFormData({ date, timeSlot: "" })}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-md">Čas</h3>
              {formData.date ? (
                <div className="bg-white/5 p-md rounded-lg h-full">
                  <div className="mb-md text-center border-b border-white/10 pb-sm">
                    <span className="text-primary font-bold capitalize">
                      {format(formData.date, "EEEE d. MMMM", { locale: sk })}
                    </span>
                  </div>
                  <TimeSlots
                    slots={slots}
                    selectedSlot={formData.timeSlot}
                    onSelectSlot={(slotId) => {
                      const [empId, ...timeParts] = slotId.split("-");
                      const time = timeParts.join("-");
                      setFormData({
                        employeeId: empId,
                        timeSlot: time,
                      });
                    }}
                    isLoading={isSlotsLoading}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-secondary bg-white/5 rounded-lg border border-dashed border-white/10">
                  <Calendar className="w-12 h-12 mb-sm opacity-50" />
                  <p>Najskôr vyberte dátum</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-md mx-auto space-y-md">
            <h3 className="text-xl font-bold mb-md text-center">Vaše údaje</h3>
            <Input
              label="Meno a Priezvisko"
              value={formData.customerName}
              onChange={(e) => setFormData({ customerName: e.target.value })}
              leftIcon={<User size={18} />}
              placeholder="Jozef Mrkvička"
            />
            <Input
              label="Email"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ customerEmail: e.target.value })}
              leftIcon={<Clock size={18} />}
              placeholder="jozef@example.com"
            />
            <Input
              label="Telefón"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ customerPhone: e.target.value })}
              leftIcon={<Clock size={18} />}
              placeholder="+421 900 123 456"
            />
            <div className="form-group">
              <label className="label">Poznámka</label>
              <textarea
                className="input min-h-[100px]"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ notes: e.target.value })}
                placeholder="Mám alergiu na..."
              />
            </div>
          </div>
        );

      case 4: {
        return (
          <div className="max-w-md mx-auto">
            <h3 className="text-2xl font-bold mb-lg text-center">
              Zhrnutie rezervácie
            </h3>

            <Card className="mb-lg">
              <CardContent className="p-lg space-y-md">
                <div className="flex justify-between items-center border-b border-white/10 pb-md">
                  <span className="text-secondary">Prevádzka</span>
                  <span className="font-bold">
                    {formData.locationName || "Neuvedená"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-md">
                  <span className="text-secondary">Služba</span>
                  <span className="font-bold">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-md">
                  <span className="text-secondary">Dátum a čas</span>
                  <span className="font-bold">
                    {formData.date &&
                      format(formData.date, "d. M. yyyy", { locale: sk })}{" "}
                    {formData.timeSlot}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-md">
                  <span className="text-secondary">Trvanie</span>
                  <span>{selectedService?.duration} min</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-md">
                  <span className="text-secondary">Cena</span>
                  <span className="font-bold text-xl text-primary">
                    {selectedService?.price}€
                  </span>
                </div>

                <div className="bg-white/5 p-md rounded-md mt-md">
                  <h5 className="font-bold mb-xs text-sm text-secondary">
                    Kontaktné údaje
                  </h5>
                  <p>{formData.customerName}</p>
                  <p className="text-sm text-muted">{formData.customerEmail}</p>
                  <p className="text-sm text-muted">{formData.customerPhone}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      default:
        return (
          <div className="text-center py-2xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 100 }}
              className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-lg shadow-lg shadow-green-500/50"
            >
              <Check size={40} />
            </motion.div>
            <h2 className="text-3xl font-bold mb-md">Rezervácia úspešná!</h2>
            <p className="text-secondary mb-xl max-w-sm mx-auto">
              Vaša rezervácia bola prijatá. Čoskoro dostanete potvrdzujúci email
              s detailmi.
            </p>
            <div className="flex flex-col gap-sm max-w-xs mx-auto">
              <Button onClick={() => (window.location.href = "/my-bookings")}>
                Moje rezervácie
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  resetForm();
                  setStep(0);
                }}
              >
                Vytvoriť novú rezerváciu
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {/* Progress Steps */}
      <div className="mb-xl relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full z-0" />
        <div className="relative z-10 flex justify-between">
          {steps.map((step) => {
            const isActive = currentStep >= step.id;
            const isFinished = currentStep > step.id;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center gap-xs bg-[#1a1c2e] px-2"
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300
                    ${
                      isActive
                        ? "bg-primary text-white shadow-glow"
                        : "bg-white/10 text-muted"
                    }
                  `}
                >
                  {isFinished ? <Check size={20} /> : <step.icon size={20} />}
                </div>
                <span
                  className={`text-[10px] md:text-xs font-medium ${
                    isActive ? "text-white" : "text-muted"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-[400px]"
      >
        {renderStepContent()}
      </motion.div>

      {currentStep < steps.length ? (
        <div className="flex justify-between mt-xl border-t border-white/10 pt-lg">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0 || createBookingMutation.isPending}
            leftIcon={<ChevronLeft size={20} />}
          >
            Späť
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleCreateBooking}
              size="lg"
              className="px-xl"
              isLoading={createBookingMutation.isPending}
              rightIcon={<Check size={20} />}
            >
              Potvrdiť rezerváciu
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={
                (currentStep === 0 && !formData.locationId) ||
                (currentStep === 1 && !formData.serviceId) ||
                (currentStep === 2 && (!formData.date || !formData.timeSlot)) ||
                (currentStep === 3 &&
                  (!formData.customerName || !formData.customerEmail))
              }
              rightIcon={<ChevronRight size={20} />}
            >
              Pokračovať
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default BookingForm;
