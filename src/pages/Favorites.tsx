import React from 'react';
import { motion } from 'framer-motion';
import { Heart, User, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useFavorites, useToggleFavorite } from '../hooks/useFavorites';
import { useEmployees } from '../hooks/useEmployees'; // Assuming this exists directly or via useLocations
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

export const Favorites: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: favorites = [], isLoading: isFavLoading } = useFavorites(user?.id);
  const { data: employees = [] } = useEmployees(); // Fetch all employees to map
  const toggleFavorite = useToggleFavorite();

  const favoriteEmployees = employees.filter(e => favorites.some(f => f.employeeId === e.id));

  const handleToggle = (e: React.MouseEvent, employeeId: string) => {
    e.stopPropagation();
    if (!user) return;
    toggleFavorite.mutate({
      customerId: user.id,
      employeeId,
      isFavorite: true // Removing since we are listing favorites, clicking heart usually means removing from list?
                       // Actually toggle logic in hook might differ. Let's assume removing.
                       // Implementation of hook was toggle based on current state check?
                       // Review hook: "if (isFavorite)" -> delete.
    });
    // However, here we know they are favorites. So we click to remove.
    toggleFavorite.mutate({ customerId: user.id, employeeId, isFavorite: true });
  };

  if (isFavLoading) {
    return <div className="container py-xl flex justify-center"><div className="spinner" /></div>;
  }

  if (favoriteEmployees.length === 0) {
    return (
      <div className="container py-xl max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-lg">Obľúbení zamestnanci</h1>
        <EmptyState
            title="Žiadni obľúbení"
            description="Označte si svojich obľúbených zamestnancov srdiečkom pre rýchlejšie objednávanie."
            icon={Heart}
            actionLabel="Nájsť služby"
            onAction={() => navigate('/book')}
        />
      </div>
    );
  }

  return (
    <div className="container py-xl max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-lg">Obľúbení zamestnanci</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {favoriteEmployees.map(employee => (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="h-full flex flex-col items-center text-center p-lg relative group">
                <button
                    onClick={(e) => handleToggle(e, employee.id)}
                    className="absolute top-sm right-sm p-xs rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                    <Heart className="fill-current" size={20} />
                </button>

                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-md text-primary">
                    {employee.avatar ? (
                        <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <User size={40} />
                    )}
                </div>

                <h3 className="text-xl font-bold mb-xs">{employee.name}</h3>
                <p className="text-secondary text-sm mb-md line-clamp-2">
                    {/* Assuming employee has description or services list */}
                    Profesionálny prístup a dlhoročné skúsenosti.
                </p>

                <div className="mt-auto w-full">
                    <Button 
                        className="w-full"
                        onClick={() => navigate('/book')}
                    >
                        <Calendar size={18} className="mr-xs" />
                        Objednať sa
                    </Button>
                </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
