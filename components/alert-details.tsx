import type { Alert } from "@/types/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock, Database, Globe } from "lucide-react"

interface AlertDetailsProps {
  alert: Alert
}

export default function AlertDetails({ alert }: AlertDetailsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-warning text-warning-foreground"
      case "low":
        return "bg-success text-success-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">{alert.title}</h2>
          <p className="text-sm text-muted-foreground">ID: {alert.id}</p>
        </div>
        <Badge className={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()} SEVERITY</Badge>
      </div>

      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>{new Date(alert.timestamp).toLocaleString()}</span>
      </div>

      <p className="text-sm">{alert.description}</p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Information Provenance</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {alert.sources.map((source, index) => (
              <li key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    {source.type === "internal" ? (
                      <Database className="h-4 w-4 text-primary" />
                    ) : (
                      <Globe className="h-4 w-4 text-secondary" />
                    )}
                    <span className="font-medium">{source.name}</span>
                  </div>
                  <Badge variant="outline">{source.type.toUpperCase()}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Reliability: {(source.reliability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(source.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

