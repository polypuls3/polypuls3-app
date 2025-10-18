"use client"

import { useDataSource } from '@/contexts/data-source-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Database, Zap, Loader2 } from 'lucide-react'

export function DataSourceToggle() {
  const { dataSource, setDataSource, isLoading } = useDataSource()

  const isContract = dataSource === 'contract'
  const isSubgraph = dataSource === 'subgraph'

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
      <Button
        size="sm"
        variant={isContract ? "default" : "ghost"}
        className={`h-7 gap-1.5 ${isContract ? "bg-primary text-primary-foreground" : "hover:bg-transparent"}`}
        onClick={() => setDataSource('contract')}
        disabled={isLoading}
      >
        {isLoading && isContract ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Database className="h-3 w-3" />
        )}
        <span className="hidden sm:inline">Contract</span>
        {isContract && (
          <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs bg-primary-foreground/20 hidden sm:inline-flex">
            Real-time
          </Badge>
        )}
      </Button>
      <Button
        size="sm"
        variant={isSubgraph ? "default" : "ghost"}
        className={`h-7 gap-1.5 ${isSubgraph ? "bg-primary text-primary-foreground" : "hover:bg-transparent"}`}
        onClick={() => setDataSource('subgraph')}
        disabled={isLoading}
      >
        {isLoading && isSubgraph ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Zap className="h-3 w-3" />
        )}
        <span className="hidden sm:inline">Subgraph</span>
        {isSubgraph && (
          <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs bg-primary-foreground/20 hidden sm:inline-flex">
            Fast
          </Badge>
        )}
      </Button>
    </div>
  )
}
