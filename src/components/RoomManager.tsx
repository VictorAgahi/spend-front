import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWebSocket } from '../infra/websocket/useWebSocket';
import { useWebSocketContext } from '../infra/websocket/WebSocketProvider';
import { WsEvent, PingRoomPayload } from '../infra/websocket/types';
import { ActionButton } from './ActionButton';

export const RoomManager: React.FC = () => {
  const { emit, isConnected, currentRoom, setCurrentRoom, username } = useWebSocketContext();
  const [messages, setMessages] = useState<PingRoomPayload[]>([]);
  const [members, setMembers] = useState<string[]>([]);

  const joinVipRoom = () => {
    const roomName = 'vip-room';
    emit(WsEvent.JOIN_ROOM, { room: roomName, username });
    setCurrentRoom(roomName);
    setMessages([]);
  };

  const leaveRoom = () => {
    if (currentRoom) {
      emit(WsEvent.LEAVE_ROOM, { room: currentRoom });
      setCurrentRoom(null);
      setMembers([]);
      setMessages([]);
    }
  };

  useWebSocket(WsEvent.PING_ROOM, (data) => {
    setMessages((prev) => [data, ...prev]);
  });

  useWebSocket(WsEvent.ROOM_MEMBERS, (data) => {
    setMembers(data);
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.username}>
          You: <Text style={styles.bold}>{username}</Text>
        </Text>
        {isConnected && <View style={styles.onlineDot} />}
      </View>

      {!currentRoom ? (
        <ActionButton
          label="Join VIP Room"
          onPress={joinVipRoom}
          disabled={!isConnected}
        />
      ) : (
        <View style={styles.roomContent}>
          <View style={styles.roomHeader}>
            <View>
              <Text style={styles.roomTitle}>🏠 {currentRoom}</Text>
              <Text style={styles.memberCount}>{members.length} members online</Text>
            </View>
            <ActionButton
              label="Leave"
              onPress={leaveRoom}
              variant="secondary"
            />
          </View>

          <View style={styles.membersBar}>
            {members.map((m, i) => (
              <View key={i} style={styles.memberAvatar}>
                <Text style={styles.avatarText}>{m.charAt(5)}</Text>
                <Text style={styles.memberLabel} numberOfLines={1}>
                  {m === username ? 'Me' : m}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.messageList}>
            {messages.length > 0 ? (
              messages.map((item, index) => (
                <View key={index} style={styles.messageItem}>
                  <Text style={styles.messageSender}>{item.sender}</Text>
                  <Text style={styles.messageText}>{item.message}</Text>
                  <Text style={styles.messageTime}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Waiting for room events (ping-2)...</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#eee',
    minHeight: 150,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  roomContent: {
    marginTop: 8,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  memberCount: {
    fontSize: 11,
    color: '#999',
  },
  membersBar: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  memberAvatar: {
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
    width: 40,
  },
  avatarText: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    width: 30,
    height: 30,
    borderRadius: 15,
    textAlign: 'center',
    lineHeight: 30,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  memberLabel: {
    fontSize: 8,
    color: '#757575',
  },
  messageList: {
    flex: 1,
  },
  messageItem: {
    backgroundColor: '#F1F8E9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8BC34A',
  },
  messageSender: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#558B2F',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  messageTime: {
    fontSize: 9,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  }
});
