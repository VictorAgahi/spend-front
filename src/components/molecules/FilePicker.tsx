import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, X, FileText, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { colors, spacing } from '../../theme';
import { Typography } from '../atoms/Typography';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';

interface FilePickerProps {
  onFilesSelected: (files: DocumentPicker.DocumentPickerAsset[]) => void;
  maxSizeMB?: number;
}

export const FilePicker: React.FC<FilePickerProps> = ({ 
  onFilesSelected,
  maxSizeMB = 40 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        multiple: true,
      });

      if (!result.canceled) {
        const newFiles = result.assets.filter(file => {
          const fileSizeMB = (file.size || 0) / (1024 * 1024);
          if (fileSizeMB > maxSizeMB) {
            setError(`File ${file.name} exceeds ${maxSizeMB}MB limit`);
            return false;
          }
          return true;
        });

        const updatedFiles = [...selectedFiles, ...newFiles];
        setSelectedFiles(updatedFiles);
        onFilesSelected(updatedFiles);
        if (newFiles.length > 0) setError(null);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      setError('Failed to pick document');
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dropZone} 
        onPress={pickDocument}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Upload size={32} color={colors.primary} />
        </View>
        <Typography variant="h3" style={styles.title}>Click to select files</Typography>
        <Typography variant="caption" color={colors.textMuted} style={styles.subtitle}>
          PNG, JPG, PDF up to {maxSizeMB}MB
        </Typography>
      </TouchableOpacity>

      {error && (
        <Typography variant="caption" color={colors.error} style={styles.error}>
          {error}
        </Typography>
      )}

      {selectedFiles.length > 0 && (
        <View style={styles.fileListContainer}>
          <Typography variant="h3" style={styles.listTitle}>Selected Files ({selectedFiles.length})</Typography>
          <ScrollView style={styles.fileList} showsVerticalScrollIndicator={false}>
            {selectedFiles.map((file, index) => (
              <Card key={`${file.uri}-${index}`} variant="flat" padding="md" style={styles.fileItem}>
                <View style={styles.fileInfo}>
                  {file.mimeType?.startsWith('image/') ? (
                    <Image source={{ uri: file.uri }} style={styles.thumbnail} />
                  ) : (
                    <View style={styles.fileIconPlaceholder}>
                      <FileText size={20} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.textContent}>
                    <Typography variant="body" numberOfLines={1} style={styles.fileName}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color={colors.textMuted}>
                      {formatSize(file.size || 0)}
                    </Typography>
                  </View>
                </View>
                <TouchableOpacity onPress={() => removeFile(index)} style={styles.removeButton}>
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              </Card>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dropZone: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginTop: 4,
  },
  error: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  fileListContainer: {
    marginTop: spacing.md,
  },
  listTitle: {
    marginBottom: spacing.md,
  },
  fileList: {
    maxHeight: 300,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  fileIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContent: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    padding: spacing.sm,
  },
});
