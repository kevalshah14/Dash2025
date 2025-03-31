export interface Source {
    name: string
    type: "internal" | "external"
    reliability: number
    timestamp: string
  }
  
  export interface Alert {
    id: string
    title: string
    severity: "low" | "medium" | "high"
    timestamp: string
    description: string
    sources: Source[]
  }
  
  