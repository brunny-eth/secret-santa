import { storage } from '../../utils/storage';  // Use relative path

export async function POST(req) {
  const { action, gameCode, gameData } = await req.json();

  try {
    switch (action) {
      case 'create':
        const newGameCode = storage.generateGameCode();
        storage.saveGame(newGameCode, gameData);
        return Response.json({ gameCode: newGameCode });

      case 'load':
        const loadedGame = storage.loadGame(gameCode);
        if (!loadedGame) {
          return Response.json({ error: 'Game not found' }, { status: 404 });
        }
        return Response.json(loadedGame);

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}