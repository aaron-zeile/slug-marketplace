import { createContext } from "react";

interface DashboardContextProps {
  tabValue: number
  setTab: (value: number) => void
}

export const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);