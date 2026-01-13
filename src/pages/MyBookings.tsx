import React from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import {
  Calendar,
  Clock,
  User as UserIcon,
  XCircle,
  RefreshCw,
  Star,
  Inbox,
} from "lucide-react";
import { useBookings, useCancelBooking } from "../hooks/useBookings";
import type { Booking } from "../types";

export const MyBookings: React.FC = () => {
  const { user } = useAuthStore();
  const { data: bookings = [], isLoading } = useBookings(user?.id);
  const cancelMutation = useCancelBooking();

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.date) >= new Date() && b.status !== "cancelled"
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.date) < new Date() && b.status !== "cancelled"
  );
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  const handleCancel = async (id: string) => {
    if (confirm("Naozaj chcete zrušiť túto rezerváciu?")) {
      try {
        await cancelMutation.mutateAsync(id);
      } catch (error) {
        console.error("Cancellation failed:", error);
      }
    }
  };

  const BookingItem = ({
    booking,
    isUpcoming = false,
  }: {
    booking: Booking;
    isUpcoming?: boolean;
  }) => (
    <Card className="mb-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div className="space-y-xs">
          <div className="flex items-center gap-sm text-primary font-bold">
            <Calendar size={18} />
            <span>
              {format(new Date(booking.date), "d. MMMM yyyy", { locale: sk })}
            </span>
          </div>
          <div className="flex items-center gap-sm text-lg font-semibold">
            <Clock size={18} className="text-secondary" />
            <span>
              {booking.startTime} - {booking.endTime}
            </span>
          </div>
          <div className="flex items-center gap-sm text-secondary">
            <UserIcon size={18} />
            <span>
              {booking.serviceName} s {booking.employeeName}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-sm">
          <div
            className={`px-sm py-xs rounded-full text-xs font-bold uppercase tracking-wider ${
              booking.status === "confirmed"
                ? "bg-green-500/20 text-green-400"
                : booking.status === "pending"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {booking.status === "confirmed"
              ? "Potvrdené"
              : booking.status === "pending"
              ? "Čaká na potvrdenie"
              : "Zrušené"}
          </div>
          {isUpcoming && booking.status !== "cancelled" && (
            <Button
              variant="secondary"
              size="sm"
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
              onClick={() => handleCancel(booking.id)}
              isLoading={
                cancelMutation.isPending &&
                cancelMutation.variables === booking.id
              }
            >
              <XCircle size={16} className="mr-xs" />
              Zrušiť
            </Button>
          )}
          {!isUpcoming && booking.status === "confirmed" && (
            <div className="flex gap-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert("Ďakujeme za hodnotenie!")}
              >
                <Star size={16} className="mr-xs text-yellow-400" />
                Ohodnotiť
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => (window.location.href = "/book")}
              >
                <RefreshCw size={16} className="mr-xs" />
                Znovu objednať
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="container py-xl max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-lg">Moje rezervácie</h1>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-2xl">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-md" />
            <p className="text-secondary">Načítavam vaše rezervácie...</p>
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            title="Zatiaľ žiadne rezervácie"
            description="Tu uvidíte všetky vaše nadchádzajúce a minulé rezervácie. Začnite výberom služby."
            icon={Inbox}
            actionLabel="Vytvoriť prvú rezerváciu"
            onAction={() => (window.location.href = "/book")}
          />
        ) : (
          <div className="space-y-xl">
            <section>
              <h2 className="text-xl font-bold mb-md flex items-center gap-sm">
                <span className="w-2 h-8 bg-primary rounded-full"></span>
                Nadchádzajúce
              </h2>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-md">
                  {upcomingBookings.map((b) => (
                    <BookingItem key={b.id} booking={b} isUpcoming />
                  ))}
                </div>
              ) : (
                <p className="text-secondary italic">
                  Žiadne nadchádzajúce rezervácie.
                </p>
              )}
            </section>

            {pastBookings.length > 0 && (
              <section className="opacity-70 hover:opacity-100 transition-opacity">
                <h2 className="text-xl font-bold mb-md flex items-center gap-sm">
                  <span className="w-2 h-8 bg-secondary rounded-full"></span>
                  História
                </h2>
                <div className="space-y-md">
                  {pastBookings.map((b) => (
                    <BookingItem key={b.id} booking={b} />
                  ))}
                </div>
              </section>
            )}

            {cancelledBookings.length > 0 && (
              <section className="opacity-50">
                <h2 className="text-xl font-bold mb-md flex items-center gap-sm">
                  <span className="w-2 h-8 bg-red-500 rounded-full"></span>
                  Zrušené
                </h2>
                <div className="space-y-md">
                  {cancelledBookings.map((b) => (
                    <BookingItem key={b.id} booking={b} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyBookings;
