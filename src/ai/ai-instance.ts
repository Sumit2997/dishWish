import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      fetch: async (url, init) => {
        // Add retry logic for API failures
        const maxRetries = 3;
        let lastError;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            console.log(`API fetch attempt ${attempt + 1}/${maxRetries} to ${url}`);
            
            // Use a timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            const response = await fetch(url, {
              ...init,
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            return response;
          } catch (error) {
            console.error(`API fetch attempt ${attempt + 1} failed:`, error);
            lastError = error;
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          }
        }
        
        throw lastError || new Error('Failed to connect to Gemini API after multiple attempts');
      }
    }),
  ],
  model: 'googleai/gemini-1.5-flash', // Fallback to a more stable model
});
