import { GoogleGenAI, Type, Modality } from '@google/genai';
import type { Candy, CandyRequest } from '../types';

// The execution environment provides the API key via process.env.API_KEY.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  // This error indicates a problem with the execution environment's configuration,
  // as the API_KEY is expected to be injected automatically.
  throw new Error("API_KEY is not available. This is a configuration issue with the execution environment.");
}

const ai = new GoogleGenAI({ apiKey });

const candyConceptSchema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: 'A creative and catchy name for the candy, under 5 words.',
    },
    imagePrompt: {
      type: Type.STRING,
      description: 'A detailed, visually rich prompt for an AI image generator. Describe a SINGLE piece of candy\'s appearance, colors, and texture. DO NOT describe the background, setting, or lighting. e.g., "A glowing, translucent gummy candy shaped like a tiny galaxy swirl..."',
    },
  },
  required: ['name', 'imagePrompt'],
};

// Helper function to extract the core message from a potential JSON error string
const parseApiError = (error: unknown): string => {
    if (error instanceof Error) {
        try {
            // The error from the SDK might contain a JSON string with more details
            const jsonError = JSON.parse(error.message);
            if (jsonError.error && jsonError.error.message) {
                return jsonError.error.message;
            }
        } catch (e) {
            // Not a JSON error, just use the original message
            return error.message;
        }
        return error.message; // Fallback to the original message
    }
    return 'An unexpected error occurred.';
}

/**
 * A utility function to wrap an API call with a retry mechanism.
 * Implements exponential backoff for retryable errors.
 * @param apiCall The async function to call.
 * @param maxRetries The maximum number of times to retry.
 * @returns The result of the successful API call.
 */
const makeApiCallWithRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (e) {
      lastError = e as Error;
      const errorMessage = parseApiError(e).toLowerCase();
      // Check for specific retryable error codes/messages
      const isRetryable = errorMessage.includes('503') || errorMessage.includes('overloaded');
      
      if (isRetryable && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // 1-2s, 2-3s, etc. with jitter
        console.warn(`API call failed with retryable error. Retrying in ${(delay / 1000).toFixed(1)}s... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Not a retryable error or max retries reached, so we throw.
        throw lastError;
      }
    }
  }
  // This should theoretically not be reached, but is a fallback.
  throw lastError ?? new Error("API call failed after max retries.");
};

export const generateCandyConcept = async (request: CandyRequest): Promise<Candy> => {
  const { keywords, candyType } = request;

  // Step 1: Generate the candy name and image prompt
  const textPrompt = `You are a world-renowned candy inventor. Create a new candy concept based on the following criteria.
  - Keywords: ${keywords}
  - Candy Type: ${candyType}
  
  Invent a candy that fits these descriptions perfectly. Return a creative name and a detailed visual prompt for an image generator. The visual prompt should ONLY describe the visual characteristics of a single piece of candy (e.g., its shape, color, texture, material, sheen) and MUST NOT include any information about the background, setting, or environment.`;

  let textGenerationResponse;
  try {
    textGenerationResponse = await makeApiCallWithRetry(() => 
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: textPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: candyConceptSchema,
        },
      })
    );
  } catch(e) {
    console.error("Text generation API call failed after retries:", e);
    const specificErrorMessage = parseApiError(e);
    const finalMessage = specificErrorMessage.toLowerCase().includes('overloaded') 
        ? 'The AI model is currently busy. Please try again in a moment.'
        : `Text Generation Error: ${specificErrorMessage}`;
    throw new Error(finalMessage);
  }

  // Detailed safety check for the text generation part
  if (textGenerationResponse.promptFeedback?.blockReason) {
    throw new Error(`Your request was blocked for safety reasons (${textGenerationResponse.promptFeedback.blockReason}). Please try a different description.`);
  }

  let concept: { name: string; imagePrompt: string; };
  try {
    const textResponseJson = textGenerationResponse.text?.trim();
    if (!textResponseJson) {
      throw new Error("The AI returned an empty response for the candy concept. This might be due to a safety filter or an issue with the prompt.");
    }
    concept = JSON.parse(textResponseJson);
  } catch (e) {
    console.error("Failed to parse JSON response from text generation:", textGenerationResponse.text);
    throw new Error("The AI failed to generate a valid candy concept structure. Please try again.");
  }
  
  if (!concept.name || !concept.imagePrompt) {
      throw new Error('The AI generated an incomplete candy concept. Please try again.');
  }

  // Step 2: Generate the image based on the generated prompt
  const finalImagePrompt = `A single piece of candy. ${concept.imagePrompt}. Centered, isolated on a pure solid white background. Professional product photography, studio lighting, no shadows.`;

  let imageResponse;
  try {
    imageResponse = await makeApiCallWithRetry(() => 
        ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: finalImagePrompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        })
    );
  } catch (e) {
    console.error("Image generation API call failed after retries:", e);
    const specificErrorMessage = parseApiError(e);
    const finalMessage = specificErrorMessage.toLowerCase().includes('overloaded')
        ? 'The AI image generator is currently busy. Please try again in a moment.'
        : `Image Generation Error: ${specificErrorMessage}`;
    throw new Error(finalMessage);
  }

  if (!imageResponse.candidates || imageResponse.candidates.length === 0) {
    const blockReason = imageResponse.promptFeedback?.blockReason;
    if (blockReason) {
        throw new Error(`Image generation was blocked for safety reasons (${blockReason}). Please try a different candy idea.`);
    }
    throw new Error('Failed to generate a candy image. The AI returned no candidates.');
  }
  
  const imagePart = (imageResponse.candidates[0].content?.parts ?? []).find(part => part.inlineData);

  if (!imagePart || !imagePart.inlineData) {
      throw new Error('Failed to generate a candy image. The response did not contain image data, which could be due to a safety filter.');
  }

  const base64ImageBytes = imagePart.inlineData.data;
  const imageUrl = `data:image/png;base64,${base64ImageBytes}`;

  return {
    name: concept.name,
    imageUrl: imageUrl,
  };
};
