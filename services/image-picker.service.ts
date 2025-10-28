/**
 * Servicio para selección y manejo de imágenes
 * Utiliza expo-image-picker para acceder a la galería y cámara
 */

import * as ImagePicker from 'expo-image-picker';
import { ImageAsset } from './types/auth.types';

export interface ImagePickerResult {
  success: boolean;
  image?: ImageAsset;
  error?: string;
}

class ImagePickerService {
  /**
   * Solicitar permisos de cámara
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[ImagePickerService] Error requesting camera permission:', error);
      return false;
    }
  }

  /**
   * Solicitar permisos de galería
   */
  async requestGalleryPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[ImagePickerService] Error requesting gallery permission:', error);
      return false;
    }
  }

  /**
   * Tomar foto con la cámara
   */
  async takePhoto(): Promise<ImagePickerResult> {
    try {
      // Verificar permisos
      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Se requieren permisos de cámara para continuar',
        };
      }

      // Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return {
          success: false,
          error: 'Captura cancelada',
        };
      }

      const asset = result.assets[0];
      return {
        success: true,
        image: {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: `photo_${Date.now()}.jpg`,
        },
      };
    } catch (error) {
      console.error('[ImagePickerService] Error taking photo:', error);
      return {
        success: false,
        error: 'Error al tomar la foto',
      };
    }
  }

  /**
   * Seleccionar imagen de la galería
   */
  async pickFromGallery(): Promise<ImagePickerResult> {
    try {
      // Verificar permisos
      const hasPermission = await this.requestGalleryPermission();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Se requieren permisos de galería para continuar',
        };
      }

      // Abrir galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return {
          success: false,
          error: 'Selección cancelada',
        };
      }

      const asset = result.assets[0];
      return {
        success: true,
        image: {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: `image_${Date.now()}.jpg`,
        },
      };
    } catch (error) {
      console.error('[ImagePickerService] Error picking from gallery:', error);
      return {
        success: false,
        error: 'Error al seleccionar la imagen',
      };
    }
  }

  /**
   * Mostrar menú de opciones para elegir entre cámara o galería
   * (Implementación básica, en producción usar ActionSheet nativo)
   */
  async showImageSourceSelector(): Promise<'camera' | 'gallery' | null> {
    // Esta es una implementación simplificada
    // En producción, deberías usar un componente de UI como ActionSheet
    // Por ahora retorna null y dejas que el componente maneje la lógica
    return null;
  }
}

// Exportar instancia singleton
export const imagePickerService = new ImagePickerService();
export default imagePickerService;
