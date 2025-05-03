# DishWish - AI Indian Recipe Generator

This is a Next.js application built in Firebase Studio that allows users to generate Indian recipes based on vegetable names or images using AI. It features user authentication via Firebase.

## Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

2.  **Configure Firebase:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Enable **Authentication** with the desired providers (e.g., Google, Email/Password).
    *   Go to Project settings > General tab.
    *   Under "Your apps", click the Web icon (`</>`) to register a web app.
    *   Copy the `firebaseConfig` object values.
    *   Rename the `.env.example` file to `.env`.
    *   Paste your Firebase configuration values into the `.env` file, replacing the `YOUR_*` placeholders. For example:
        ```dotenv
        NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
        NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...
        ```

3.  **(Optional) Configure Genkit/Google AI:**
    *   If you plan to use the Genkit AI features for recipe generation, you need a Google AI API key.
    *   Obtain a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Add the key to your `.env` file:
        ```dotenv
        GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_GENAI_API_KEY
        ```

4.  **(Optional) Configure YouTube API:**
    *   If you want to fetch actual YouTube videos instead of placeholders, you need a YouTube Data API v3 key.
    *   Follow the instructions [here](https://developers.google.com/youtube/v3/getting-started) to get an API key.
    *   Enable the "YouTube Data API v3" for your project in the Google Cloud Console.
    *   Add the key to your `.env` file:
        ```dotenv
        NEXT_PUBLIC_YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY
        ```
    *   You will also need to update the `src/services/youtube.ts` file to use this key and make actual API calls.

5.  **Run the Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

Open [http://localhost:9002](http://localhost:9002) (or your configured port) with your browser to see the result.

## Key Features

*   **AI Recipe Generation:** Uses Genkit (powered by Google AI) to generate Indian recipes.
*   **Input Options:** Accepts vegetable names or uploaded images.
*   **Firebase Authentication:** Secure user login/signup using Google and Email/Password.
*   **Modern UI:** Built with Next.js App Router, TypeScript, Tailwind CSS, and ShadCN UI components.
*   **Detailed Recipes:** Provides ingredients, instructions, cooking time, protein estimates, and YouTube video suggestions.

## Project Structure

*   `src/app/`: Main application routes (App Router).
    *   `page.tsx`: Landing page.
    *   `app/page.tsx`: Recipe generator page (protected).
    *   `layout.tsx`: Root layout including header, footer, and context providers.
*   `src/components/`: Reusable UI components.
    *   `layout/`: Header and Footer components.
    *   `recipe/`: Components specific to recipe display and forms.
    *   `auth/`: Login modal component.
    *   `ui/`: ShadCN UI components.
*   `src/ai/`: Genkit AI flows and configuration.
    *   `flows/generate-recipes.ts`: The core AI logic for recipe generation.
*   `src/lib/`: Utility functions and configurations.
    *   `firebase/`: Firebase configuration and authentication logic.
    *   `utils.ts`: General utility functions.
*   `src/context/`: React context providers (e.g., AuthContext).
*   `src/services/`: External service integrations (e.g., YouTube API).
*   `public/`: Static assets.
*   `styles/`: Global styles and Tailwind configuration.
