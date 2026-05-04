import { createContext } from "react"

interface ErrorContextProps {
  error: string | undefined
  setError: (error: string | undefined) => void
}

export const ErrorContext = createContext<ErrorContextProps | undefined>(undefined);