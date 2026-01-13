import { describe, it, expect, beforeEach } from 'vitest';
import { useBookingStore } from '../stores/bookingStore';
import { act } from '@testing-library/react';

describe('useBookingStore', () => {
    beforeEach(() => {
        act(() => {
            useBookingStore.getState().resetForm();
        });
    });

    it('should have initial state', () => {
        const state = useBookingStore.getState();
        expect(state.currentStep).toBe(0);
        expect(state.formData.serviceId).toBe('');
        expect(state.formData.customerName).toBe('');
    });

    it('should update form data', () => {
        act(() => {
            useBookingStore.getState().setFormData({ customerName: 'Test User' });
        });
        expect(useBookingStore.getState().formData.customerName).toBe('Test User');
    });

    it('should partially update form data', () => {
        act(() => {
            useBookingStore.getState().setFormData({ serviceId: 's1' });
        });
        act(() => {
            useBookingStore.getState().setFormData({ customerEmail: 'test@example.com' });
        });

        const { formData } = useBookingStore.getState();
        expect(formData.serviceId).toBe('s1');
        expect(formData.customerEmail).toBe('test@example.com');
    });

    it('should navigate through steps', () => {
        act(() => {
            useBookingStore.getState().nextStep();
        });
        expect(useBookingStore.getState().currentStep).toBe(1);

        act(() => {
            useBookingStore.getState().nextStep();
        });
        expect(useBookingStore.getState().currentStep).toBe(2);

        act(() => {
            useBookingStore.getState().prevStep();
        });
        expect(useBookingStore.getState().currentStep).toBe(1);
    });

    it('should not go below step 0', () => {
        act(() => {
            useBookingStore.getState().prevStep();
        });
        expect(useBookingStore.getState().currentStep).toBe(0);
    });

    it('should set specific step', () => {
        act(() => {
            useBookingStore.getState().setStep(3);
        });
        expect(useBookingStore.getState().currentStep).toBe(3);
    });

    it('should reset form', () => {
        act(() => {
            useBookingStore.getState().setFormData({ serviceId: 's1' });
            useBookingStore.getState().setStep(2);
            useBookingStore.getState().resetForm();
        });

        const state = useBookingStore.getState();
        expect(state.currentStep).toBe(0);
        expect(state.formData.serviceId).toBe('');
    });
});
