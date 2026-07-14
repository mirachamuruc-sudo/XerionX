import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

// Initialize Firebase Admin with Google Application Default Credentials
// Since we are running in a Cloud Run sandbox inside the target project,
// Firebase Admin automatically authenticates using container-level metadata credentials.
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");

let projectId = "gen-lang-client-0466601915";
let databaseId = "ai-studio-c7af444f-d228-4c98-8957-0a265a18a406";

try {
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
    if (config.projectId) projectId = config.projectId;
    if (config.firestoreDatabaseId) databaseId = config.firestoreDatabaseId;
  }
} catch (e) {
  console.error("Failed to read firebase config file:", e);
}

// Initialize application securely using modular admin app API
if (getApps().length === 0) {
  initializeApp({
    projectId: projectId
  });
}

// Instantiate target multi-tenant custom Firestore instance
export const firestore = getFirestore(databaseId);

// Core Collections references
export const usersCol = firestore.collection("users");
export const teamsCol = firestore.collection("teams");
export const chatsCol = firestore.collection("chats");
export const transactionsCol = firestore.collection("transactions");
export const webhooksCol = firestore.collection("webhooks");
export const webhookLogsCol = firestore.collection("webhookLogs");
export const robloxConfigsCol = firestore.collection("robloxConfigs");
export const discordConfigsCol = firestore.collection("discordConfigs");
export const apiKeysCol = firestore.collection("apiKeys");
export const auditLogsCol = firestore.collection("auditLogs");
export const notificationsCol = firestore.collection("notifications");

// Default initial data for automatic database seeding
export const DEFAULT_DB = {
  users: [
    {
      uid: "admin-user-id",
      email: "admin@omnisaas.dev",
      passwordHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // hashed 'password123'
      username: "RootAdmin",
      language: "de",
      theme: "dark",
      plan: "TEAM",
      geminiCredits: 12500,
      dailyUsage: 450,
      monthlyUsage: 3400,
      lastReset: new Date().toISOString(),
      cooldownUntil: null,
      onboardingCompleted: true,
      isAdmin: true
    },
    {
      uid: "dev-user-id",
      email: "mirachamuruc@gmail.com",
      passwordHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // hashed 'password123'
      username: "DevPro",
      language: "de",
      theme: "dark",
      plan: "PREMIUM",
      geminiCredits: 2500,
      dailyUsage: 120,
      monthlyUsage: 850,
      lastReset: new Date().toISOString(),
      cooldownUntil: null,
      onboardingCompleted: false,
      isAdmin: false
    }
  ],
  teams: [
    {
      id: "team-nexus",
      name: "Nexus Core Developers",
      description: "Primary engineering guild for Roblox and Discord live systems integration.",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      ownerId: "admin-user-id",
      credits: 5000,
      maxCredits: 10000,
      members: [
        {
          userId: "admin-user-id",
          email: "admin@omnisaas.dev",
          username: "RootAdmin",
          role: "OWNER",
          creditsLimit: 5000,
          creditsUsed: 1200,
          joinedAt: new Date().toISOString()
        },
        {
          userId: "dev-user-id",
          email: "mirachamuruc@gmail.com",
          username: "DevPro",
          role: "DEVELOPER",
          creditsLimit: 2000,
          creditsUsed: 450,
          joinedAt: new Date().toISOString()
        }
      ],
      creditsUsedThisMonth: 1650,
      createdAt: new Date().toISOString()
    }
  ],
  chats: [
    {
      id: "chat-intro",
      userId: "dev-user-id",
      title: "Willkommen im Gemini-Workspace",
      messages: [
        {
          id: "m1",
          sender: "model",
          text: "Hallo! Ich bin dein OmniSaaS Gemini-Assistent. Ich kann dir dabei helfen, Code zu generieren, Bilder zu analysieren oder Discord-Bots und Roblox-Skripte einzurichten. Wie kann ich dich heute unterstützen?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          creditsUsed: 0
        }
      ],
      updatedAt: new Date().toISOString()
    }
  ],
  transactions: [
    {
      id: "tx-init-1",
      userId: "admin-user-id",
      amount: 10000,
      type: "PLAN_RESET",
      description: "Start-Zuweisung für Team-Plan",
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "tx-init-2",
      userId: "dev-user-id",
      amount: 2500,
      type: "PLAN_RESET",
      description: "Start-Zuweisung für Premium-Plan",
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  webhooks: [
    {
      id: "wh-discord-logs",
      name: "Discord Main Logging Channel",
      type: "Discord",
      url: "https://discord.com/api/webhooks/sample-id-123",
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "wh-roblox-server",
      name: "Roblox Join/Leave Analytics",
      type: "Roblox",
      url: "https://omnisaas.dev/api/webhooks/roblox-ingress",
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  webhookLogs: [
    {
      id: "wl-1",
      webhookId: "wh-discord-logs",
      timestamp: new Date().toISOString(),
      payload: JSON.stringify({ content: "Roblox Server-Start Event wurde empfangen!" }, null, 2),
      status: "SUCCESS",
      statusCode: 200,
      response: "OK"
    }
  ],
  robloxConfigs: [
    {
      id: "team-nexus",
      apiKey: "ro_cloud_key_live_9a2b8c7d6e5f",
      universeId: "5981240211",
      placeId: "14210982552",
      datastoreKey: "LivePlayerSaveData",
      messagingServiceTopic: "ServerTelemetry",
      privateServerData: "{\"allowedVips\":[\"OwnerRobot\"],\"customMessage\":\"Willkommen auf unserem privaten Dev-Server!\"}",
      updatedAt: new Date().toISOString()
    }
  ],
  discordConfigs: [
    {
      id: "team-nexus",
      botToken: "MTE5MjM4NDcxOTIzODQ3MTkyMzg0.G1a2B3.C4d5E6F7g8H9i0J_Live",
      guildId: "1098273645283746",
      logChannelId: "1102938475628394",
      welcomeChannelId: "1102938475628395",
      adminRoleId: "10293847562839401",
      updatedAt: new Date().toISOString()
    }
  ],
  apiKeys: [
    {
      id: "key-gemini",
      userId: "dev-user-id",
      service: "Gemini",
      name: "Standard Gemini API Key",
      maskedKey: "AIzaSyD9...X8uA1",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    },
    {
      id: "key-roblox",
      userId: "dev-user-id",
      service: "Roblox Open Cloud",
      name: "Roblox Inventory Reader",
      maskedKey: "ro_cloud_key_...942ab",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    }
  ],
  auditLogs: [
    {
      id: "al-1",
      userId: "dev-user-id",
      username: "DevPro",
      action: "LOGIN",
      details: "Erfolgreicher Login über E-Mail/Passwort",
      ip: "127.0.0.1",
      timestamp: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: "nt-1",
      userId: "dev-user-id",
      title: "Willkommen an Bord!",
      message: "Vielen Dank, dass Sie sich für OmniSaaS entschieden haben. Starten Sie jetzt Ihre geführte Onboarding-Tour!",
      type: "success",
      timestamp: new Date().toISOString(),
      isRead: false
    }
  ]
};

// Seeding engine to guarantee data persistence after new deployments
export const seedDatabaseIfEmpty = async () => {
  try {
    const usersSnap = await usersCol.limit(1).get();
    if (usersSnap.empty) {
      console.log("[SEED] Firestore is empty. Initializing master production seed...");

      for (const u of DEFAULT_DB.users) {
        await usersCol.doc(u.uid).set(u);
      }
      for (const t of DEFAULT_DB.teams) {
        await teamsCol.doc(t.id).set(t);
      }
      for (const c of DEFAULT_DB.chats) {
        await chatsCol.doc(c.id).set(c);
      }
      for (const tx of DEFAULT_DB.transactions) {
        await transactionsCol.doc(tx.id).set(tx);
      }
      for (const wh of DEFAULT_DB.webhooks) {
        await webhooksCol.doc(wh.id).set(wh);
      }
      for (const wl of DEFAULT_DB.webhookLogs) {
        await webhookLogsCol.doc(wl.id).set(wl);
      }
      for (const rc of DEFAULT_DB.robloxConfigs) {
        await robloxConfigsCol.doc(rc.id).set(rc);
      }
      for (const dc of DEFAULT_DB.discordConfigs) {
        await discordConfigsCol.doc(dc.id).set(dc);
      }
      for (const ak of DEFAULT_DB.apiKeys) {
        await apiKeysCol.doc(ak.id).set(ak);
      }
      for (const al of DEFAULT_DB.auditLogs) {
        await auditLogsCol.doc(al.id).set(al);
      }
      for (const nt of DEFAULT_DB.notifications) {
        await notificationsCol.doc(nt.id).set(nt);
      }

      console.log("[SEED] Production seed successfully written to Cloud Firestore.");
    } else {
      console.log("[SEED] Active collections found. Seeding skipped.");
    }
  } catch (err) {
    console.error("[SEED] Error writing seed documents to Firestore:", err);
  }
};
