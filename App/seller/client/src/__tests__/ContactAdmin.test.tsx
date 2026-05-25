import {fireEvent, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import React from 'react'

import ContactAdmin from '../dashboard/ContactAdmin'
import {renderWithProviders} from '../test/renderWithProviders'

describe('ContactAdmin', () => {
  const subjectField = () => screen.getByRole('textbox', {name: /subject/i})
  const bodyField = () => screen.getByRole('textbox', {name: /message/i})
  const submitButton = () =>
    screen.getByRole('button', {name: /send message/i})

  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the contact admin form', () => {
    renderWithProviders(<ContactAdmin />)

    expect({
      titleVisible:
        screen.queryByRole('heading', {name: /contact admin/i}) !== null,
      subjectFieldVisible: subjectField() !== null,
      bodyFieldVisible: bodyField() !== null,
      submitVisible: submitButton() !== null,
    }).toEqual({
      titleVisible: true,
      subjectFieldVisible: true,
      bodyFieldVisible: true,
      submitVisible: true,
    })
  })

  it('submits the message, shows a success alert, and clears the fields', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      statusText: 'Created',
    }))
    vi.stubGlobal('fetch', fetchMock)

    renderWithProviders(<ContactAdmin />)

    fireEvent.change(subjectField(), {target: {value: 'Need help'}})
    fireEvent.change(bodyField(), {
      target: {value: 'I would like to discuss my listing.'},
    })
    fireEvent.click(submitButton())

    await screen.findByText('Your message has been sent to the admin.')

    await waitFor(() => {
      if ((subjectField() as HTMLInputElement).value !== '') {
        throw new Error('Subject field did not clear')
      }
    })

    expect({
      fetchCall: fetchMock.mock.calls[0],
      fieldValues: {
        subject: (subjectField() as HTMLInputElement).value,
        body: (bodyField() as HTMLTextAreaElement).value,
      },
    }).toEqual({
      fetchCall: [
        '/seller/api/messages',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            subject: 'Need help',
            body: 'I would like to discuss my listing.',
          }),
        },
      ],
      fieldValues: {
        subject: '',
        body: '',
      },
    })
  })

  it('shows an error alert when the API responds with a non-ok status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Forbidden',
      })),
    )

    renderWithProviders(<ContactAdmin />)

    fireEvent.change(subjectField(), {target: {value: 'Subject'}})
    fireEvent.change(bodyField(), {target: {value: 'Body content.'}})
    fireEvent.click(submitButton())

    await waitFor(() => {
      expect(screen.queryByText(/forbidden/i)).not.toBeNull()
    })

    expect({
      successVisible:
        screen.queryByText('Your message has been sent to the admin.') !== null,
      subjectKept: (subjectField() as HTMLInputElement).value,
    }).toEqual({
      successVisible: false,
      subjectKept: 'Subject',
    })
  })

  it('shows an error alert when fetch throws a network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('Network down')
      }),
    )

    renderWithProviders(<ContactAdmin />)

    fireEvent.change(subjectField(), {target: {value: 'Subject'}})
    fireEvent.change(bodyField(), {target: {value: 'Body content.'}})
    fireEvent.click(submitButton())

    await waitFor(() => {
      expect(screen.queryByText(/network down/i)).not.toBeNull()
    })
  })

  it('disables the submit button while the request is in flight', async () => {
    let resolveFetch: (value: {ok: boolean; statusText: string}) => void = () => {}
    const pending = new Promise<{ok: boolean; statusText: string}>((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal(
      'fetch',
      vi.fn(() => pending),
    )

    renderWithProviders(<ContactAdmin />)

    fireEvent.change(subjectField(), {target: {value: 'Subject'}})
    fireEvent.change(bodyField(), {target: {value: 'Body content.'}})
    fireEvent.click(submitButton())

    const sendingButton = await screen.findByRole('button', {name: /sending/i})
    expect(sendingButton.hasAttribute('disabled')).toBe(true)

    resolveFetch({ok: true, statusText: 'Created'})

    await waitFor(() => {
      expect(submitButton().hasAttribute('disabled')).toBe(false)
    })
  })

  it('clears any previous error when a subsequent submission succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ok: false, statusText: 'Forbidden'})
      .mockResolvedValueOnce({ok: true, statusText: 'Created'})
    vi.stubGlobal('fetch', fetchMock)

    renderWithProviders(<ContactAdmin />)

    fireEvent.change(subjectField(), {target: {value: 'Subject'}})
    fireEvent.change(bodyField(), {target: {value: 'Body content.'}})
    fireEvent.click(submitButton())

    await waitFor(() => {
      expect(screen.queryByText(/forbidden/i)).not.toBeNull()
    })

    fireEvent.change(subjectField(), {target: {value: 'Subject 2'}})
    fireEvent.change(bodyField(), {target: {value: 'Body 2'}})
    fireEvent.click(submitButton())

    await screen.findByText('Your message has been sent to the admin.')

    expect(screen.queryByText(/forbidden/i)).toBeNull()
  })
})
