/**
 * BookFlow Pro - AI Assistant Service
 * 
 * Integrates with OpenAI API for intelligent booking assistance.
 * Falls back to enhanced mock responses if API unavailable.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// System prompt that teaches AI about BookFlow Pro
const SYSTEM_PROMPT = `Si AI asistent pre BookFlow Pro - moderný rezervačný systém pre salóny krásy na Slovensku.

## O firme
- Názov: BookFlow Pro Beauty Salon
- Sídlo: Bratislava, Slovensko
- Jazyk komunikácie: Slovenčina

## Služby a ceny
1. **Pánsky strih** - 15€, 30 min
2. **Dámsky strih** - 25€, 45 min  
3. **Farbenie vlasov** - od 45€, 120 min
4. **Styling** - 20€, 30 min
5. **Úprava brady** - 10€, 15 min
6. **Balíček strih + styling** - 35€, 60 min

## Otváracie hodiny
- Pondelok - Piatok: 9:00 - 18:00
- Sobota: 9:00 - 14:00
- Nedeľa: Zatvorené

## Ako pomôcť zákazníkovi
1. Na otázky o cenách odpovedz s konkrétnymi cenami
2. Pre rezerváciu navrhni odkaz na booking stránku
3. Pre zmenu termínu odkáž na "Moje rezervácie"
4. Buď priateľský, stručný a profesionálny
5. Vždy odpovedaj po slovensky

## Formát odpovede
Odpovedaj v JSON formáte:
{
  "message": "Tvoja odpoveď zákazníkovi",
  "action": null | { "type": "book" | "reschedule" | "info", "label": "Text tlačidla" }
}`;

export interface AIResponse {
    content: string;
    actions?: Array<{
        type: 'book' | 'cancel' | 'reschedule' | 'info';
        label: string;
        data?: any;
    }>;
}

// Enhanced mock responses with more context
const mockResponses = {
    greeting: [
        'Ahoj! 👋 Som váš AI asistent. Ako vám môžem pomôcť s rezerváciou?',
        'Dobrý deň! Vitajte v BookFlow Pro. Chcete si rezervovať termín alebo potrebujete poradiť?'
    ],
    booking: [
        'Rád vám pomôžem s rezerváciou! 📅 Máme tieto služby:\n\n• Pánsky strih - 15€\n• Dámsky strih - 25€\n• Farbenie - od 45€\n• Styling - 20€\n\nKtorou máte záujem?',
    ],
    pricing: [
        '💰 **Náš cenník:**\n\n• Pánsky strih: 15€ (30 min)\n• Dámsky strih: 25€ (45 min)\n• Farbenie vlasov: od 45€ (120 min)\n• Styling: 20€ (30 min)\n• Úprava brady: 10€ (15 min)\n\nChcete si rezervovať niektorú zo služieb?'
    ],
    reschedule: [
        'Pre zmenu termínu prejdite do sekcie **Moje rezervácie** vo vašom profile. Tam môžete termín zmeniť alebo zrušiť. 📝'
    ],
    info: [
        'Vaše rezervácie nájdete v sekcii **Moje rezervácie**. 📋 Ak nie ste prihlásený, prihláste sa prosím najskôr.'
    ],
    hours: [
        '🕐 **Otváracie hodiny:**\n\n• Po - Pia: 9:00 - 18:00\n• Sobota: 9:00 - 14:00\n• Nedeľa: Zatvorené\n\nNajbližšie voľné termíny nájdete pri rezervácii.'
    ],
    unknown: [
        'Rozumiem! Môžem vám pomôcť s:\n\n• 📅 Rezerváciou termínu\n• 💰 Cenníkom služieb\n• 📍 Informáciami o salóne\n\nČo by ste potrebovali?'
    ],
    welcome: [
        'Dobrý deň! 👋 Som váš AI asistent. Ako vám môžem pomôcť s rezerváciou?'
    ]
};

// Check if OpenAI API is configured
const isOpenAIConfigured = (): boolean => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    return !!apiKey && apiKey !== 'sk-your-api-key-here' && apiKey.startsWith('sk-');
};

// Call OpenAI API
const callOpenAI = async (userMessage: string, conversationHistory: Array<{role: string, content: string}>): Promise<AIResponse> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const model = import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini';

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory.slice(-5), // Keep last 5 messages for context
        { role: 'user', content: userMessage }
    ];

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens: 500,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const aiMessage = data.choices[0]?.message?.content || '';

        // Try to parse JSON response
        try {
            const parsed = JSON.parse(aiMessage);
            return {
                content: parsed.message || aiMessage,
                actions: parsed.action ? [parsed.action] : undefined
            };
        } catch {
            // If not JSON, return as plain text
            return { content: aiMessage };
        }
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
    }
};

// Enhanced mock response with better intent detection
const getMockResponse = (text: string): AIResponse => {
    const lowerText = text.toLowerCase();

    // Greeting
    if (lowerText.includes('ahoj') || lowerText.includes('dobry') || lowerText.includes('zdravim') || lowerText.includes('cau')) {
        return { 
            content: mockResponses.greeting[Math.floor(Math.random() * mockResponses.greeting.length)],
            actions: [
                { type: 'book', label: '📅 Nová rezervácia' },
                { type: 'info', label: '💰 Cenník' }
            ]
        };
    }

    // Opening hours
    if (lowerText.includes('otvor') || lowerText.includes('hodin') || lowerText.includes('kedy ste')) {
        return { content: mockResponses.hours[0] };
    }

    // Info about existing bookings
    if (lowerText.includes('kedy') || (lowerText.includes('moj') && lowerText.includes('rezerv'))) {
        return {
            content: mockResponses.info[0],
            actions: [{ type: 'info', label: 'Moje rezervácie' }]
        };
    }

    // Reschedule
    if (lowerText.includes('zmeni') || lowerText.includes('presun') || lowerText.includes('zrus')) {
        return {
            content: mockResponses.reschedule[0],
            actions: [{ type: 'reschedule', label: 'Moje rezervácie' }]
        };
    }

    // Pricing
    if (lowerText.includes('cena') || lowerText.includes('kolko') || lowerText.includes('cennik') || lowerText.includes('stoj')) {
        return { 
            content: mockResponses.pricing[0],
            actions: [{ type: 'book', label: '📅 Rezervovať' }]
        };
    }

    // Booking intent
    if (lowerText.includes('rezerv') || lowerText.includes('objedna') || lowerText.includes('termin') || 
        lowerText.includes('chcem') || lowerText.includes('strih') || lowerText.includes('farb')) {
        return {
            content: mockResponses.booking[0],
            actions: [{ type: 'book', label: '📅 Otvoriť rezerváciu' }]
        };
    }

    // Unknown - provide helpful suggestions
    return { 
        content: mockResponses.unknown[0],
        actions: [
            { type: 'book', label: '📅 Rezervovať' },
            { type: 'info', label: '💰 Cenník' }
        ]
    };
};

// Main AI response processor
export const processAIResponse = async (
    text: string, 
    conversationHistory: Array<{role: string, content: string}> = []
): Promise<AIResponse> => {
    // Simulate slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    // Try OpenAI if configured
    if (isOpenAIConfigured()) {
        try {
            return await callOpenAI(text, conversationHistory);
        } catch (error) {
            console.warn('OpenAI failed, falling back to mock:', error);
            // Fall through to mock
        }
    }

    // Use enhanced mock response
    return getMockResponse(text);
};

// Get welcome message
export const getWelcomeMessage = (): AIResponse => {
    return {
        content: mockResponses.welcome[0],
        actions: [
            { type: 'book', label: '📅 Nová rezervácia' },
            { type: 'info', label: '💰 Cenník služieb' }
        ]
    };
};

// Check if AI is using real API
export const isUsingRealAI = (): boolean => isOpenAIConfigured();
