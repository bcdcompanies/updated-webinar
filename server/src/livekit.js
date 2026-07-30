import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { config } from './config.js';

const { apiKey, apiSecret, url } = config.livekit;

// RoomServiceClient talks to LiveKit's HTTP API. LIVEKIT_URL is a ws:// URL;
// the server API lives on the same host over http(s).
const httpUrl = url.replace(/^ws/, 'http');
export const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);

/**
 * Mint a LiveKit access token.
 * @param {object} opts
 * @param {string} opts.roomName
 * @param {string} opts.identity  unique participant identity
 * @param {string} opts.name      display name
 * @param {boolean} opts.host     hosts can publish + moderate; students view-only
 */
export async function createToken({ roomName, identity, name, host }) {
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    ttl: '4h',
  });
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canSubscribe: true,
    canPublishData: true,            // everyone can use chat
    canPublish: !!host,              // students start view-only
    roomAdmin: !!host,               // hosts can moderate via server API
  });
  return await at.toJwt();
}

/** Grant a student publish rights (promote to speaker). Host action. */
export async function setParticipantCanPublish(roomName, identity, canPublish) {
  await roomService.updateParticipant(roomName, identity, undefined, {
    canPublish,
    canSubscribe: true,
    canPublishData: true,
  });
}

/** Mute a participant by removing publish rights. */
export async function removeParticipant(roomName, identity) {
  await roomService.removeParticipant(roomName, identity);
}
