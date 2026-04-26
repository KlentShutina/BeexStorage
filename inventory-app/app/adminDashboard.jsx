import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';

const MOCK_USERS = [
  { id: '1', username: 'Albi_student', role: 'Student' },
  { id: '2', username: 'Profesor_Klarensi', role: 'Teacher' },
  { id: '3', username: 'Shef_departamenti', role: 'HOD' },
  { id: '4', username: 'Financa_zyra', role: 'Finance' },
  { id: '5', username: 'Magazina_kryesore', role: 'Warehouse' },
];

const AVAILABLE_ROLES = ['Student', 'Teacher', 'HOD', 'Finance', 'Warehouse'];

export default function AdminDashboard() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const changeUserRole = (newRole) => {
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
    setModalVisible(false);
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>👤 {item.username}</Text>
        <Text style={styles.roleBadge}>{item.role}</Text>
      </View>
      
      <TouchableOpacity style={styles.editButton} onPress={() => openRoleModal(item)}>
        <Text style={styles.editButtonText}>Ndrysho Rolin</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menaxhimi i Përdoruesve</Text>
      <Text style={styles.subtitle}>Cakto rolet për secilin llogari</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
      />

      {/* Dritarja Pop-up (Modal) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Zgjidh rolin për: {selectedUser?.username}
            </Text>

            {AVAILABLE_ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleOption,
                  selectedUser?.role === role && styles.roleOptionSelected
                ]}
                onPress={() => changeUserRole(role)}
              >
                <Text style={[
                  styles.roleOptionText,
                  selectedUser?.role === role && styles.roleOptionTextSelected
                ]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Anulo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  list: { paddingHorizontal: 20 },
  userCard: {
    backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
  },
  userInfo: { flex: 1 },
  username: { fontSize: 16, fontWeight: '600', color: '#2C3E50', marginBottom: 4 },
  roleBadge: {
    fontSize: 12, color: '#007AFF', fontWeight: 'bold', backgroundColor: '#E6F4FE',
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden'
  },
  editButton: { backgroundColor: '#28A745', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  editButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  
  // Stilet e Pop-up (Modal)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#FFF', borderRadius: 15, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  roleOption: { width: '100%', padding: 15, borderRadius: 8, backgroundColor: '#F5F7FA', marginBottom: 10, alignItems: 'center' },
  roleOptionSelected: { backgroundColor: '#007AFF' },
  roleOptionText: { fontSize: 16, color: '#333', fontWeight: '500' },
  roleOptionTextSelected: { color: '#FFF', fontWeight: 'bold' },
  closeModalButton: { marginTop: 10, padding: 15, width: '100%', alignItems: 'center' },
  closeModalText: { color: '#FF3B30', fontSize: 16, fontWeight: 'bold' }
});