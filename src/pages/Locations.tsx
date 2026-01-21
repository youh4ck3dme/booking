import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit, Trash2, Phone, Mail, Clock, Search, X } from 'lucide-react';
import { useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from '../hooks/useLocations';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { useToast } from '../hooks/useToast';
import type { Location } from '../types';

export const Locations: React.FC = () => {
  const { data: locations = [] } = useLocations();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<Partial<Location>>({
    name: '',
    address: '',
    phone: '',
    email: '',
    businessHours: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: null,
      sunday: null,
    },
  });

  const handleOpenModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData(location);
    } else {
      setEditingLocation(null);
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        businessHours: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: null,
          sunday: null,
        },
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await updateLocation.mutateAsync({ ...formData, id: editingLocation.id } as Location);
        toast.success('Vybavené', 'Prevádzka bola úspešne upravená.');
      } else {
        await createLocation.mutateAsync(formData as Omit<Location, 'id'>);
        toast.success('Vybavené', 'Nová prevádzka bola vytvorená.');
      }
      setIsModalOpen(false);
    } catch (err) {
       console.error(err);
       toast.error('Chyba', 'Nepodarilo sa uložiť prevádzku.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Naozaj chcete vymazať prevádzku ${name}?`)) {
      try {
        await deleteLocation.mutateAsync(id);
        toast.success('Vybavené', 'Prevádzka bola vymazaná.');
      } catch (err) {
        console.error(err);
        toast.error('Chyba', 'Nepodarilo sa vymazať prevádzku.');
      }
    }
  };

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-xl">
        <div>
          <h1 className="text-3xl font-bold mb-xs">Prevádzky</h1>
          <p className="text-secondary">Správa pobočiek a otváracích hodín</p>
        </div>
        <Button onClick={() => handleOpenModal()} leftIcon={<Plus size={20} />}>
          Pridať prevádzku
        </Button>
      </div>

      {/* Search */}
      <div className="mb-lg relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          type="text"
          placeholder="Hľadať prevádzku..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Locations Grid */}
      <div className="grid gap-md">
        <AnimatePresence mode="popLayout">
          {filteredLocations.map((location) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
            >
              <Card>
                <CardContent className="p-lg flex flex-col md:flex-row gap-lg">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin size={32} className="text-primary" />
                  </div>
                  
                  <div className="flex-1 space-y-sm">
                    <h3 className="text-xl font-bold">{location.name}</h3>
                    <div className="space-y-xs text-sm text-secondary">
                      <div className="flex items-center gap-sm">
                        <MapPin size={16} className="text-muted" />
                        {location.address}
                      </div>
                      <div className="flex items-center gap-sm">
                        <Phone size={16} className="text-muted" />
                        {location.phone}
                      </div>
                      <div className="flex items-center gap-sm">
                        <Mail size={16} className="text-muted" />
                        {location.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-sm justify-center">
                    <Button variant="secondary" size="sm" onClick={() => handleOpenModal(location)} leftIcon={<Edit size={16} />}>
                      Upraviť
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(location.id, location.name)} leftIcon={<Trash2 size={16} />}>
                      Vymazať
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredLocations.length === 0 && (
          <div className="text-center py-xl bg-white/5 rounded-xl border border-dashed border-white/10">
            <MapPin className="mx-auto h-12 w-12 text-muted mb-md opacity-50" />
            <h3 className="text-lg font-bold mb-xs">Žiadne prevádzky</h3>
            <p className="text-secondary">Nenašli sa žiadne prevádzky vyhovujúce hľadaniu.</p>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background-secondary border border-white/10 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-lg border-b border-white/10 flex justify-between items-center sticky top-0 bg-background-secondary z-10">
                <h2 className="text-xl font-bold">
                  {editingLocation ? 'Upraviť prevádzku' : 'Pridať prevádzku'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-lg space-y-md">
                <Input
                  label="Názov prevádzky"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Napr. Pobočka Centrum"
                />
                <Input
                  label="Adresa"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  leftIcon={<MapPin size={18} />}
                  placeholder="Ulica 123, Mesto"
                />
                <div className="grid grid-cols-2 gap-md">
                  <Input
                    label="Telefón"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    leftIcon={<Phone size={18} />}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    leftIcon={<Mail size={18} />}
                  />
                </div>

                <div className="pt-md border-t border-white/10">
                  <h3 className="font-bold mb-md flex items-center gap-sm">
                    <Clock size={18} className="text-primary" />
                    Otváracie hodiny
                  </h3>
                  <p className="text-sm text-secondary mb-md">
                    Pre zjednodušenie sa tu nastavujú defaultné hodiny (09:00 - 17:00).
                    Detailné nastavenie otváracích hodín bude dostupné v detaile.
                  </p>
                  {/* Simplification for MVP: We stick to default hours or implementation later */}
                </div>

                <div className="flex justify-end gap-md pt-lg">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Zrušiť
                  </Button>
                  <Button type="submit" isLoading={updateLocation.isPending || createLocation.isPending}>
                    {editingLocation ? 'Uložiť zmeny' : 'Vytvoriť'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Locations;
