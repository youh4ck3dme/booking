import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { useAuthStore } from "../stores/authStore";
import { useToast } from "../hooks/useToast";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email je povinný";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Neplatný email";
    }

    if (!password) {
      newErrors.password = "Heslo je povinné";
    } else if (password.length < 6) {
      newErrors.password = "Heslo musí mať aspoň 6 znakov";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const success = await login(email, password);

    if (success) {
      toast.success("Prihlásenie úspešné", "Vitajte späť!");
      navigate("/dashboard");
    } else {
      toast.error("Prihlásenie zlyhalo", "Nesprávny email alebo heslo");
    }
  };

  return (
    <div className="container py-xl flex items-center justify-center min-h-[calc(100vh-200px)]">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Prihlásenie</CardTitle>
            <CardDescription>Prihláste sa do svojho účtu</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="vas@email.sk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                leftIcon={<Mail size={18} />}
                autoComplete="email"
              />

              <Input
                type="password"
                label="Heslo"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                leftIcon={<Lock size={18} />}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
                leftIcon={<LogIn size={20} />}
              >
                Prihlásiť sa
              </Button>
            </form>

            {/* <div className="mt-lg text-center">
                            <p className="text-sm text-secondary">
                                Nemáte účet?{' '}
                                <Link to="/register" className="text-primary font-medium hover:underline">
                                    Registrovať sa
                                </Link>
                            </p>
                        </div> */}

            {/* Demo credentials */}
            <div className="mt-lg p-md bg-glass rounded-lg">
              <p className="text-xs text-muted mb-xs font-bold">Demo účty:</p>
              <div className="text-xs text-secondary space-y-1">
                <p>Admin: admin@bookflow.sk / admin123</p>
                <p>Zamestnanec: employee@bookflow.sk / emp123</p>
                <p>Zákazník: customer@example.com / cust123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
