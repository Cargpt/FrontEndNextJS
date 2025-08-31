// lib/fcm-storage.ts
'use client';

import { MessagePayload } from 'firebase/messaging';
import { openDB } from 'idb';

const DB_NAME = 'fcm_messages';
const STORE_NAME = 'messages';

export async function saveMessage(message: MessagePayload): Promise<void> {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true });
      }
    },
  });
  await db.add(STORE_NAME, message);
}

export async function getSavedMessages(): Promise<MessagePayload[]> {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true });
      }
    },
  });
  return await db.getAll(STORE_NAME) as MessagePayload[];
}

// 🔹 New: clear all saved messages
export async function clearMessages(): Promise<void> {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true });
      }
    },
  });
  await db.clear(STORE_NAME);
}
