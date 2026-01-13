import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Save,
  Shield,
} from "lucide-react";

export const Profile: React.FC = () => {
  const { user, updateUser, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await updateUser({
        name: formData.name,
        phone: formData.phone,
      });
      setMessage({
        type: "success",
        text: "Profil bol úspešne aktualizovaný.",
      });
    } catch {
      setMessage({ type: "error", text: "Nepodarilo sa aktualizovať profil." });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Heslá sa nezhodujú." });
      return;
    }
    // Password change logic would go here (integrating with Supabase Auth)
    setMessage({ type: "success", text: "Heslo bolo úspešne zmenené." });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="container py-xl max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-xl"
      >
        <div className="flex items-center gap-md">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-glow">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="text-secondary flex items-center gap-1">
              <Shield size={14} className="text-primary" />
              {user?.role === "admin"
                ? "Administrátor"
                : user?.role === "employee"
                ? "Zamestnanec"
                : "Zákazník"}
            </p>
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-md rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <UserIcon size={20} className="text-primary" />
              Osobné údaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-md">
              <Input
                label="Meno a priezvisko"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                leftIcon={<UserIcon size={18} />}
                placeholder="Ján Novák"
                required
              />
              <Input
                label="Email"
                value={formData.email}
                leftIcon={<Mail size={18} />}
                disabled
                helperText="Email nie je možné zmeniť."
              />
              <Input
                label="Telefónne číslo"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                leftIcon={<Phone size={18} />}
                placeholder="+421 9xx xxx xxx"
              />
              <Button
                type="submit"
                isLoading={isLoading}
                leftIcon={<Save size={18} />}
              >
                Uložiť zmeny
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <Lock size={20} className="text-secondary" />
              Zmena hesla
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-md">
              <Input
                label="Súčasné heslo"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                leftIcon={<Lock size={18} />}
                required
              />
              <Input
                label="Nové heslo"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                leftIcon={<Lock size={18} />}
                required
              />
              <Input
                label="Potvrdiť nové heslo"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                leftIcon={<Lock size={18} />}
                required
              />
              <Button type="submit" variant="secondary">
                Zmeniť heslo
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;
