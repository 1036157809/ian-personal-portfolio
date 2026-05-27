import chatRoutes from './routes/chat.routes';
import * as aiConfig from './config';

export { aiConfig };
export { chatRoutes };
export { chat, chatStream } from './services/chat.service';
export { indexKnowledge, retrieveChunks } from './services/indexing.service';
export { chunkText } from './utils/chunker';
export type { Chunk } from './utils/chunker';
export type { ChatMessage } from './services/chat.service';
