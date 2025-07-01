export const maxDuration = 60
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// initialize OpenAI client with DeepSeek API key and base URL
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

export async function POST(req) {
  try {
    const { userId } = getAuth(req)

    // extract chatId and prompt from the request body
    const { chatId, prompt } = await req.json()

    if (!userId) {
      return NextResponse.json({success: true, message: "User not Authenticated"})
    }

    // find the chat document in the database based on userId and chatId
    const data = await Chat.findOne({ userId, _id: chatId })

    // create a user message object
    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now()
    }

    data.messages.push(userPrompt)

    // call the DeepSeek API to get a chat completion
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
      store: true
    });

    const message = completion.choices[0].message;
    message.timestamp = Date.now()

    data.messages.push(message);
    data.save()

    return NextResponse.json({success: true, data: message})

  } catch (error) {
      return NextResponse.json({success: true, error: error.message})
  }
}