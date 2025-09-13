"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Target, Clock } from "lucide-react"

interface AnalyticsData {
  totalConversations: number
  averageResponseTime: number
  modelDistribution: { grok: number; groq: number }
  topIntents: Array<{ intent: string; count: number }>
  averageConfidence: number
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalConversations: 0,
    averageResponseTime: 0,
    modelDistribution: { grok: 0, groq: 0 },
    topIntents: [],
    averageConfidence: 0,
  })

  useEffect(() => {
    const simulatedData: AnalyticsData = {
      totalConversations: 1247,
      averageResponseTime: 342,
      modelDistribution: { grok: 65, groq: 35 },
      topIntents: [
        { intent: "question", count: 45 },
        { intent: "technical", count: 32 },
        { intent: "request", count: 23 },
      ],
      averageConfidence: 0.87,
    }
    setAnalytics(simulatedData)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalConversations.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Neural network processed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.averageResponseTime}ms</div>
          <p className="text-xs text-muted-foreground">RNN inference speed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Model Distribution</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Badge variant="secondary">Grok {analytics.modelDistribution.grok}%</Badge>
            <Badge variant="outline">Groq {analytics.modelDistribution.groq}%</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">AI model usage</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Intent Accuracy</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(analytics.averageConfidence * 100).toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">ANN classification</p>
        </CardContent>
      </Card>
    </div>
  )
}
