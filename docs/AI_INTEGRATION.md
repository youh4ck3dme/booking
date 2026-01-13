# 🤖 AI Service Integration

BookFlow Pro features a built-in "Intelligent Agent" that acts as a first-line concierge for users. It is designed to be fast, privacy-focused, and offline-capable.

## Capabilities

The AI service (`src/services/aiService.ts`) is programmed to handle the following intents:

### 1. Booking Assistance

- **Triggers**: "I want to book", "reservation", "cut my hair"
- **Action**: Guides the user to the booking flow or suggests available slots (future implementation).
- **Response**: "I can help you with that! Should we start by picking a date?"

### 2. Business Information

- **Triggers**: "Where are you?", "opening hours", "open?"
- **Action**: Retrieves data from the central settings store.
- **Response**: Returns formatted address or opening hours.

### 3. Rescheduling

- **Triggers**: "Change my appointment", "reschedule", "cancel"
- **Action**: Deep-links to the 'My Bookings' page.

## Data Flow

1. **Input**: User types in `ChatWidget`.
2. **Processing**: Text is normalized and matched against keyword patterns/regex in `aiService`.
3. **Intent Resolution**:
   - A confidence score is calculated.
   - If `confidence > 0.7`, the intent is executed.
   - If not, a fallback "Human Handover" response is triggered.
4. **Action**: The ChatWidget may execute a navigation event (e.g., redirect to `/book`) based on the intent.

## Future Plans (Phase 2)

- **Vector Search**: Integrating OpenAI embeddings for smarter RAG (Retrieval Augmented Generation) on business FAQs.
- **Voice Input**: Using Web Speech API for voice bookings.
