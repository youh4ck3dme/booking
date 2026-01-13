import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export const Statistics: React.FC = () => {
  const revenueData = [
    { month: "Jan", value: 2400 },
    { month: "Feb", value: 1398 },
    { month: "Mar", value: 9800 },
    { month: "Apr", value: 3908 },
    { month: "May", value: 4800 },
    { month: "Jun", value: 3800 },
  ];

  const servicePopularity = [
    { name: "Strih vlasov", count: 45, color: "bg-indigo-500" },
    { name: "Farbenie", count: 32, color: "bg-purple-500" },
    { name: "Manikúra", count: 28, color: "bg-pink-500" },
    { name: "Masáž", count: 15, color: "bg-emerald-500" },
  ];

  const stats = [
    {
      label: "Celkové tržby",
      value: "4,285 €",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      label: "Noví zákazníci",
      value: "142",
      change: "+5.2%",
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Rezervácie",
      value: "382",
      change: "-2.4%",
      icon: Calendar,
      color: "text-purple-400",
    },
    {
      label: "Vyťaženosť",
      value: "84%",
      change: "+8.1%",
      icon: TrendingUp,
      color: "text-orange-400",
    },
  ];

  return (
    <div className="container py-xl max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-xl"
      >
        <div>
          <h1 className="text-3xl font-bold">Štatistiky a Reporty</h1>
          <p className="text-secondary">
            Analýza výkonnosti vášho biznisu v čase
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-4 gap-md">
          {stats.map((stat, idx) => (
            <Card key={idx} hover>
              <CardContent className="p-md">
                <div className="flex justify-between items-start mb-sm">
                  <div className={`p-sm rounded-lg bg-white/5 ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <div
                    className={`text-xs font-bold flex items-center ${
                      stat.change.startsWith("+")
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {stat.change}
                    {stat.change.startsWith("+") ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                  </div>
                </div>
                <p className="text-secondary text-xs uppercase tracking-wider font-bold">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-2 gap-xl">
          {/* Revenue Chart (Custom CSS Bars) */}
          <Card>
            <CardHeader>
              <CardTitle>Vývoj tržieb</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-sm pt-xl">
                {revenueData.map((d, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-sm group"
                  >
                    <div className="relative w-full flex justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.value / 10000) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="w-full max-w-[40px] bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg shadow-glow relative"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-bg-secondary border border-border px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {d.value}€
                        </div>
                      </motion.div>
                    </div>
                    <span className="text-xs text-secondary font-medium">
                      {d.month}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Popularity */}
          <Card>
            <CardHeader>
              <CardTitle>Popularita služieb</CardTitle>
            </CardHeader>
            <CardContent className="space-y-lg">
              {servicePopularity.map((s, i) => (
                <div key={i} className="space-y-xs">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-secondary font-bold">{s.count}x</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.count / 50) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className={`h-full ${s.color} shadow-glow`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Statistics;
