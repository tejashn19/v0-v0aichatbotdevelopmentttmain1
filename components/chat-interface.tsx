"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, ImageIcon, Search, Zap, Brain, Layers, History, X, Trash2 } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  metadata?: {
    modelUsed?: string
    confidence?: number
    intent?: string
    responseTime?: number
    hasImage?: boolean
  }
}

interface SearchHistoryItem {
  id: string
  query: string
  timestamp: Date
}

const ChatInterface: React.FC = () => {
  const [input, setInput] = React.useState("")
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSearching, setIsSearching] = React.useState(false)
  const [showExplosion, setShowExplosion] = React.useState(false)
  const [typingMessage, setTypingMessage] = React.useState("")
  const [searchHistory, setSearchHistory] = React.useState<SearchHistoryItem[]>([])
  const [showHistory, setShowHistory] = React.useState(true)

  React.useEffect(() => {
    const savedHistory = localStorage.getItem("chatSearchHistory")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setSearchHistory(parsed)
      } catch (error) {
        console.error("[v0] Failed to load search history:", error)
      }
    }
  }, [])

  React.useEffect(() => {
    localStorage.setItem("chatSearchHistory", JSON.stringify(searchHistory))
  }, [searchHistory])

  const addToSearchHistory = (query: string) => {
    const newHistoryItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: new Date(),
    }

    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.query !== query.trim())
      return [newHistoryItem, ...filtered].slice(0, 50)
    })
  }

  const deleteHistoryItem = (id: string) => {
    setSearchHistory((prev) => prev.filter((item) => item.id !== id))
  }

  const clearAllHistory = () => {
    setSearchHistory([])
  }

  const selectFromHistory = (query: string) => {
    setInput(query)
    setShowHistory(false)
  }

  const renderMarkdown = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g
    const withBold = text.replace(boldRegex, "<strong>$1</strong>")

    const cleanedText = withBold.replace(/\*/g, "")

    const codeRegex = /`(.*?)`/g
    const withCode = cleanedText.replace(codeRegex, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')

    return withCode
  }

  const renderMessageContent = (content: string, metadata?: Message["metadata"]) => {
    const imageRegex = /!\[([^\]]*)\]$$([^)]+)$$/g
    const parts = content.split(imageRegex)

    if (parts.length === 1) {
      return <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
    }

    const elements = []
    for (let i = 0; i < parts.length; i += 3) {
      if (parts[i]) {
        elements.push(
          <div
            key={i}
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(parts[i]) }}
          />,
        )
      }
      if (parts[i + 1] !== undefined && parts[i + 2]) {
        elements.push(
          <div key={i + 1} className="my-4">
            <img
              src={parts[i + 2] || "/placeholder.svg"}
              alt={parts[i + 1]}
              className="max-w-full h-auto rounded-lg border shadow-sm manga-pop-in"
              onLoad={() => console.log("[v0] Image loaded successfully")}
              onError={() => console.log("[v0] Image failed to load")}
            />
            {parts[i + 1] && <p className="text-sm text-muted-foreground mt-2 italic">{parts[i + 1]}</p>}
          </div>,
        )
      }
    }
    return <div>{elements}</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    addToSearchHistory(input)

    setShowExplosion(true)
    setTimeout(() => setShowExplosion(false), 500)

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const isImageRequest =
      /\b(image|picture|photo|draw|create|generate|show me|make|design|illustration|artwork|visual|sketch)\b/i.test(
        input,
      )
    if (isImageRequest) {
      setIsSearching(true)
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (errorData.fallback) {
          const fallbackMessage: Message = {
            id: Date.now().toString(),
            content: errorData.error,
            role: "assistant",
            timestamp: new Date(),
            metadata: {
              modelUsed: errorData.modelUsed,
              responseTime: errorData.responseTime,
            },
          }
          setMessages((prev) => [...prev, fallbackMessage])
          return
        }
        throw new Error("Failed to get response")
      }

      const contentType = response.headers.get("content-type")

      if (contentType?.includes("text/plain")) {
        const content = await response.text()
        const assistantMessage: Message = {
          id: Date.now().toString(),
          content,
          role: "assistant",
          timestamp: new Date(),
          metadata: {
            modelUsed: "image-generator",
            intent: "image",
            hasImage: true,
          },
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: "",
          role: "assistant",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("0:")) {
                try {
                  const content = JSON.parse(line.slice(2))
                  if (content.type === "text-delta") {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessage.id ? { ...msg, content: msg.content + content.textDelta } : msg,
                      ),
                    )
                  }
                } catch (e) {
                  console.error("[v0] Parse error:", e)
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  return (
    <div className="flex h-full max-w-6xl mx-auto">
      <div className="w-80 h-full inception-layer border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-foreground">Search History</h3>
            </div>
          </div>
          {searchHistory.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllHistory}
              className="w-full mt-2 text-xs bg-transparent"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {searchHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No search history yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="group inception-layer rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => selectFromHistory(item.query)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.query}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.timestamp.toLocaleDateString()}{" "}
                          {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteHistoryItem(item.id)
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex flex-col flex-1 h-full">
        <div className="inception-header p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-lg inception-layer flex items-center justify-center">
                  <Brain className="h-6 w-6 text-blue-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-wide">CHATXPERT</h1>
                <p className="text-sm text-muted-foreground">SMART AI CHATBOT USING NLP FOR INTERACTIVE DIALOGUES</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="inception-badge">
                <Layers className="h-3 w-3 mr-1" />
                LAYER
              </Badge>
              <Badge className="inception-badge">
                <Search className="h-3 w-3 mr-1" />
                SEARCH
              </Badge>
              <Badge className="inception-badge">
                <ImageIcon className="h-3 w-3 mr-1" />
                GENERATE
              </Badge>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6 inception-bg inception-geometric">
          <div className="space-y-8">
            {messages.length === 0 && (
              <div className="text-center py-12 inception-fold">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-xl inception-layer flex items-center justify-center">
                    <Bot className="h-10 w-10 text-blue-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-pulse flex items-center justify-center">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="inception-message inception-layer p-8 max-w-lg mx-auto rounded-xl">
                  <h2 className="text-xl font-semibold mb-3 text-foreground">CHATXPERT Interface Active</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Smart AI chatbot using NLP for interactive dialogues. Advanced system ready for complex queries,
                    image generation, and comprehensive research. Enter your request to begin.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-6 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-6 max-w-[85%] inception-fold ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl inception-layer flex items-center justify-center ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                        : "bg-gradient-to-br from-slate-600 to-slate-700"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-6 w-6 text-white" />
                    ) : (
                      <Bot className="h-6 w-6 text-blue-400" />
                    )}
                  </div>

                  <div
                    className={`inception-layer rounded-xl p-6 ${
                      message.role === "user" ? "inception-user-message" : "inception-message"
                    }`}
                  >
                    {renderMessageContent(message.content, message.metadata)}

                    {message.metadata && (
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {message.metadata.modelUsed && (
                          <Badge className="inception-badge">
                            <Brain className="h-3 w-3 mr-1" />
                            {message.metadata.modelUsed}
                          </Badge>
                        )}
                        {message.metadata.intent && (
                          <Badge className="inception-badge">
                            <Zap className="h-3 w-3 mr-1" />
                            {message.metadata.intent}
                          </Badge>
                        )}
                        {message.metadata.hasImage && (
                          <Badge className="inception-badge">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Generated
                          </Badge>
                        )}
                        {message.metadata.confidence && (
                          <Badge className="inception-badge">
                            {Math.round(message.metadata.confidence * 100)}% Confidence
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-6 justify-start">
                <div className="flex gap-6 max-w-[85%] inception-fold">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl inception-layer bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-blue-400 animate-pulse" />
                  </div>
                  <div className="inception-message inception-layer rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
                      <span className="inception-typing font-medium">
                        {isSearching ? "Generating visual content..." : "Processing neural patterns..."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="inception-layer border-t p-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder=""
              disabled={isLoading}
              className="flex-1 inception-input text-foreground font-medium"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="inception-button px-6">
              <Send className="h-5 w-5 mr-2" />
              Execute
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            CHATXPERT • Image Generation • Comprehensive Analysis
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
