import React from 'react';
import { motion } from 'framer-motion';
import { BookingForm } from '../components/booking/BookingForm';

export const Book: React.FC = () => {
    return (
        <div className="container py-xl max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-xl text-center"
            >
                <h1 className="text-3xl font-bold mb-sm">Nová rezervácia</h1>
                <p className="text-secondary">Vyberte si službu a termín, ktorý vám vyhovuje.</p>
            </motion.div>

            <BookingForm />
        </div>
    );
};

export default Book;
