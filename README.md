# Voice Command Shopping Assistant

A voice-driven shopping list manager where users can add, remove, and search products using natural voice commands. The app provides smart suggestions using the Gemini API when available, with a local fallback to ensure functionality without external services. It supports multiple languages including English, Hindi, Spanish, and French, and persists the shopping list in JSON format.

## My Approach

I implemented a voice-first interface using the Web Speech API to capture and process user commands. Commands are parsed for intent (add/remove) and quantity, then mapped to canonical product names. Smart suggestions are fetched from the Gemini API if available; otherwise, a local algorithm suggests items not yet in the list. The backend handles command processing, shopping list persistence, and suggestion logic, while the frontend provides real-time feedback, displays the shopping list, suggestions, and search results in a clean, mobile-first UI.

## Deployment

- **Backend** is deployed on Render to handle API requests and persist data.  
- **Frontend** is deployed on Vercel to serve the React application.  
- Both are deployed separately, with the frontend calling the backend API for commands, list updates, and suggestions.  

## Important Notes

- Gemini API is optional; the local suggestion logic ensures functionality if the API is unavailable.   
- Multilingual support allows users to interact in different languages seamlessly.  
- Minimalist design focuses on voice-first interaction and easy usability.
