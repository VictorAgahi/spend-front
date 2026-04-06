import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Container } from '../../src/components/atoms/Container';
import { Typography } from '../../src/components/atoms/Typography';
import { Button } from '../../src/components/atoms/Button';
import { Card } from '../../src/components/atoms/Card';
import { FilePicker } from '../../src/components/molecules/FilePicker';
import { Toast, ToastType } from '../../src/components/molecules/Toast';
import { colors, spacing } from '../../src/theme';
import * as DocumentPicker from 'expo-document-picker';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { useWebSocket } from '../../src/infra/websocket/useWebSocket';
import { WsEvent } from '../../src/infra/websocket/types';
import { FileService } from '../../src/services/file.service';

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fileUploadData, setFileUploadData] = useState<{ fileId: string; userId: string } | null>(null);

  const handleFilesSelected = (files: DocumentPicker.DocumentPickerAsset[]) => {
    setSelectedFiles(files);
  };

  React.useEffect(() => {
    if (fileUploadData) {
      setToast({
        message: `File ${fileUploadData.fileId} uploaded successfully for user ${fileUploadData.userId}`,
        type: 'success'
      });
    }
  }, [fileUploadData]);

  useWebSocket(WsEvent.FILE_UPLOADED, setFileUploadData);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);



    let uploadTimeout: NodeJS.Timeout;

    const handleFileUploaded = (data: { fileId: string; userId: string }) => {
      setFileUploadData(data);
      clearTimeout(uploadTimeout);
      setToast({
        message: `File(s) uploaded successfully for user ${data.userId}`,
        type: 'success'
      });
      setUploading(false);
    };

    uploadTimeout = setTimeout(() => {
      setToast({
        message: 'File upload timed out. Please try again.',
        type: 'error'
      });
      setUploading(false);
    }, 10000);





    try {
      let filesUploaded = [];
    for (const f of selectedFiles) {
      const file = await FileService.uploadFile(f);
      filesUploaded.push(file);
    }
    } catch (error) {
    setToast({
      message: 'Upload failed. Please try again.',
      type: 'error',
    });
  } finally {
    setToast({
      message: 'Upload process completed.',
      type: 'info',
    });
    setUploading(false);
    setSelectedFiles([]);
  }


  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setSelectedFiles([]);
      setToast(null);
    }, 1000);
  }, []);

  return (
    <Container padding="md">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Animated.View entering={FadeInUp.duration(600).delay(100)}>
          <View style={styles.header}>
            <Typography variant="h1" style={styles.title}>Upload Center</Typography>
            <Typography variant="body" color={colors.textMuted}>
              Manage your receipts and documents securely.
            </Typography>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(200)}>
          <Card variant="flat" padding="lg" style={styles.infoCard}>
            <Typography variant="h3" color={colors.white} style={styles.infoTitle}>Requirements</Typography>
            <View style={styles.requirementItem}>
              <View style={styles.dot} />
              <Typography variant="caption" color={colors.textMuted}>Max file size: 40MB</Typography>
            </View>
            <View style={styles.requirementItem}>
              <View style={styles.dot} />
              <Typography variant="caption" color={colors.textMuted}>Supported: PNG, JPG, PDF</Typography>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(300)}>
          <FilePicker onFilesSelected={handleFilesSelected} maxSizeMB={40} />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(600).delay(400)}
          layout={Layout.springify()}
        >
          {selectedFiles.length > 0 && (
            <View style={styles.footer}>
              <Button
                label={`Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
                onPress={handleUpload}
                variant="primary"
                loading={uploading}
                fullWidth
              />
              <Button
                label="Clear All"
                onPress={() => setSelectedFiles([])}
                variant="ghost"
                disabled={uploading}
                fullWidth
                style={styles.clearBtn}
              />
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 42,
    lineHeight: 48,
    marginBottom: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.surfaceLight + '20',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border + '50',
  },
  infoTitle: {
    marginBottom: spacing.sm,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  clearBtn: {
    marginTop: spacing.sm,
  },
});
