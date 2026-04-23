import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';

// Statuset e mundshme të një porosie
const STATUSES = {
  PENDING_HOD: 'Në pritje nga Shefi',
  PENDING_FINANCE: 'Në pritje nga Financa',
  PENDING_WAREHOUSE: 'Në pritje nga Magazina',
  COMPLETED: 'E Përfunduar',
  REJECTED: 'E Refuzuar'
};

export default function OrderScreen() {
  // Simulatori i roleve (për të testuar pa databazë)
  const [currentRole, setCurrentRole] = useState('Teacher'); 
  
  // Lista e porosive dhe form-i
  const [orders, setOrders] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');

  // Funksioni për Mësuesin: Krijimi i një porosie
  const handleCreateOrder = () => {
    if (!itemName.trim() || !itemQuantity.trim()) {
      Alert.alert('Kujdes', 'Ju lutem plotësoni emrin dhe sasinë e produktit.');
      return;
    }

    const newOrder = {
      id: Date.now().toString(),
      item: itemName,
      quantity: itemQuantity,
      status: STATUSES.PENDING_HOD,
      requestedBy: 'Profesor Klarensi' // Fiktive
    };

    setOrders([newOrder, ...orders]);
    setItemName('');
    setItemQuantity('');
    Alert.alert('Sukses', 'Porosia u dërgua te Shefi i Departamentit!');
  };

  // Funksioni për Aprovimin/Refuzimin nga rolet e ndryshme
  const handleAction = (orderId, actionType) => {
    setOrders(orders.map(order => {
      if (order.id !== orderId) return order;

      let newStatus = order.status;

      if (actionType === 'REJECT') {
        newStatus = STATUSES.REJECTED;
      } else if (actionType === 'APPROVE') {
        if (currentRole === 'HOD') newStatus = STATUSES.PENDING_FINANCE;
        else if (currentRole === 'Finance') newStatus = STATUSES.PENDING_WAREHOUSE;
        else if (currentRole === 'Warehouse') newStatus = STATUSES.COMPLETED;
      }

      return { ...order, status: newStatus };
    }));
  };

  // Karta e Porosisë (Ndryshon butonat në varësi të rolit)
  const renderOrderCard = ({ item }) => {
    // Kushtet se kur duhen shfaqur butonat e aprovimit
    const showHODButtons = currentRole === 'HOD' && item.status === STATUSES.PENDING_HOD;
    const showFinanceButtons = currentRole === 'Finance' && item.status === STATUSES.PENDING_FINANCE;
    const showWarehouseButtons = currentRole === 'Warehouse' && item.status === STATUSES.PENDING_WAREHOUSE;
    
    const canApprove = showHODButtons || showFinanceButtons || showWarehouseButtons;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.itemName}>📦 {item.item} (x{item.quantity})</Text>
          <Text style={[
            styles.statusBadge, 
            item.status === STATUSES.COMPLETED ? styles.statusCompleted : 
            item.status === STATUSES.REJECTED ? styles.statusRejected : styles.statusPending
          ]}>
            {item.status}
          </Text>
        </View>
        <Text style={styles.requestedBy}>Kërkuar nga: {item.requestedBy}</Text>

        {canApprove && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.btn, styles.btnReject]} 
              onPress={() => handleAction(item.id, 'REJECT')}
            >
              <Text style={styles.btnText}>Refuzo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.btn, styles.btnApprove]} 
              onPress={() => handleAction(item.id, 'APPROVE')}
            >
              <Text style={styles.btnText}>
                {currentRole === 'Warehouse' ? 'Dorëzo Produktin' : 'Aprovo'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* SIMULATORI I ROLEVE - Vetëm për testim */}
      <View style={styles.roleSimulator}>
        <Text style={styles.simulatorTitle}>Simulo Rolin (Kliko për të ndryshuar):</Text>
        <View style={styles.roleButtons}>
          {['Teacher', 'HOD', 'Finance', 'Warehouse'].map(role => (
            <TouchableOpacity 
              key={role} 
              style={[styles.roleBtn, currentRole === role && styles.roleBtnActive]}
              onPress={() => setCurrentRole(role)}
            >
              <Text style={[styles.roleBtnText, currentRole === role && styles.roleBtnTextActive]}>
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* PAMJA E MËSUESIT - Formular Porosie */}
      {currentRole === 'Teacher' && (
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Krijo Porosi të Re</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Emri i produktit (psh. Lapsa)" 
            value={itemName}
            onChangeText={setItemName}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Sasia (psh. 10)" 
            keyboardType="numeric"
            value={itemQuantity}
            onChangeText={setItemQuantity}
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleCreateOrder}>
            <Text style={styles.submitBtnText}>Dërgo Kërkesën</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LISTA E POROSIVE */}
      <Text style={[styles.sectionTitle, { marginLeft: 15 }]}>Lista e Porosive</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Nuk ka asnjë porosi për momentin.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  
  // Stilet e Simulatorit
  roleSimulator: { backgroundColor: '#E2E8F0', padding: 10, borderBottomWidth: 1, borderColor: '#CBD5E1' },
  simulatorTitle: { fontSize: 12, color: '#475569', marginBottom: 5, fontWeight: 'bold' },
  roleButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  roleBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#FFF' },
  roleBtnActive: { backgroundColor: '#007AFF' },
  roleBtnText: { fontSize: 12, color: '#333' },
  roleBtnTextActive: { color: '#FFF', fontWeight: 'bold' },

  // Stilet e Formularit (Mësuesi)
  formContainer: { padding: 15, backgroundColor: '#FFF', marginBottom: 10, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#1E293B' },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, marginBottom: 10, backgroundColor: '#F8FAFC' },
  submitBtn: { backgroundColor: '#28A745', padding: 15, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // Stilet e Listës dhe Kartave
  list: { padding: 15 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 20 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  requestedBy: { fontSize: 14, color: '#64748B', marginBottom: 15 },
  statusBadge: { fontSize: 12, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, fontWeight: 'bold', overflow: 'hidden' },
  statusPending: { backgroundColor: '#FEF08A', color: '#854D0E' },
  statusCompleted: { backgroundColor: '#BBF7D0', color: '#166534' },
  statusRejected: { backgroundColor: '#FECACA', color: '#991B1B' },

  // Stilet e Butonave të Veprimit
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderColor: '#E2E8F0', paddingTop: 10 },
  btn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 6, marginLeft: 10 },
  btnApprove: { backgroundColor: '#007AFF' },
  btnReject: { backgroundColor: '#EF4444' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});