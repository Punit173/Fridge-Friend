import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("AIzaSyC9oFpzScVaBy24p3Gki4lwu0vHmTqKCdc");

export const generateResponse = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating response:', error);
        throw error;
    }
}; 