// Simulate AI response delay and logic

/* eslint-disable @typescript-eslint/no-explicit-any */

const responses = {
    greeting: ['Ahoj!', 'Dobrý deň!', 'Zdravím vás!'],
    booking: ['Rád vám pomôžem s rezerváciou. Akú službu hľadáte?', 'Samozrejme, poďme na to. Máte záujem o strih, farbenie alebo niečo iné?'],
    pricing: ['Ceny našich služieb začínajú od 15€ za pánsky strih a 25€ za dámsky.'],
    unknown: ['Prepáčte, nerozumel som. Môžete to skúsiť inak?', 'Nie som si istý, či rozumiem. Chcete vytvoriť rezerváciu?'],
};

export interface AIResponse {
    content: string;
    actions?: Array<{
        type: 'book' | 'cancel' | 'reschedule' | 'info';
        label: string;
        data?: any;
    }>;
}

export const processAIResponse = async (text: string): Promise<AIResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const lowerText = text.toLowerCase();

    // Greeting
    if (lowerText.includes('ahoj') || lowerText.includes('dobry') || lowerText.includes('zdravim')) {
        return { content: responses.greeting[Math.floor(Math.random() * responses.greeting.length)] };
    }

    // Booking Intent
    if (lowerText.includes('rezerv') || lowerText.includes('objedna') || lowerText.includes('termin')) {
        return {
            content: responses.booking[Math.floor(Math.random() * responses.booking.length)],
            actions: [{ type: 'book', label: 'Otvoriť rezerváciu' }]
        };
    }

    // Pricing Intent
    if (lowerText.includes('cena') || lowerText.includes('kolko') || lowerText.includes('cennik')) {
        return { content: responses.pricing[0] };
    }

    // Unknown
    return { content: responses.unknown[Math.floor(Math.random() * responses.unknown.length)] };
};
