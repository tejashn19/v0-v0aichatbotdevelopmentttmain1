"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, User, Brain, Search, Globe, BookOpen, Layers, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { UserMenu } from "@/components/user-menu"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isStreaming?: boolean
  metadata?: {
    modelUsed?: string
    confidence?: number
    intent?: string
    responseTime?: number
    searchEnhanced?: boolean
  }
}

export default function ChatbotPage() {
  const { user } = useAuth()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm an advanced AI assistant with comprehensive search and analysis capabilities. I can provide detailed, well-researched responses by accessing vast knowledge bases and synthesizing information from multiple sources. Ask me anything and I'll give you thorough, in-depth answers!",
      role: "assistant",
      timestamp: new Date(),
      metadata: {
        modelUsed: "grok",
        confidence: 1.0,
        intent: "greeting",
        searchEnhanced: false,
      },
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (user && messages.length === 1) {
      const firstName = user.name.split(" ")[0]
      setMessages([
        {
          id: "1",
          content: `Hello ${firstName}! I'm an advanced AI assistant with comprehensive search and analysis capabilities. I can provide detailed, well-researched responses by accessing vast knowledge bases and synthesizing information from multiple sources. Ask me anything and I'll give you thorough, in-depth answers!`,
          role: "assistant",
          timestamp: new Date(),
          metadata: {
            modelUsed: "grok",
            confidence: 1.0,
            intent: "greeting",
            searchEnhanced: false,
          },
        },
      ])
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input.trim()
    setInput("")
    setIsLoading(true)

    const needsSearch =
      currentInput.includes("?") ||
      currentInput.toLowerCase().includes("search") ||
      currentInput.toLowerCase().includes("find") ||
      currentInput.toLowerCase().includes("research") ||
      currentInput.toLowerCase().includes("explain") ||
      currentInput.toLowerCase().includes("what is") ||
      currentInput.toLowerCase().includes("how to")

    if (needsSearch) {
      setIsSearching(true)
    }

    // Create streaming assistant message
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isStreaming: true,
      metadata: {
        searchEnhanced: needsSearch,
      },
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages.slice(-10), // Send last 10 messages for context
          userContext: user
            ? {
                name: user.name,
                email: user.email,
              }
            : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk

          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: fullResponse } : msg)),
          )
        }
      }

      // Mark streaming as complete
      setMessages((prev) => prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, isStreaming: false } : msg)))
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: "I apologize, but I encountered an error processing your request. Please try again.",
                isStreaming: false,
              }
            : msg,
        ),
      )
    } finally {
      setIsLoading(false)
      setIsSearching(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="min-h-screen inception-bg">
      <div className="container mx-auto max-w-4xl h-screen flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 gradient-multi rounded-xl flex items-center justify-center inception-layer">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground text-balance">CHATXPERT</h1>
              <p className="text-sm text-muted-foreground">SMART AI CHATBOT USING NLP FOR INTERACTIVE DIALOGUES</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Badge className="gap-1 inception-badge text-white">
                <Eye className="w-3 h-3" />
                DREAM
              </Badge>
              <Badge className="gap-1 inception-badge primary text-white">
                <Layers className="w-3 h-3" />
                LAYER
              </Badge>
              <Badge className="gap-1 inception-badge accent text-white">
                <Brain className="w-3 h-3" />
                MIND
              </Badge>
              <Badge variant="outline" className="gap-1 border-accent/50 text-accent">
                <Search className="w-3 h-3" />
                EXTRACT
              </Badge>
            </div>
            <UserMenu />
          </div>
        </div>

        {isSearching && (
          <div className="mb-4 p-3 inception-layer rounded-lg">
            <div className="flex items-center gap-2 text-accent">
              <Globe className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Diving deeper into the layers of knowledge...</span>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col inception-layer">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-4 max-w-[85%]", message.role === "user" ? "ml-auto flex-row-reverse" : "")}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    {message.role === "user" && user ? (
                      <AvatarImage src={user.picture || "/placeholder.svg"} alt={user.name} />
                    ) : null}
                    <AvatarFallback
                      className={cn(
                        "text-xs font-medium",
                        message.role === "user"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary text-primary-foreground",
                      )}
                    >
                      {message.role === "user" ? (
                        user ? (
                          user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        ) : (
                          <User className="w-4 h-4" />
                        )
                      ) : (
                        <Layers className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-full",
                      message.role === "user" ? "inception-user-message ml-2" : "inception-message mr-2",
                    )}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {message.content}
                      {message.isStreaming && <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs opacity-70 text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {message.role === "assistant" && message.metadata && (
                        <div className="flex gap-1">
                          {message.metadata.searchEnhanced && (
                            <Badge variant="outline" className="text-xs px-1 py-0 h-5 border-accent/50 text-accent">
                              <BookOpen className="w-2 h-2 mr-1" />
                              EXTRACTED
                            </Badge>
                          )}
                          {message.metadata.modelUsed && (
                            <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                              {message.metadata.modelUsed.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  user
                    ? `Hi ${user.name.split(" ")[0]}, enter the dream... I'll navigate the layers of reality...`
                    : "Enter the dream... I'll navigate the layers of reality..."
                }
                className="flex-1 inception-input text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
                autoFocus
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="gradient-primary hover:gradient-secondary text-white px-6 inception-button"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by multi-layered neural architecture • Reality is just another layer
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
