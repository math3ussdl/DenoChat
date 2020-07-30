import {
  WebSocket,
  isWebSocketCloseEvent,
} from 'https://deno.land/std/ws/mod.ts'
import { faker } from "https://raw.githubusercontent.com/jackfiszr/deno-faker/master/mod.ts";

const users = new Map<string, WebSocket>()

function broadcast(message: string, senderId?: string): void {
  if (!message) return
  for (const user of users.values()) {
    user.send(senderId ? `[${senderId}]: ${message}` : message)
  }
}

export async function chat(ws: WebSocket): Promise<void> {
  const userName = faker.name.firstName()

  // Register user connection
  users.set(userName, ws)
  broadcast(`> ${userName} join on the chat!`)

  // Wait for new messages
  for await (const event of ws) {
    const message = typeof event === 'string' ? event : ''

    broadcast(message, userName)

    // Unregister user connection
    if (!message && isWebSocketCloseEvent(event)) {
      users.delete(userName)
      broadcast(`> ${userName} has left the chat!`)
      break
    }
  }
}