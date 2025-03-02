"use client"

import { useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Database,
  FileText,
  Info,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Sample alert data
const alerts = [
  {
    id: "ALT-2023-06-15-001",
    title: "Unusual Pattern Detection",
    timestamp: "2023-06-15T14:32:00Z",
    severity: "high",
    source: "Pattern Analysis System",
    trustScore: 87,
    validationLayers: [
      { name: "AI Linter", status: "passed", confidence: 92 },
      { name: "Semantic Entropy", status: "passed", confidence: 85 },
      { name: "Multi-Agent Verification", status: "passed", confidence: 89 },
      { name: "RAG Knowledge Base", status: "passed", confidence: 82 },
    ],
    explanation: [
      "Multiple correlated factors triggered this alert",
      "Pattern matches historical cases with 87% similarity",
      "Three independent validation systems confirmed the pattern",
      "Context analysis indicates potential concern requiring review",
    ],
    recommendations: [
      "Review complete pattern details",
      "Cross-reference with recent similar cases",
      "Escalate to supervisor if pattern persists",
    ],
  },
  {
    id: "ALT-2023-06-14-003",
    title: "Data Anomaly Detection",
    timestamp: "2023-06-14T09:17:00Z",
    severity: "medium",
    source: "Anomaly Detection System",
    trustScore: 76,
    validationLayers: [
      { name: "AI Linter", status: "passed", confidence: 81 },
      { name: "Semantic Entropy", status: "passed", confidence: 75 },
      { name: "Multi-Agent Verification", status: "warning", confidence: 68 },
      { name: "RAG Knowledge Base", status: "passed", confidence: 80 },
    ],
    explanation: [
      "Unusual data pattern detected in standard processing",
      "Pattern partially matches known scenarios",
      "Some validation checks indicate potential false positive",
      "Historical context suggests further review recommended",
    ],
    recommendations: [
      "Review data pattern details",
      "Check for system calibration issues",
      "Document findings for pattern library",
    ],
  },
  {
    id: "ALT-2023-06-13-007",
    title: "System Integrity Alert",
    timestamp: "2023-06-13T16:45:00Z",
    severity: "low",
    source: "System Monitoring",
    trustScore: 92,
    validationLayers: [
      { name: "AI Linter", status: "passed", confidence: 95 },
      { name: "Semantic Entropy", status: "passed", confidence: 90 },
      { name: "Multi-Agent Verification", status: "passed", confidence: 94 },
      { name: "RAG Knowledge Base", status: "passed", confidence: 89 },
    ],
    explanation: [
      "Routine integrity check flagged minor inconsistency",
      "Pattern consistent with scheduled maintenance activities",
      "All validation systems confirm low risk assessment",
      "No similar patterns in historical incident database",
    ],
    recommendations: [
      "Log in routine maintenance report",
      "No immediate action required",
      "Include in monthly system review",
    ],
  },
]

export default function TrustGuardDashboard() {
  const [selectedAlert, setSelectedAlert] = useState(alerts[0])
  const [activeTab, setActiveTab] = useState("details")

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-warning text-warning-foreground"
      case "low":
        return "bg-success text-success-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-warning" />
      case "failed":
        return <ShieldAlert className="h-4 w-4 text-destructive" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="container mx-auto py-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">TrustGuard Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            Settings
          </Button>
          <Button size="sm">Generate Report</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Alert List Panel */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Active Alerts</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Filter <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All Alerts</DropdownMenuItem>
                  <DropdownMenuItem>High Severity</DropdownMenuItem>
                  <DropdownMenuItem>Medium Severity</DropdownMenuItem>
                  <DropdownMenuItem>Low Severity</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardTitle>
            <CardDescription>{alerts.length} alerts requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedAlert.id === alert.id ? "bg-muted border-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{alert.title}</h3>
                    <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">{formatDate(alert.timestamp)}</div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Trust Score: {alert.trustScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert Details Panel */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{selectedAlert.title}</CardTitle>
                <CardDescription>
                  ID: {selectedAlert.id} • Source: {selectedAlert.source}
                </CardDescription>
              </div>
              <Badge className={getSeverityColor(selectedAlert.severity)}>
                {selectedAlert.severity.toUpperCase()} SEVERITY
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Alert Details</TabsTrigger>
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Trust Score</h3>
                  <span className="text-2xl font-bold">{selectedAlert.trustScore}%</span>
                </div>
                <Progress value={selectedAlert.trustScore} className="h-2" />

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Explanation</h3>
                  <div className="space-y-2">
                    {selectedAlert.explanation.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="mt-1 bg-primary/10 text-primary rounded-full p-1">
                          <Info className="h-4 w-4" />
                        </div>
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Alert Timeline</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>Generated: {formatDate(selectedAlert.timestamp)}</p>
                    <p>Last Validated: {formatDate(new Date().toISOString())}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="validation" className="space-y-6 mt-4">
                <h3 className="text-lg font-medium">Validation Layers</h3>
                <div className="space-y-4">
                  {selectedAlert.validationLayers.map((layer, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          {layer.name === "AI Linter" && <FileText className="h-5 w-5 text-blue-500" />}
                          {layer.name === "Semantic Entropy" && <Database className="h-5 w-5 text-purple-500" />}
                          {layer.name === "Multi-Agent Verification" && <Shield className="h-5 w-5 text-green-500" />}
                          {layer.name === "RAG Knowledge Base" && <Database className="h-5 w-5 text-amber-500" />}
                          <h4 className="font-medium">{layer.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(layer.status)}
                          <span className="text-sm capitalize">{layer.status}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Confidence</span>
                          <span>{layer.confidence}%</span>
                        </div>
                        <Progress value={layer.confidence} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Validation Summary</h4>
                  <p className="text-sm">
                    This alert has been validated through {selectedAlert.validationLayers.length} independent
                    verification systems with an average confidence of{" "}
                    {Math.round(
                      selectedAlert.validationLayers.reduce((sum, layer) => sum + layer.confidence, 0) /
                        selectedAlert.validationLayers.length,
                    )}
                    %.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-6 mt-4">
                <h3 className="text-lg font-medium">Recommended Actions</h3>
                <div className="space-y-3">
                  {selectedAlert.recommendations.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="bg-primary/10 text-primary rounded-full p-1.5">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p>{action}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between">
                  <Button variant="outline">Dismiss Alert</Button>
                  <div className="space-x-2">
                    <Button variant="outline">Escalate</Button>
                    <Button>Take Action</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

