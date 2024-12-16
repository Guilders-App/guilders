"use client";

import { Markdown } from "@/apps/web/components/common/markdown-component";
import { Badge } from "@/apps/web/components/ui/badge";
import { Button } from "@/apps/web/components/ui/button";
import { Card } from "@/apps/web/components/ui/card";
import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/apps/web/components/ui/chat-bubble";
import { ChatInput } from "@/apps/web/components/ui/chat-input";
import { ChatMessageList } from "@/apps/web/components/ui/chat-message-list";
import { useUser } from "@/apps/web/lib/hooks/useUser";
import { isPro } from "@/apps/web/lib/utils";
import { useChat } from "ai/react";
import {
  Check,
  CopyIcon,
  CornerDownLeft,
  Mic,
  Paperclip,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const ChatAiIcons = [
  {
    icon: CopyIcon,
    label: "Copy",
  },
  {
    icon: RefreshCcw,
    label: "Refresh",
  },
];

const ExampleQuestions = [
  "What's my current spending this month?",
  "How much did I save last month?",
  "What's my biggest expense category?",
  "How can I improve my savings?",
  "Show me my investment breakdown",
  "What's my net worth?",
  "How can I adjust my portfolio?",
];

export default function AdvisorPage() {
  const router = useRouter();
  const { data: user, isLoading } = useUser();
  const isSubscribed = isPro(user);

  const [isGenerating, setIsGenerating] = useState(false);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: chatIsLoading,
    reload,
    append,
  } = useChat({
    onResponse(response) {
      if (response) setIsGenerating(false);
    },
    onError(error) {
      if (error) setIsGenerating(false);
    },
  });

  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    handleSubmit(e);
  };

  const handleExampleClick = (question: string) => {
    if (isGenerating || chatIsLoading) return;

    setIsGenerating(true);
    append({
      role: "user",
      content: question,
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating || chatIsLoading || !input) return;
      setIsGenerating(true);
      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleActionClick = async (action: string, messageIndex: number) => {
    if (action === "Refresh") {
      setIsGenerating(true);
      try {
        await reload();
      } catch (error) {
        console.error("Error reloading:", error);
      } finally {
        setIsGenerating(false);
      }
    } else if (action === "Copy") {
      const message = messages[messageIndex];
      if (message && message.role === "assistant") {
        navigator.clipboard.writeText(message.content);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full max-w-4xl flex-col justify-between mx-auto">
      {!isSubscribed && (
        <div className="absolute inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
          <Card className="max-w-md p-6 space-y-4 shadow-lg border-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">
                  Unlock Your AI Advisor
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Get personalized financial insights and advice with your Pro
                subscription.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Analyze your spending patterns</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Get investment recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Track your financial goals</span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => router.push("/settings/subscription")}
            >
              Upgrade to Pro
            </Button>
          </Card>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0 px-4">
        <ChatMessageList ref={messagesRef}>
          {/* Initial Message */}
          {messages.length === 0 && (
            <div className="w-full bg-background shadow-sm border rounded-lg p-8 flex flex-col gap-2">
              <h1 className="text-xl font-semibold">
                Welcome to your personal advisor.
              </h1>
              <p className="text-muted-foreground text-sm">
                Ask me anything about your finances. If you have any questions
                about your finances, I can help you answer them.
              </p>
              <p className="text-muted-foreground text-xs">
                This is not financial advice. AI can make mistakes. If you use
                the advisor, please do your own research and consult a
                professional if needed. When a message is sent, the data is
                processed by an AI model. Your data is not stored or trained on
                by the AI.
              </p>
            </div>
          )}

          {/* Messages */}
          {messages &&
            messages.map((message, index) => (
              <ChatBubble
                key={index}
                variant={message.role == "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  src={message.role == "user" ? "/assets/user.png" : ""}
                  fallback={message.role == "user" ? "👨🏽" : "🤖"}
                />
                <ChatBubbleMessage>
                  {message.role === "assistant" ? (
                    <Markdown>{message.content}</Markdown>
                  ) : (
                    message.content
                  )}

                  {message.role === "assistant" &&
                    messages.length - 1 === index && (
                      <div className="flex items-center mt-1.5 gap-1">
                        {!isGenerating && (
                          <>
                            {ChatAiIcons.map((icon, iconIndex) => {
                              const Icon = icon.icon;
                              return (
                                <ChatBubbleAction
                                  className="size-5"
                                  key={iconIndex}
                                  icon={<Icon className="size-3" />}
                                  onClick={() =>
                                    handleActionClick(icon.label, index)
                                  }
                                />
                              );
                            })}
                          </>
                        )}
                      </div>
                    )}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

          {/* Loading */}
          {isGenerating && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar src="" fallback="🤖" />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>
      <div className="w-full px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {ExampleQuestions.map((question, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer bg-background hover:bg-secondary/80 px-3 py-2"
                onClick={() => handleExampleClick(question)}
              >
                {question}
              </Badge>
            ))}
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="relative rounded-lg border bg-background"
        >
          <ChatInput
            value={input}
            onKeyDown={onKeyDown}
            onChange={handleInputChange}
            placeholder="Ask me anything about your finances..."
            className="min-h-12 resize-none rounded-lg bg-background p-3 focus-visible:ring-0 focus-visible:ring-offset-0 border-0"
          />
          <div className="flex items-center p-3 pt-0">
            <Button variant="ghost" size="icon">
              <Paperclip className="size-4" />
              <span className="sr-only">Attach file</span>
            </Button>

            <Button variant="ghost" size="icon">
              <Mic className="size-4" />
              <span className="sr-only">Use Microphone</span>
            </Button>

            <Button
              disabled={!input || chatIsLoading}
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
            >
              Send Message
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
