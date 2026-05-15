import { createContext } from "react";

interface TabContextProps {
  tabValue: number
  setTab: (value: number) => void
}

export const TabContext = createContext<TabContextProps | undefined>(undefined);
