import React from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { DashboardBookings } from "../components/dashboard/DashboardBookings";
import { Button } from "../components/ui/Button";
import {
  Plus,
  Users,
  Settings as SettingsIcon,
  Printer,
  Calendar,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useBlockTime } from "../hooks/useBookings";
import { useEmployees } from "../hooks/useEmployees";

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const blockMutation = useBlockTime();
  const { data: employees = [] } = useEmployees();

  if (user?.role === "customer") {
    return <Navigate to="/my-bookings" replace />;
  }

  const isAdmin = user?.role === "admin";

  const handlePrint = () => {
    window.print();
  };

  const handleBlockTime = async () => {
    if (employees.length === 0) {
      alert("Nenašli sa žiadni zamestnanci pre blokovanie termínu.");
      return;
    }

    const time = prompt("Zadajte čas blokovania (HH:mm):", "09:00");
    if (!time) return;

    try {
      await blockMutation.mutateAsync({
        employeeId: employees[0].id,
        date: new Date(),
        startTime: time,
        duration: 30,
      });
    } catch (err) {
      console.error("Block failed:", err);
    }
  };

  return (
    <div className="container py-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-sm">
            <span className="text-4xl">👋</span>
            <div>
              <h1 className="text-3xl font-bold">
                Vitajte, {user?.name.split(" ")[0]}
              </h1>
              <p className="text-secondary">
                {isAdmin ? "Administrátorský prehľad" : "Zamestnanecký portál"}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-sm">
          {isAdmin && (
            <Link to="/settings">
              <Button variant="outline" leftIcon={<SettingsIcon size={18} />}>
                Nastavenia
              </Button>
            </Link>
          )}
          <Link to="/book">
            <Button leftIcon={<Plus size={20} />}>Nová rezervácia</Button>
          </Link>
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-3 gap-lg mt-lg">
        <div className="lg:col-span-2 space-y-lg">
          <section>
            <div className="flex justify-between items-center mb-md">
              <h2 className="text-xl font-bold flex items-center gap-sm">
                <Calendar className="text-primary" />
                {isAdmin ? "Všetky rezervácie" : "Môj kalendár"}
              </h2>
            </div>
            <DashboardBookings />
          </section>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="space-y-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-md"
          >
            <h3 className="font-bold mb-md text-lg text-center">
              Rýchle akcie
            </h3>
            <div className="grid grid-2 gap-sm">
              <Button
                variant="secondary"
                className="flex-col h-auto p-md gap-sm"
                title="Tlač denného prehľadu"
                onClick={handlePrint}
              >
                <Printer size={24} />
                <span className="text-xs">Tlač prehľadu</span>
              </Button>
              {isAdmin && (
                <Link to="/staff" className="flex-col h-auto p-md gap-sm">
                  <Button
                    variant="secondary"
                    className="w-full flex-col h-auto p-md gap-sm"
                    title="Správa zamestnancov"
                  >
                    <Users size={24} />
                    <span className="text-xs">Zamestnanci</span>
                  </Button>
                </Link>
              )}
              <Button
                variant="secondary"
                className="flex-col h-auto p-md gap-sm"
                title="Blokovať termín"
                onClick={handleBlockTime}
                isLoading={blockMutation.isPending}
              >
                <Calendar size={24} />
                <span className="text-xs">Blokovať</span>
              </Button>
              <Link to="/settings" className="flex-col h-auto p-md gap-sm">
                <Button
                  variant="secondary"
                  className="w-full flex-col h-auto p-md gap-sm"
                  title="Nastavenia"
                >
                  <SettingsIcon size={24} />
                  <span className="text-xs">Nastavenia</span>
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-md bg-gradient-to-br from-secondary-dark/20 to-secondary/10 border-secondary/30 text-center"
          >
            <h3 className="font-bold mb-xs flex items-center justify-center gap-sm">
              <span className="text-yellow-400">💡</span> Pro Tip
            </h3>
            <p className="text-sm text-secondary leading-relaxed">
              {isAdmin ? (
                <>
                  Skontrolujte vyťaženosť zamestnancov v sekcii{" "}
                  <Link
                    to="/statistics"
                    className="text-secondary hover:underline font-bold"
                  >
                    Štatistiky
                  </Link>{" "}
                  pre optimalizáciu smien.
                </>
              ) : (
                "Nezabudnite si vyznačiť obednú pauzu v kalendári aspoň 24h vopred."
              )}
            </p>
          </motion.div>

          {/* Notifications Widget */}
          <div className="glass-card p-md text-center">
            <h3 className="font-bold mb-xs text-sm uppercase tracking-wider text-secondary">
              Notifikácie
            </h3>
            {Notification.permission === "granted" ? (
              <div className="text-sm text-green-400 flex items-center justify-center gap-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Notifikácie sú zapnuté
              </div>
            ) : (
              <div className="space-y-sm">
                <p className="text-sm text-secondary">
                  Získajte upozornenia o vašich rezerváciách.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    Notification.requestPermission().then((perm) => {
                      if (perm === "granted") {
                        // Force re-render or toast
                        window.location.reload();
                      }
                    });
                  }}
                >
                  Zapnúť notifikácie
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
