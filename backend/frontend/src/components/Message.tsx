import type { ChatMessage } from "../types/chat";

interface Props {
  message: ChatMessage;
}

export default function Message({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex mb-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-white"
        }`}
      >
        <p>{message.text}</p>

        {!isUser && message.source && (
          <div className="mt-3 border-t pt-2 text-xs text-gray-500">
            📄 {message.source}
          </div>
        )}
      </div>
    </div>
  );
}