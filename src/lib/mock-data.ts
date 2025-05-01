
// Re-export everything from the database module
import * as database from './database';
export * from './database';

// The following is deprecated and kept only for backward compatibility
// Please use imports from './types' and './database' instead
import { v4 as uuidv4 } from 'uuid';
import type { Service, User, Subscription } from './types';

// Compatibility exports
export type { Service, User, Subscription };
