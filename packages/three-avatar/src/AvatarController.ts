import type { AssistantState, AvatarCommand } from '@holo/shared';

/**
 * Mappt den globalen Assistant-State auf eine Avatar-Anweisung
 * (Mimik + Geste + Lip-Sync). Wird vom Assistent-View aufgerufen,
 * sobald sich der State ändert.
 */
export function mapStateToCommand(state: AssistantState): AvatarCommand {
  switch (state) {
    case 'listening':
      return { expression: 'neutral', gesture: 'idle', lipSync: 0 };
    case 'thinking':
      return { expression: 'think', gesture: 'idle', lipSync: 0 };
    case 'answering':
      return { expression: 'speak', gesture: 'idle', lipSync: 0.6 };
    case 'error':
      return { expression: 'concern', gesture: 'idle', lipSync: 0 };
    case 'offline':
      return { expression: 'neutral', gesture: 'idle', lipSync: 0 };
    case 'online':
    default:
      return { expression: 'smile', gesture: 'wave', lipSync: 0 };
  }
}