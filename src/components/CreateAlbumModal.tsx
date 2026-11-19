import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSettings } from '@/context/SettingsContext';
import { GlassView } from './GlassView';
import { FolderPlus, X } from 'lucide-react-native';

interface CreateAlbumModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export function CreateAlbumModal({ visible, onClose, onCreate }: CreateAlbumModalProps) {
  const { colors, haptics } = useSettings();
  const [albumName, setAlbumName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!albumName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onCreate(albumName.trim());
    setIsSubmitting(false);
    setAlbumName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContainer}>
          <GlassView
            intensity={50}
            borderRadius={28}
            style={[styles.glassCard, { borderColor: colors.borderGlow }]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(10, 132, 255, 0.18)' }]}>
                <FolderPlus size={24} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Nuevo Álbum</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                Crea una carpeta en tu dispositivo y asigna el elemento actual
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Input */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nombre del álbum (ej. Vacaciones, Recibos)"
                placeholderTextColor={colors.textMuted}
                value={albumName}
                onChangeText={setAlbumName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            {/* Acciones */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => {
                  haptics.selection();
                  onClose();
                }}
                style={[styles.cancelBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!albumName.trim() || isSubmitting}
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor: albumName.trim() ? colors.primary : colors.surfaceSubtle,
                    opacity: albumName.trim() ? 1 : 0.6,
                  },
                ]}
              >
                <Text style={styles.submitBtnText}>
                  {isSubmitting ? 'Creando...' : 'Crear y Asignar'}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
  },
  glassCard: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
    marginBottom: 20,
  },
  input: {
    fontSize: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1.4,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
