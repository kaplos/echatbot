// ...existing code...
/**
 * Usage:
 *   SUPABASE_TOKEN="..." PROJECT_REF="ujwdpieleyuaiammaopj" BUCKET="echatbot" node scripts/move_supabase_objects.js
 *
 * Environment vars:
 *   SUPABASE_TOKEN - Bearer token
 *   PROJECT_REF    - project ref (default ujwdpieleyuaiammaopj)
 *   BUCKET         - bucket name (default echatbot)
 *   BATCH_SIZE     - how many items to move each run (default 120)
 *   INTERVAL_MS    - interval in ms (default 120000)
 */
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://ujwdpieleyuaiammaopj.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqd2RwaWVsZXl1YWlhbW1hb3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTc0ODAsImV4cCI6MjA1OTAzMzQ4MH0.gC8TQrfLGTLgVeHn7bPqzpf9Gp5anxWw3mso3dGJNyw"
const SUPABASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjNlNjE5YzJjIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL2FsdC5zdXBhYmFzZS5pby9hdXRoL3YxIiwic3ViIjoiM2Q3OGMzMmMtZGJkMi00ZDlkLWFmYmItMGZiNTlhNWQ4MmNhIiwiYXVkIjoiYXV0aGVudGljYXRlZCIsImV4cCI6MTc3NDk5MDgxMywiaWF0IjoxNzc0OTg5MDEzLCJlbWFpbCI6ImhheW0yMDU0QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZ2l0aHViIiwicHJvdmlkZXJzIjpbImdpdGh1YiJdfSwidXNlcl9tZXRhZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzM0OTc3Mjk1P3Y9NCIsImVtYWlsIjoiaGF5bTIwNTRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOi8vYXBpLmdpdGh1Yi5jb20iLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6ImthcGxvcyIsInByb3ZpZGVyX2lkIjoiMzQ5NzcyOTUiLCJzdWIiOiIzNDk3NzI5NSIsInVzZXJfbmFtZSI6ImthcGxvcyJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im9hdXRoIiwidGltZXN0YW1wIjoxNzc0MzkyMzMwfV0sInNlc3Npb25faWQiOiI5ODA5OTZkYy1mNTE3LTRiZDMtOWRhYS1iNjJhOWFhMzNkYWUiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.MrD13AUgxzfnQ8hsj8yA3Q1VE5L67xl6clBeEYMGmqOiaAz1DOkkVOwSZ_BtNXyPKhpsRAqJmGNLuqTL8JNc0TUALSHT-5Fhqjbl9xmVcrIJDBNPGA8cFOfEO02oDhblny9qyTndB8Pe06FogNqtCe-2Sx3DLpgZRD4-gtL0fX1f-LmAIVy6kOk78_nW3G2cvq5SYzsks4YGptFCDh3gdSzdb2YMaeklp6DUDFUOqAn8LUbl3C6bkKqT1yECGnggXWTHGmQU8sa5aSfFnxneKM9bi7orDMFEBzPumbn0tBJWnN-q6Ld34Oyx_2oHjttKU6hh_KGltyEJBleVf9fsRg";
const PROJECT_REF = process.env.PROJECT_REF || "ujwdpieleyuaiammaopj";
const BUCKET = process.env.BUCKET || "echatbot";
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "120", 10);
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS || "120000", 10); // 2 minutes
const supabase = createClient(supabaseUrl, supabaseKey);




async function listObjects(limit = 120, offset = 0, search = "") {
  const {data,error} = await supabase.storage.from("echatbot").list("", { limit, offset, search, sortBy: { column: "created_at", order: "desc" } });
  if (error) {
    console.error("Supabase list error:", error);
    return [];
  }
  return data.slice(3, 3 + BATCH_SIZE) || [];
}

function basename(path) {
  return path.replace(/.*[\\/]/, "");
}

async function moveObject(from, to) {
  const {data,error} = await supabase.storage.from("echatbot").move(from, to);
  if (error) {
    throw new Error(`Supabase move error: ${error.message}`);
  }
  return data;}

async function processOnce() {
  try {
    const items = await listObjects(120, 0, "");
    if (!items || items.length === 0) {
      console.log(new Date().toISOString(), "no items");
      return;
    }
    // items elements expected to have a 'name' field; support if direct string array
    const names = items.map(it => {
      if (!it) return null;
      if (typeof it === "string") return it;
      return it.name || it.Key || it.path || null;
    }).filter(Boolean);

    const batch = names.slice(0, BATCH_SIZE);
    if (batch.length === 0) {
      console.log(new Date().toISOString(), "no named items to move");
      return;
    }

    console.log(new Date().toISOString(), `moving ${batch.length} items...`);

    // concurrency control
    const CONCURRENCY = 10;
    let idx = 0;
    const results = [];
    async function worker() {
      while (idx < batch.length) {
        const i = idx++;
        const from = batch[i];
        const to = `public/${basename(from)}`;
        try {
          const r = await moveObject(from, to);
          results.push({ from, to, ok: true, res: r });
        } catch (err) {
          results.push({ from, to, ok: false, err: String(err) });
        }
      }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);

    const moved = results.filter(r => r.ok).length;
    const failed = results.length - moved;
    console.log(results)
    console.log(new Date().toISOString(), `done. moved=${moved} failed=${failed}`);
    if (failed) console.error(results.filter(r => !r.ok));
  } catch (err) {
    console.error(new Date().toISOString(), "error:", err);
  }
}

// run immediately and every INTERVAL_MS
processOnce();
setInterval(processOnce, INTERVAL_MS);