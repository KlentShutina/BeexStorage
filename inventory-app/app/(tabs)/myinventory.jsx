import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Platform
} from 'react-native';

export default function InventoryScreen() {
  // --- STATE ---
  const [inventories, setInventories] = useState([
    { id: '1', name: 'Main Storage', rows: [], paired: false, deviceId: null },
    { id: '2', name: 'Lab B Storage', rows: [], paired: false, deviceId: null }
  ]);
  const [activeInventoryId, setActiveInventoryId] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pairingModal, setPairingModal] = useState(false);
  const [qtyModal, setQtyModal] = useState(false);
  
  const [activeShelf, setActiveShelf] = useState(null);
  const [tempLabel, setTempLabel] = useState("");
  const [tempQty, setTempQty] = useState("0");

  const currentInv = inventories.find(inv => inv.id === activeInventoryId);
  const rows = currentInv?.rows || [];

  // --- CORE UTILS ---
  const updateRows = (newRows) => {
    setInventories(prev => prev.map(inv => 
      inv.id === activeInventoryId ? { ...inv, rows: newRows } : inv
    ));
  };

  // --- ROW ACTIONS ---
  const addRow = () => {
    const nextChar = String.fromCharCode(65 + rows.length);
    const newRow = { id: Date.now().toString(), letter: nextChar, shelves: [] };
    updateRows([...rows, newRow]);
    setSelectedRowId(newRow.id);
  };

  const removeRow = () => {
    if (!selectedRowId) return Alert.alert("Select Row", "Tap a row to select it first.");
    
    const rowToDelete = rows.find(r => r.id === selectedRowId);
    Alert.alert(
      "Remove Row",
      `Delete Row ${rowToDelete?.letter} and all its drawers?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            const filtered = rows.filter(r => r.id !== selectedRowId);
            // Re-index letters A, B, C...
            const reindexed = filtered.map((row, index) => {
              const newLetter = String.fromCharCode(65 + index);
              return {
                ...row,
                letter: newLetter,
                shelves: row.shelves.map(s => ({
                  ...s,
                  coord: `${newLetter}${s.coord.substring(1)}`
                }))
              };
            });
            updateRows(reindexed);
            setSelectedRowId(null);
          } 
        }
      ]
    );
  };

  // --- SHELF ACTIONS ---
  const addShelf = () => {
    if (!selectedRowId) return Alert.alert("Select Row", "Tap a row letter first!");
    const updatedRows = rows.map(row => {
      if (row.id === selectedRowId) {
        const numbers = row.shelves.map(s => parseInt(s.coord.substring(1)) || 0);
        const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
        return {
          ...row,
          shelves: [...row.shelves, {
            id: `shelf-${Date.now()}`,
            coord: `${row.letter}${nextNum}`,
            label: "",
            quantity: 0,
            isOpen: false
          }]
        };
      }
      return row;
    });
    updateRows(updatedRows);
  };

  const handleShelfPress = (rowId, shelf) => {
    if (isEditMode) {
      setActiveShelf({ rowId, shelfId: shelf.id });
      setTempLabel(shelf.label);
      setTempQty(shelf.quantity?.toString() || "0");
      setQtyModal(true);
    } else {
      const updatedRows = rows.map(r => r.id === rowId ? {
        ...r, shelves: r.shelves.map(s => s.id === shelf.id ? { ...s, isOpen: !s.isOpen } : s)
      } : r);
      updateRows(updatedRows);
    }
  };

  // --- RENDERS ---

  if (!activeInventoryId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}><Text style={styles.headerTitle}>Systems</Text></View>
        <FlatList 
          data={inventories}
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => (
            <View style={[styles.sysCard, item.paired && styles.pairedBorder]}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => setActiveInventoryId(item.id)}>
                <Text style={styles.sysName}>{item.name}</Text>
                <Text style={styles.sysStatus}>{item.paired ? `Connected: ${item.deviceId}` : "Disconnected"}</Text>
              </TouchableOpacity>
              {!item.paired && (
                <TouchableOpacity style={styles.pairIconBtn} onPress={() => {
                  setPairingModal(true);
                  setTimeout(() => {
                    setInventories(prev => prev.map(inv => inv.id === item.id ? {...inv, paired: true, deviceId: 'SN-X100'} : inv));
                    setPairingModal(false);
                  }, 2000);
                }}>
                  <Ionicons name="bluetooth" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
        <Modal visible={pairingModal} transparent><View style={styles.pairingOverlay}><ActivityIndicator size="large" color="#007AFF" /><Text style={styles.pairingText}>Scanning for hardware...</Text></View></Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={qtyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Drawer Settings</Text>
          <TextInput style={styles.modalInput} value={tempLabel} onChangeText={setTempLabel} placeholder="Item Name" />
          <View style={styles.qtyRow}>
            <TouchableOpacity onPress={() => setTempQty(Math.max(0, parseInt(tempQty)-1).toString())}><Ionicons name="remove-circle" size={45} color="#FF3B30" /></TouchableOpacity>
            <TextInput style={styles.qtyText} value={tempQty} onChangeText={setTempQty} keyboardType="numeric" />
            <TouchableOpacity onPress={() => setTempQty((parseInt(tempQty)+1).toString())}><Ionicons name="add-circle" size={45} color="#34C759" /></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={() => {
            updateRows(rows.map(r => r.id === activeShelf.rowId ? {...r, shelves: r.shelves.map(s => s.id === activeShelf.shelfId ? {...s, label: tempLabel, quantity: parseInt(tempQty) || 0} : s)} : r));
            setQtyModal(false);
          }}><Text style={styles.btnText}>Apply Changes</Text></TouchableOpacity>
          <TouchableOpacity style={{marginTop: 15, alignItems: 'center'}} onPress={() => setQtyModal(false)}><Text style={{color: '#888'}}>Cancel</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setActiveInventoryId(null)}><Ionicons name="chevron-back" size={28} color="#007AFF" /></TouchableOpacity>
        <Text style={styles.headerTitleSmall}>{currentInv.name}</Text>
        <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)} style={[styles.editBtn, isEditMode && {backgroundColor: '#007AFF'}]}>
          <Text style={styles.btnText}>{isEditMode ? "Done" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 120 }}>
        {rows.map(row => (
          <View key={row.id} style={[styles.row, selectedRowId === row.id && styles.activeRow]}>
            <TouchableOpacity onPress={() => setSelectedRowId(row.id)}><Text style={styles.rowLetter}>Row {row.letter}</Text></TouchableOpacity>
            <View style={styles.grid}>
              {row.shelves.map(shelf => (
                <View key={shelf.id} style={styles.shelfWrapper}>
                  {isEditMode && (
                    <TouchableOpacity style={styles.iosDelete} onPress={() => updateRows(rows.map(r => r.id === row.id ? {...r, shelves: r.shelves.filter(s => s.id !== shelf.id)} : r))}>
                      <Ionicons name="remove-circle" size={22} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.shelf, shelf.isOpen ? styles.shelfOpen : styles.shelfClosed]} onPress={() => handleShelfPress(row.id, shelf)}>
                    <Text style={styles.coord}>{shelf.coord}</Text>
                    <Text style={styles.qty}>{shelf.quantity}</Text>
                    <Text style={styles.label} numberOfLines={1}>{shelf.label || "Empty"}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.fBtn, {backgroundColor: isEditMode ? '#FF3B30' : '#007AFF'}]} onPress={isEditMode ? removeRow : addRow}>
          <Ionicons name={isEditMode ? "trash" : "add"} size={20} color="white" />
          <Text style={styles.btnText}>{isEditMode ? "Remove Selected" : "Add Row"}</Text>
        </TouchableOpacity>
        {!isEditMode && (
          <TouchableOpacity style={[styles.fBtn, {backgroundColor: '#34C759'}]} onPress={addShelf}>
            <Ionicons name="apps" size={20} color="white" />
            <Text style={styles.btnText}>Add Shelf</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerTitleSmall: { fontSize: 18, fontWeight: 'bold' },
  sysCard: { padding: 20, borderRadius: 15, borderWidth: 2, borderColor: '#000', marginBottom: 15, flexDirection: 'row', alignItems: 'center' },
  pairedBorder: { borderColor: '#34C759' },
  sysName: { fontSize: 18, fontWeight: 'bold' },
  sysStatus: { fontSize: 12, color: '#888' },
  pairIconBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 10 },
  pairingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  pairingText: { marginTop: 15, fontWeight: 'bold', color: '#007AFF' },
  scroll: { paddingHorizontal: 15 },
  row: { marginBottom: 15, padding: 10, borderRadius: 15, borderWidth: 2, borderColor: '#f0f0f0' },
  activeRow: { borderColor: '#007AFF' },
  rowLetter: { fontWeight: 'bold', color: '#888', marginBottom: 10, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  shelfWrapper: { padding: 5, position: 'relative' },
  iosDelete: { position: 'absolute', top: -2, left: -2, zIndex: 10, backgroundColor: '#fff', borderRadius: 11 },
  shelf: { width: 82, height: 82, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000' },
  shelfOpen: { backgroundColor: '#34C759', borderColor: '#248A3D' },
  shelfClosed: { backgroundColor: '#FF3B30', borderColor: '#C42B24' },
  coord: { position: 'absolute', top: 5, left: 8, fontSize: 9, color: '#fff', fontWeight: 'bold' },
  qty: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  label: { fontSize: 9, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },
  editBtn: { backgroundColor: '#000', paddingVertical: 6, paddingHorizontal: 15, borderRadius: 15 },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingBottom: Platform.OS === 'ios' ? 35 : 25 },
  fBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, width: '46%', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 25, borderWidth: 2, borderColor: '#000' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalInput: { borderWidth: 2, borderColor: '#000', borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 20 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  qtyText: { fontSize: 36, fontWeight: 'bold', marginHorizontal: 25 },
  saveBtn: { backgroundColor: '#007AFF', padding: 18, borderRadius: 15, alignItems: 'center' }
});