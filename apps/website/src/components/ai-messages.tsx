"use client";

import { AnimatedList } from "@guilders/ui/animated-list";
import { cn } from "@guilders/ui/cn";

interface Message {
  content: string;
  sender: "user" | "advisor";
  time: string;
}

let messages: Message[] = [
  {
    content: "Hi! I need help planning my retirement savings.",
    sender: "user",
    time: "2m ago",
  },
  {
    content:
      "I'd be happy to help you plan for retirement. Could you tell me your current age and when you'd like to retire?",
    sender: "advisor",
    time: "2m ago",
  },
  {
    content:
      "I'm 32 and hoping to retire by 60. I currently save about 15% of my income.",
    sender: "user",
    time: "1m ago",
  },
  {
    content:
      "That's a good start! Based on your age, we should aim for a diversified portfolio. I recommend increasing your savings to 20% and considering tax-advantaged accounts like a 401(k) or IRA.",
    sender: "advisor",
    time: "1m ago",
  },
  {
    content:
      "What kind of returns should I expect from a diversified portfolio?",
    sender: "user",
    time: "30s ago",
  },
  {
    content:
      "Historically, a well-balanced portfolio has averaged 7-8% annual returns. However, it's important to remember that returns can vary significantly year to year.",
    sender: "advisor",
    time: "Just now",
  },
];

// Duplicate messages for demo purposes
messages = Array.from({ length: 3 }, () => [...messages]).flat();

const Message = ({ content, sender, time }: Message) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] overflow-hidden rounded-2xl p-3",
        "transition-all duration-200 ease-in-out",
        sender === "advisor" ? "ml-0" : "ml-auto",
      )}
    >
      <div
        className={cn(
          "flex flex-row items-start gap-3",
          sender === "advisor" ? "flex-row" : "flex-row-reverse",
        )}
      >
        <div
          className={cn(
            "flex flex-col overflow-hidden",
            "max-w-[300px] rounded-2xl p-3",
            sender === "advisor"
              ? "bg-white dark:bg-gray-800 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05)]"
              : "bg-blue-500 text-white",
          )}
        >
          <p className="text-xs font-normal">{content}</p>
          <span className="mt-1 text-xs opacity-60">{time}</span>
        </div>
      </div>
    </figure>
  );
};

export function AIMessages({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full flex-col p-6 overflow-hidden",
        className,
      )}
    >
      <AnimatedList>
        {messages.map((message, idx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Message {...message} key={idx} />
        ))}
      </AnimatedList>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
