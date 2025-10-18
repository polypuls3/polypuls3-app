"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type DataSource = 'contract' | 'subgraph'

interface DataSourceContextType {
  dataSource: DataSource
  setDataSource: (source: DataSource) => void
  isLoading: boolean
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined)

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [dataSource, setDataSourceState] = useState<DataSource>('contract')
  const [isLoading, setIsLoading] = useState(false)

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dataSource') as DataSource | null
    if (stored === 'contract' || stored === 'subgraph') {
      setDataSourceState(stored)
    }
  }, [])

  const setDataSource = (source: DataSource) => {
    setIsLoading(true)
    setDataSourceState(source)
    localStorage.setItem('dataSource', source)

    // Brief loading state to indicate data is being refetched
    setTimeout(() => setIsLoading(false), 500)
  }

  return (
    <DataSourceContext.Provider value={{ dataSource, setDataSource, isLoading }}>
      {children}
    </DataSourceContext.Provider>
  )
}

export function useDataSource() {
  const context = useContext(DataSourceContext)
  if (context === undefined) {
    throw new Error('useDataSource must be used within a DataSourceProvider')
  }
  return context
}
