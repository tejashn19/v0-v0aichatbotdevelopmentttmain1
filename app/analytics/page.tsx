import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Model Analytics</h1>
        <p className="text-muted-foreground mt-2">Real-time performance metrics for the neural network architecture</p>
      </div>

      <AnalyticsDashboard />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Architecture Overview</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>CNN Feature Extraction:</span>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span>RNN Context Processing:</span>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span>ANN Intent Classification:</span>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Attention Mechanisms:</span>
              <span className="text-green-600">Active</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Performance Metrics</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Model Inference Latency:</span>
              <span>~200ms</span>
            </div>
            <div className="flex justify-between">
              <span>Context Window Size:</span>
              <span>4096 tokens</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Efficiency:</span>
              <span>Optimized</span>
            </div>
            <div className="flex justify-between">
              <span>Concurrent Sessions:</span>
              <span>1000+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
