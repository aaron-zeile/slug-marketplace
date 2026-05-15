import { useContext } from 'react'
import { TabContext } from './Context'

export function useDashboard() {
  const context = useContext(TabContext)
  if (!context) {
    throw new Error('useDashboard must be used within TabProvider')
  }
  return context
}
