import * as DocumentPicker from 'expo-document-picker';
import { UploadFileResponse } from '../types/file.types';
import { api } from './api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FileService = {
  async uploadFile(file: DocumentPicker.DocumentPickerAsset): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'image/jpeg',
    } as any);

    const token = await AsyncStorage.getItem('accessToken');

    try {
      console.log('Uploading file:', file);

      const { data } = await api.post<UploadFileResponse>('/files/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Upload successful:', data);
      return data;
    } catch (error) {
      console.error('Upload failed:', error.response?.data || error.message);
      throw error;
    }
  },
};
