import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

//Ndodhet ne folder tabs qe ndodhet brenda folderit app
const MOCK_USERS = [
  { id: '1', name: 'Atila Elektronics', username: 'atila123' },
  { id: '2', name: 'Klubi i Rrobotikes', username: 'rrobotikaHF' },
  { id: '3', name: 'Praktika Storage', username: 'praktikaV4' },
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

  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.userCard}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userTag}>@{item.username}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Search users..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus={true} 
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
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          searchQuery.length > 0 ? (
            <Text style={styles.infoText}>No users found.</Text>
          ) : (
            <Text style={styles.infoText}>Type a name to search</Text>
          )
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  searchHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#007AFF' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: 'black', fontSize: 16 },
  list: { padding: 20 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#94c0ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: { color: 'black', fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { color: 'white', fontSize: 16, fontWeight: '600' },
  userTag: { color: '#fff', fontSize: 14 },
  infoText: { color: '#555', textAlign: 'center', marginTop: 40, fontSize: 16 }
});