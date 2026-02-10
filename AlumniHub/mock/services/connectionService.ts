import { mockDelay, shouldFail } from '../../utils/mockDelay';
import { Connection, ConnectionStatus } from '../../types';

const connectionsMap = new Map<string, Connection>();

export const getConnections = async (userId: string): Promise<Connection[]> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to load connections. Please try again.');
  }
  
  return Array.from(connectionsMap.values()).filter(
    conn =>
      (conn.userId === userId || conn.connectedUserId === userId) &&
      conn.status === ConnectionStatus.ACCEPTED
  );
};

export const getPendingRequests = async (userId: string): Promise<Connection[]> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to load pending requests. Please try again.');
  }
  
  return Array.from(connectionsMap.values()).filter(
    conn => conn.connectedUserId === userId && conn.status === ConnectionStatus.PENDING
  );
};

export const getSentRequests = async (userId: string): Promise<Connection[]> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to load sent requests. Please try again.');
  }
  
  return Array.from(connectionsMap.values()).filter(
    conn => conn.userId === userId && conn.status === ConnectionStatus.PENDING
  );
};

export const sendConnectionRequest = async (
  userId: string,
  targetUserId: string
): Promise<Connection> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to send connection request. Please try again.');
  }
  
  const existingConnection = Array.from(connectionsMap.values()).find(
    conn =>
      (conn.userId === userId && conn.connectedUserId === targetUserId) ||
      (conn.userId === targetUserId && conn.connectedUserId === userId)
  );
  
  if (existingConnection) {
    throw new Error('Connection request already exists');
  }
  
  const newConnection: Connection = {
    id: `conn_${userId}_${targetUserId}_${Date.now()}`,
    userId,
    connectedUserId: targetUserId,
    status: ConnectionStatus.PENDING,
    requestedAt: Date.now(),
  };
  
  connectionsMap.set(newConnection.id, newConnection);
  
  return newConnection;
};

export const acceptConnectionRequest = async (connectionId: string): Promise<Connection> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to accept connection request. Please try again.');
  }
  
  const connection = connectionsMap.get(connectionId);
  
  if (!connection) {
    throw new Error('Connection not found');
  }
  
  connection.status = ConnectionStatus.ACCEPTED;
  connection.acceptedAt = Date.now();
  
  return connection;
};

export const rejectConnectionRequest = async (connectionId: string): Promise<void> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to reject connection request. Please try again.');
  }
  
  const connection = connectionsMap.get(connectionId);
  
  if (!connection) {
    throw new Error('Connection not found');
  }
  
  connection.status = ConnectionStatus.REJECTED;
};

export const getConnectionStatus = async (
  userId: string,
  targetUserId: string
): Promise<ConnectionStatus | null> => {
  await mockDelay(100, 200);
  
  const connection = Array.from(connectionsMap.values()).find(
    conn =>
      (conn.userId === userId && conn.connectedUserId === targetUserId) ||
      (conn.userId === targetUserId && conn.connectedUserId === userId)
  );
  
  return connection ? connection.status : null;
};
