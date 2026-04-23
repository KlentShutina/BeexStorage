import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const MOCK_USERS = [
  { id: '1', name: 'Atila Elektronics', username: 'atila123', storageCount: 5 },
  { id: '2', name: 'Klubi i Rrobotikes', username: 'rrobotikaHF', storageCount: 2 },
  { id: '3', name: 'Praktika Storage', username: 'praktikaV4', storageCount: 8 },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      const filtered = MOCK_USERS.filter(user => 
        user.username.toLowerCase().includes(text.toLowerCase()) ||
        user.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]); 
    }
  };

  const handleJoinRequest = (name) => {
    Alert.alert("Join Request", `Send a request to join ${name}'s inventory?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Send Request", onPress: () => Alert.alert("Success", "Request sent!") }
    ]);
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.inventoryRowCard}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.inventoryNameText}>{item.name}</Text>
        <Text style={styles.userTag}>@{item.username} • {item.storageCount} Storages</Text>
      </View>

      <TouchableOpacity 
        style={styles.joinBtn} 
        onPress={() => handleJoinRequest(item.name)}
      >
        <Text style={styles.joinBtnText}>Join</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color="#888" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.modalInput}
            placeholder="Search users or storage codes..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus={false} 
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.scroll}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons 
                name={searchQuery.length > 0 ? "search-outline" : "planet-outline"} 
                size={60} 
                color="#eee" 
            />
            <Text style={styles.infoText}>
              {searchQuery.length > 0 ? "No users found." : "Find colleagues and shared inventories"}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  topBar: { padding: 20, paddingTop: 10 },
  
  // Search Section (Matching your modal input style)
  searchSection: { paddingHorizontal: 20, marginBottom: 10 },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 2,
    borderColor: '#000', // Matches your "row" border style
  },
  modalInput: { flex: 1, color: 'black', fontSize: 16, fontWeight: '500' },

  // List & Cards (Matching Inventory Tab)
  scroll: { padding: 15 },
  inventoryRowCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 15, 
    borderWidth: 2, 
    borderColor: '#000', 
    alignItems: 'center',
    // iOS Shadow for a bit of depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 12, // More "squircle" like your shelves
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  userInfo: { flex: 1, marginLeft: 15 },
  inventoryNameText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  userTag: { color: '#666', fontSize: 13, marginTop: 2 },

  // Join Button Style
  joinBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  joinBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  // Empty State
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
  infoText: { color: '#888', textAlign: 'center', marginTop: 15, fontSize: 16, width: '80%' }
});