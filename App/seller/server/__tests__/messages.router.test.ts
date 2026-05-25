import type {Request, Response} from 'express'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {post} from '../messages/router.js'

const serviceMocks = vi.hoisted(() => ({
  sendMessage: vi.fn(),
}))

vi.mock('../messages/service.js', () => ({
  MessageService: vi.fn(() => serviceMocks),
}))

function response() {
  const res = {
    status: vi.fn(() => res),
    json: vi.fn(() => res),
    sendStatus: vi.fn(() => res),
  }
  return res as unknown as Response
}

const validInput = {
  subject: 'Help',
  body: 'I need help with a listing.',
}

const seller = {
  id: 'seller-1',
  name: 'Test Seller',
  email: 'seller@example.com',
}

describe('messages router', () => {
  beforeEach(() => {
    serviceMocks.sendMessage.mockReset()
  })

  it('rejects requests without an authenticated user', async () => {
    const req = {
      body: validInput,
    } as Request
    const res = response()

    await post(req, res)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      serviceCalls: serviceMocks.sendMessage.mock.calls,
    }).toEqual({
      statusCall: [401],
      serviceCalls: [],
    })
  })

  it('sends the message and responds 201 for an authenticated seller', async () => {
    serviceMocks.sendMessage.mockResolvedValue(undefined)
    const req = {
      user: seller,
      body: validInput,
    } as Request
    const res = response()

    await post(req, res)

    expect({
      serviceCall: serviceMocks.sendMessage.mock.calls[0],
      statusCall: (res.status as ReturnType<typeof vi.fn>).mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      serviceCall: [seller, validInput],
      statusCall: [201],
      jsonCall: [{ok: true}],
    })
  })

  it('rejects messages with an empty subject', async () => {
    const req = {
      user: seller,
      body: {subject: '', body: 'A message'},
    } as Request
    const res = response()

    await expect(post(req, res)).rejects.toThrow()
    expect(serviceMocks.sendMessage).not.toHaveBeenCalled()
  })

  it('rejects messages with an empty body', async () => {
    const req = {
      user: seller,
      body: {subject: 'A subject', body: ''},
    } as Request
    const res = response()

    await expect(post(req, res)).rejects.toThrow()
    expect(serviceMocks.sendMessage).not.toHaveBeenCalled()
  })

  it('rejects messages whose subject exceeds the maximum length', async () => {
    const req = {
      user: seller,
      body: {subject: 'a'.repeat(257), body: 'A message'},
    } as Request
    const res = response()

    await expect(post(req, res)).rejects.toThrow()
    expect(serviceMocks.sendMessage).not.toHaveBeenCalled()
  })

  it('rejects messages whose body exceeds the maximum length', async () => {
    const req = {
      user: seller,
      body: {subject: 'A subject', body: 'a'.repeat(2049)},
    } as Request
    const res = response()

    await expect(post(req, res)).rejects.toThrow()
    expect(serviceMocks.sendMessage).not.toHaveBeenCalled()
  })

  it('propagates errors from the MessageService', async () => {
    serviceMocks.sendMessage.mockRejectedValue(
      new Error('Failed to send message: Forbidden'),
    )
    const req = {
      user: seller,
      body: validInput,
    } as Request
    const res = response()

    await expect(post(req, res)).rejects.toThrow(
      'Failed to send message: Forbidden',
    )
  })
})
