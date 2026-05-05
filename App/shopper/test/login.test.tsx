import { it, vi, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LoginView from './src/app/buyer/View'
import LoginPage from './src/app/login/page'

import { routerSpy } from './mockRouter'