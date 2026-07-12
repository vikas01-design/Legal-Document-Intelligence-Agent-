import { useState } from "react";
import api from "../services/api";
import Message from "./Message";
import type { ChatMessage } from "../types/chat";

export default function ChatBox() {

  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function askQuestion() {

    if (!question.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {

      const response = await api.post("/chat", {
        question,
      });

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: response.data.answer,
        source:
          response.data.toolResults?.[0]?.payload?.result?.source,
      };

      setMessages((prev) => [...prev, aiMessage]);

    } catch {

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Something went wrong.",
        },
      ]);

    }

    setQuestion("");

    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-lg mt-8 p-6">

      <h2 className="text-2xl font-bold mb-6">
        AI Legal Assistant
      </h2>

      <div className="h-96 overflow-y-auto mb-6">

        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
          />
        ))}

        {loading && (
          <p className="text-gray-500">
            🤖 Thinking...
          </p>
        )}

      </div>

      <div className="flex gap-3">

        <input
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          placeholder="Ask about your contract..."
          className="flex-1 border rounded-lg px-4 py-3"
        />

        <button
          onClick={askQuestion}
          className="bg-blue-600 text-white px-6 rounded-lg"
        >
          Send
        </button>

      </div>

    </div>
  );
}