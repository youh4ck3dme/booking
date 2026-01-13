import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "../hooks/useEmployees";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Plus, Edit2, Trash2, Mail, Phone, Save, X, User } from "lucide-react";
import type { Employee, WorkingHours } from "../types";

const EMPTY_WORKING_HOURS: WorkingHours = {
  monday: { start: "09:00", end: "17:00" },
  tuesday: { start: "09:00", end: "17:00" },
  wednesday: { start: "09:00", end: "17:00" },
  thursday: { start: "09:00", end: "17:00" },
  friday: { start: "09:00", end: "17:00" },
};

export const StaffManagement: React.FC = () => {
  const { data: employees = [], isLoading } = useEmployees();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<Partial<Employee> | null>(null);

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setSelectedEmployee({
      name: "",
      email: "",
      phone: "",
      color: "#6366f1",
      services: [],
      workingHours: EMPTY_WORKING_HOURS,
      avatar: "",
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Naozaj chcete odstrániť tohto zamestnanca?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      if (selectedEmployee.id) {
        await updateMutation.mutateAsync(selectedEmployee as Employee);
      } else {
        await createMutation.mutateAsync(
          selectedEmployee as Omit<Employee, "id">
        );
      }
      setIsEditing(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  if (isLoading)
    return <div className="container py-xl text-center">Načítavam...</div>;

  return (
    <div className="container py-xl max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="text-3xl font-bold">Správa zamestnancov</h1>
          <p className="text-secondary">
            Spravujte svoj tím a ich pracovné časy
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleAddNew} leftIcon={<Plus size={20} />}>
            Pridať zamestnanca
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {selectedEmployee?.id
                    ? "Upraviť zamestnanca"
                    : "Nový zamestnanec"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  <X size={20} />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-lg">
                  <div className="grid grid-1 md:grid-2 gap-md">
                    <Input
                      label="Meno a priezvisko"
                      value={selectedEmployee?.name || ""}
                      onChange={(e) =>
                        setSelectedEmployee({
                          ...selectedEmployee,
                          name: e.target.value,
                        })
                      }
                      leftIcon={<User size={18} />}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={selectedEmployee?.email || ""}
                      onChange={(e) =>
                        setSelectedEmployee({
                          ...selectedEmployee,
                          email: e.target.value,
                        })
                      }
                      leftIcon={<Mail size={18} />}
                      required
                    />
                    <Input
                      label="Telefón"
                      value={selectedEmployee?.phone || ""}
                      onChange={(e) =>
                        setSelectedEmployee({
                          ...selectedEmployee,
                          phone: e.target.value,
                        })
                      }
                      leftIcon={<Phone size={18} />}
                    />
                    <Input
                      label="Farba (HEX)"
                      type="color"
                      value={selectedEmployee?.color || "#6366f1"}
                      onChange={(e) =>
                        setSelectedEmployee({
                          ...selectedEmployee,
                          color: e.target.value,
                        })
                      }
                      className="h-12 p-1"
                    />
                  </div>

                  <div className="flex justify-end gap-md pt-md border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Zrušiť
                    </Button>
                    <Button
                      type="submit"
                      leftIcon={<Save size={18} />}
                      isLoading={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      Uložiť
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-1 md:grid-2 lg:grid-3 gap-md"
          >
            {employees.map((emp) => (
              <motion.div key={emp.id} layout>
                <Card hover>
                  <CardContent className="p-md">
                    <div className="flex items-center gap-md mb-md">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                        style={{ backgroundColor: emp.color }}
                      >
                        {emp.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{emp.name}</h3>
                        <p className="text-xs text-secondary">{emp.email}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(emp)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:bg-red-500/10 border-red-500/20"
                        onClick={() => handleDelete(emp.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffManagement;
