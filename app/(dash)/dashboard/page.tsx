"use client"

import { useState } from "react"
import { Shield, Bell, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import AlertDetails from "@/components/alert-details"
import { Alert } from "@/types/alert"
  

const sampleAlerts: Alert[] = [
  {
    id: "ALT-2023-07-01-001",
    title: "Potential Cyber Intrusion Detected",
    severity: "high",
    timestamp: "2023-07-01T10:30:00Z",
    description: "Multiple failed login attempts detected from unusual IP ranges.",
    sources: [
      {
        name: "Network Logs",
        type: "internal",
        reliability: 0.95,
        timestamp: "2023-07-01T10:28:00Z",
      },
      {
        name: "Threat Intelligence Feed",
        type: "external",
        reliability: 0.85,
        timestamp: "2023-07-01T10:29:30Z",
      },
    ],
  },
  {
    id: "ALT-2023-07-02-002",
    title: "Suspicious Border Crossing Pattern",
    severity: "medium",
    timestamp: "2023-07-02T15:45:00Z",
    description: "Unusual increase in border crossings at non-standard hours.",
    sources: [
      {
        name: "Border Patrol Reports",
        type: "internal",
        reliability: 0.9,
        timestamp: "2023-07-02T15:40:00Z",
      },
      {
        name: "Satellite Imagery",
        type: "internal",
        reliability: 0.8,
        timestamp: "2023-07-02T15:43:00Z",
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
            <CardTitle>Active Alerts</CardTitle>
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

