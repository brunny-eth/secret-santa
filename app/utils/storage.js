import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'data');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export const storage = {
  saveGame: (gameCode, gameData) => {
    const filePath = path.join(STORAGE_DIR, `${gameCode}.json`);
    fs.writeFileSync(filePath, JSON.stringify(gameData));
  },

  loadGame: (gameCode) => {
    const filePath = path.join(STORAGE_DIR, `${gameCode}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  },

  generateGameCode: () => {
    // Generate a number between 1000 and 9999
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const filePath = path.join(STORAGE_DIR, `${code}.json`);
    // If the code already exists, try again
    return fs.existsSync(filePath) ? storage.generateGameCode() : code;
  }
};