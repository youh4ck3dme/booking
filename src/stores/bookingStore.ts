import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BookingFormData } from '../types';

interface BookingUIState {
    // Form state
    formData: BookingFormData;
    currentStep: number;

    // Actions
    setFormData: (data: Partial<BookingFormData>) => void;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    resetForm: () => void;
}

const initialFormData: BookingFormData = {
    serviceId: '',
    employeeId: undefined,
    date: null,
    timeSlot: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
};

export const useBookingStore = create<BookingUIState>()(
    persist(
        (set) => ({
            formData: initialFormData,
            currentStep: 0,

            setFormData: (data) => {
                set((state) => ({
                    formData: { ...state.formData, ...data },
                }));
            },

            setStep: (step) => set({ currentStep: step }),
            nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
            prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
            resetForm: () => set({ formData: initialFormData, currentStep: 0 }),
        }),
        {
            name: 'bookflow-booking-ui',
            partialize: (state) => ({
                formData: state.formData,
                currentStep: state.currentStep
            }),
        }
    )
);
