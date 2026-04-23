import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function InventoryScreen() {
  const [rows, setRows] = useState([]); 
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);


  const [modalVisible, setModalVisible] = useState(false);
  const [tempLabel, setTempLabel] = useState("");
  const [activeShelf, setActiveShelf] = useState(null); // {rowId, shelfId}
//Ndodhet ne folder tabs qe ndodhet brenda folderit app

  const handleRowAction = () => {
    if (isEditMode) {
      if (rows.length === 0) return;
      Alert.alert("Remove Row", `Delete the last row?`, [
        { text: "Cancel" },
        { text: "Delete", style: "destructive", onPress: () => setRows(rows.slice(0, -1)) }
      ]);
    } else {
      const nextChar = String.fromCharCode(65 + rows.length);
      const newRow = { id: Date.now().toString(), letter: nextChar, shelves: [] };
      setRows([...rows, newRow]);
      if (!selectedRowId) setSelectedRowId(newRow.id);
    }
  };


  const addShelf = () => {
    if (!selectedRowId) return Alert.alert("Select a Row", "Tap a row name first!");
    setRows(prev => prev.map(row => {
      if (row.id === selectedRowId) {
        const maxNum = row.shelves.reduce((max, s) => {
          const num = parseInt(s.coord.substring(1));
          return num > max ? num : max;
        }, 0);
        return {
          ...row,
          shelves: [...row.shelves, {
            id: `shelf-${Date.now()}`,
            coord: `${row.letter}${maxNum + 1}`,
            label: "",
            isOpen: false
          }]
        };
      }
      return row;
    }));
  };

  const removeShelf = (rowId, shelfId) => {
    setRows(prev => prev.map(row => {
      if (row.id === rowId) {
        return { ...row, shelves: row.shelves.filter(s => s.id !== shelfId) };
      }
      return row;
    }));
  };


  const openRenameModal = (rowId, shelf) => {
    setActiveShelf({ rowId, shelfId: shelf.id });
    setTempLabel(shelf.label);
    setModalVisible(true);
  };


  const saveLabel = () => {
    setRows(prev => prev.map(row => {
      if (row.id === activeShelf.rowId) {
        return {
          ...row,
          shelves: row.shelves.map(s => s.id === activeShelf.shelfId ? { ...s, label: tempLabel } : s)
        };
      }
      return row;
    }));
    setModalVisible(false);
    setActiveShelf(null);
  };

  const toggleStatus = (rowId, shelfId) => {
    if (isEditMode) return;
    setRows(prev => prev.map(row => {
      if (row.id === rowId) {
        return { ...row, shelves: row.shelves.map(s => s.id === shelfId ? { ...s, isOpen: !s.isOpen } : s) };
      }
      return row;
    }));
  };

  return (
    <SafeAreaView style={styles.container}>

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Label Shelf</Text>
            <TextInput 
              style={styles.modalInput} 
              value={tempLabel} 
              onChangeText={setTempLabel} 
              placeholder="e.g. Resistors, Screws..."
              placeholderTextColor="#666"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveLabel} style={styles.saveBtn}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>


      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)} style={[styles.editBtn, isEditMode && styles.editBtnActive]}>
          <Text style={styles.btnText}>{isEditMode ? "Done" : "Edit"}</Text>
        </TouchableOpacity>
        <View style={styles.rightBtns}>
          <TouchableOpacity onPress={handleRowAction} style={styles.iconBtn}>
            <Ionicons name={isEditMode ? "remove-circle" : "layers"} size={28} color={isEditMode ? "#ff4444" : "#007AFF"} />
          </TouchableOpacity>
          {!isEditMode && (
            <TouchableOpacity onPress={addShelf} style={styles.iconBtn}>
              <Ionicons name="add-circle" size={28} color="#4CAF50" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll}>
        {rows.map(row => (
          <View key={row.id} style={[styles.row, selectedRowId === row.id && styles.activeRow]}>
            <TouchableOpacity onPress={() => setSelectedRowId(row.id)} style={styles.rowLabel}>
              <Text style={styles.rowLetter}>Row {row.letter}</Text>
              {selectedRowId === row.id && <View style={styles.indicator} />} 
            </TouchableOpacity>

            <View style={styles.grid}>
              {row.shelves.map(shelf => (
                <View key={shelf.id} style={styles.shelfWrapper}>
                  <TouchableOpacity 
                    onPress={() => toggleStatus(row.id, shelf.id)}
                    style={[styles.shelf, shelf.isOpen ? styles.shelfOpen : styles.shelfClosed]}
                  >
                  
                    <Text style={styles.coordText}>{shelf.coord}</Text>
                    <Text style={styles.labelText} numberOfLines={1}>{shelf.label || "Empty"}</Text>
                  </TouchableOpacity>
                  
                  {isEditMode && (
                    <>
                      <TouchableOpacity style={styles.deleteBadge} onPress={() => removeShelf(row.id, shelf.id)}>
                        <Ionicons name="remove-circle" size={24} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.editBadge} onPress={() => openRenameModal(row.id, shelf)}>
                        <Ionicons name="search" size={24} color="white" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  modalOverlay: { flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '80%', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#444' },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalInput: { backgroundColor: 'white', color: 'black', padding: 12, borderRadius: 10, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { padding: 9, flex: 1, alignItems: 'center', backgroundColor: '#C62828', borderRadius: 9,},
  saveBtn: { backgroundColor: '#007AFF', padding: 9, flex: 1, borderRadius: 9, alignItems: 'center' },
  

  topBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  editBtn: { paddingVertical: 8, paddingHorizontal: 25, borderRadius: 20, backgroundColor: '#007AFF' },
  editBtnActive: { backgroundColor: '#007AFF' },
  rightBtns: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 20 },
  btnText: { color: 'white', fontWeight: 'bold' },
  scroll: { padding: 10 },
  row: { marginBottom: 30, backgroundColor: '#fff', borderRadius: 20, padding: 15,  borderWidth: 2, borderColor: '#000000', },
  activeRow: { borderWidth: 2, borderColor: '#007AFF' },
  rowLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  rowLetter: { color: '#0000', fontSize: 20, fontWeight: 'bold', marginRight: 10, },
  indicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  shelfWrapper: { position: 'relative', margin: 12 }, 
  shelf: { width: 90, height: 90, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  shelfOpen: { backgroundColor: '#29bb31' }, 
  shelfClosed: { backgroundColor: '#C62828' }, 
  deleteBadge: { position: 'absolute', top: -12, left: -12, backgroundColor: '#ff4444', borderRadius: 15 },
  editBadge: { position: 'absolute', top: -12, right: -12, backgroundColor: '#2196F3', borderRadius: 15 },
  coordText: { color: 'white', fontWeight: 'bold', fontSize: 20 },
  labelText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, marginTop: 4, fontWeight: '600' }
});