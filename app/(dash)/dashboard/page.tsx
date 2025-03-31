"use client"

import { useState } from "react"
import { Shield, Bell, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import AlertDetails from "@/components/alert-details"
import { Alert } from "@/types/alert"

const sampleAlerts: Alert[] = [
  {
    id: "LLM-ERR-2025-03-02-001",
    title: "Historical Fact Error: Incorrect Date for Independence",
    severity: "low",
    timestamp: "2025-03-02T08:30:00Z",
    description:
      "The LLM generated an incorrect date for the signing of the Declaration of Independence, flagging potential misinformation risks.",
    sources: [
      {
        name: "User Report",
        type: "external",
        reliability: 0.8,
        timestamp: "2025-03-02T08:28:00Z",
      },
      {
        name: "Internal Validation",
        type: "internal",
        reliability: 0.95,
        timestamp: "2025-03-02T08:29:30Z",
      },
    ],
  },
  {
    id: "LLM-ERR-2025-03-02-002",
    title: "Scientific Data Misinformation: Erroneous Climate Statistic",
    severity: "high",
    timestamp: "2025-03-02T09:45:00Z",
    description:
      "The LLM incorrectly reported a statistical anomaly in climate data, which could lead to misinterpretation of trends and risks in scientific communication.",
    sources: [
      {
        name: "Peer Review",
        type: "internal",
        reliability: 0.9,
        timestamp: "2025-03-02T09:40:00Z",
      },
      {
        name: "Expert Feedback",
        type: "external",
        reliability: 0.85,
        timestamp: "2025-03-02T09:43:00Z",
      },
    ],
  },
  {
    id: "LLM-ERR-2025-03-02-003",
    title: "Geographical Misinformation: Incorrect Capital",
    severity: "low",
    timestamp: "2025-03-02T10:00:00Z",
    description:
      "The LLM mistakenly identified the capital of Australia, potentially misleading users in geographical contexts.",
    sources: [
      {
        name: "User Feedback",
        type: "external",
        reliability: 0.75,
        timestamp: "2025-03-02T09:55:00Z",
      },
      {
        name: "Internal Check",
        type: "internal",
        reliability: 0.95,
        timestamp: "2025-03-02T09:57:00Z",
      },
    ],
  },
]

export default function DHSDashboard() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">DHS LLM Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Flagged LLM Outputs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {sampleAlerts.map((alert) => (
                <li key={alert.id}>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <span className="truncate">{alert.title}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Alert Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAlert ? (
              <AlertDetails alert={selectedAlert} />
            ) : (
              <p className="text-muted-foreground">Select an alert to view details.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
