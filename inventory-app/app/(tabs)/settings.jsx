import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Using Expo Router for navigation
import { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- ACTIONS ---
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: () => {
          // Navigates back to the root login screen
          router.replace('/login'); 
        } 
      }
    ]);
  };

  const navigateToHierarchy = () => {
    // Navigates to the hierarchy screen we built earlier
    router.push('/adminDashboard'); 
  };

  const handleSecurityAction = (title) => {
    Alert.alert(title, `The ${title.toLowerCase()} feature has been triggered for your account.`);
  };

  // --- UI COMPONENTS ---
  const SettingItem = ({ icon, label, value, type, onPress, color = "#000" }) => (
    <TouchableOpacity 
      style={[styles.settingCard, type === 'danger' && styles.dangerCard]} 
      onPress={onPress}
      disabled={type === 'switch'}
    >
      <View style={[styles.iconBox, { backgroundColor: type === 'danger' ? '#fee' : '#f0f7ff' }]}>
        <Ionicons name={icon} size={22} color={type === 'danger' ? '#C62828' : '#007AFF'} />
      </View>
      
      <Text style={[styles.label, { color: type === 'danger' ? '#C62828' : '#000' }]}>{label}</Text>

      {type === 'switch' ? (
        <Switch
          trackColor={{ false: "#eee", true: "#007AFF" }}
          thumbColor={"#fff"}
          onValueChange={onPress}
          value={value}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={type === 'danger' ? '#C62828' : "#ccc"} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* PROFILE SECTION - Updated to Albi */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Albi</Text>
            <Text style={styles.profileTag}>@albi_admin</Text>
          </View>
          <TouchableOpacity 
            style={styles.editProfileBtn}
            onPress={() => Alert.alert("Profile", "Edit profile coming soon!")}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* HIERARCHY BUTTON - NEW */}
        <Text style={styles.sectionTitle}>Organization</Text>
        <SettingItem 
          icon="people-circle-outline" 
          label="Team Hierarchy" 
          onPress={navigateToHierarchy} 
        />

        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingItem 
          icon="notifications-outline" 
          label="Push Notifications" 
          type="switch" 
          value={notifications} 
          onPress={() => setNotifications(!notifications)} 
        />
        <SettingItem 
          icon="eye-outline" 
          label="Public Profile" 
          type="switch" 
          value={publicProfile} 
          onPress={() => setPublicProfile(!publicProfile)} 
        />

        <Text style={styles.sectionTitle}>Account & Security</Text>
        <SettingItem 
          icon="key-outline" 
          label="Change Password" 
          onPress={() => handleSecurityAction("Change Password")} 
        />
        <SettingItem 
          icon="shield-checkmark-outline" 
          label="Privacy Policy" 
          onPress={() => Alert.alert("Privacy", "Our privacy policy is standard.")} 
        />
        
        <View style={{ marginTop: 25 }}>
          <SettingItem 
            icon="log-out-outline" 
            label="Logout" 
            type="danger" 
            onPress={handleLogout} 
          />
        </View>

        <Text style={styles.versionText}>Version 1.0.4 • 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  topBar: { padding: 20, paddingTop: 10 },
  scroll: { paddingHorizontal: 20 },

  // Profile Header Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000',
    marginBottom: 25,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  profileInfo: { flex: 1, marginLeft: 15 },
  profileName: { fontSize: 18, fontWeight: 'bold' },
  profileTag: { color: '#666', fontSize: 14 },
  editProfileBtn: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  editBtnText: { fontWeight: '700', fontSize: 13, color: '#007AFF' },

  // Settings Items
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 5,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#000',
    marginBottom: 12,
  },
  dangerCard: {
    borderColor: '#C62828',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    color: '#ddd',
    fontSize: 12,
    marginTop: 30,
    fontWeight: '600'
  }
});