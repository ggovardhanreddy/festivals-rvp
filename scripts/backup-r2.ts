import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const BACKUP_DIR = path.join(process.cwd(), ".backup");
const JATHARA_DIR = path.join(process.cwd(), "public/media/jathara");

async function backupR2() {
  console.log("Phase 8-9: R2 Backup & Jathara Migration");
  console.log("=========================================\n");

  // Create backup directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // List local Jathara media
  if (fs.existsSync(JATHARA_DIR)) {
    const files = execSync(`find "${JATHARA_DIR}" -type f`).toString().trim().split("\n").filter(Boolean);
    console.log(`✓ Found ${files.length} Jathara media files locally`);
    
    // Create manifest
    const manifest = {
      phase: "8-9",
      timestamp: new Date().toISOString(),
      fileCount: files.length,
      files: files.map(f => ({
        path: f.replace(process.cwd(), ""),
        size: fs.statSync(f).size,
      })),
    };
    
    fs.writeFileSync(path.join(BACKUP_DIR, "jathara-manifest.json"), JSON.stringify(manifest, null, 2));
    console.log(`✓ Created manifest with ${files.length} files`);
  } else {
    console.log("ℹ No local Jathara media directory found");
  }

  console.log("\nR2 Backup Status:");
  console.log("- Bucket: reddivaripalli");
  console.log("- Action: Use 'wrangler r2 bucket create reddivaripalli' if missing");
  console.log("- Sync: rclone sync ./public/:media r2:reddivaripalli/media");
  console.log("\n✓ Phase 8-9 initialization complete");
  console.log("→ Next: Configure rclone R2 auth, then run sync");
}

backupR2().catch(console.error);
