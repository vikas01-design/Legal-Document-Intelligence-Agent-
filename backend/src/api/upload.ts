import multer from "multer";
import fs from "fs";
import os from "os";
import path from "path";

// Use OS temp directory (guaranteed writable on Render and all platforms)
const uploadDir = path.join(os.tmpdir(), "lexora-uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const upload = multer({
  dest: uploadDir,
});