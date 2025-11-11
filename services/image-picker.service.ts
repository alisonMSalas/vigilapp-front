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
          fileSize: asset.fileSize,
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
          fileSize: asset.fileSize,
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
   * Pick multiple images/videos from gallery for evidence
   *
   * @param maxFiles - Maximum number of files to select (default: 5)
   * @param maxSizeMB - Maximum file size in MB per file (default: 10MB)
   * @returns Result with selected files or error
   */
  async pickMultipleMedia(
    maxFiles: number = 5,
    maxSizeMB: number = 10
  ): Promise<{ success: boolean; files?: ImageAsset[]; error?: string }> {
    try {
      // Verify permissions
      const hasPermission = await this.requestGalleryPermission();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Se requieren permisos de galería para continuar',
        };
      }

      // Open gallery with multiple selection
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
        videoMaxDuration: 30, // Maximum 30 seconds of video
        selectionLimit: maxFiles, // Limit selection
      });

      if (result.canceled) {
        return {
          success: false,
          error: 'Selección cancelada',
        };
      }

      // Limit number of files
      const assets = result.assets.slice(0, maxFiles);

      // Validate file sizes
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const oversizedFiles: string[] = [];

      // Map to ImageAsset and validate sizes
      const files: ImageAsset[] = assets
        .map((asset, index) => {
          const fileSize = asset.fileSize || 0;
          const fileName = asset.type === 'video'
            ? `video_${Date.now()}_${index}.mp4`
            : `image_${Date.now()}_${index}.jpg`;

          // Check if file exceeds max size
          if (fileSize > maxSizeBytes) {
            const sizeMB = (fileSize / (1024 * 1024)).toFixed(1);
            oversizedFiles.push(`${fileName} (${sizeMB}MB)`);
            return null;
          }

          return {
            uri: asset.uri,
            type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
            name: fileName,
            fileSize,
          };
        })
        .filter((file): file is ImageAsset => file !== null);

      // If there are oversized files, return error
      if (oversizedFiles.length > 0) {
        return {
          success: false,
          error: `Los siguientes archivos exceden el tamaño máximo de ${maxSizeMB}MB:\n${oversizedFiles.join('\n')}\n\nPor favor, selecciona archivos más pequeños.`,
        };
      }

      // Calculate total size
      const totalSizeMB = files.reduce((sum, file) => sum + (file.fileSize || 0), 0) / (1024 * 1024);
      console.log(`[ImagePickerService] ✅ ${files.length} files selected (${totalSizeMB.toFixed(2)}MB total)`);

      return {
        success: true,
        files,
      };
    } catch (error) {
      console.error('[ImagePickerService] Error picking multiple media:', error);
      return {
        success: false,
        error: 'Error al seleccionar archivos',
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
