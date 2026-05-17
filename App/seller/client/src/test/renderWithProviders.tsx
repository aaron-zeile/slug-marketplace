import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';

import AppProviders from '../providers/AppProviders';
import { ErrorProvider } from '../error/Provider';
import { TabProvider } from '../dashboard/Provider';

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, {
  ...options,
    wrapper: ({ children }) => (
      <AppProviders>
        <ErrorProvider>
          <TabProvider>{children}</TabProvider>
        </ErrorProvider>
      </AppProviders>
    ),
  });
}
