import * as ImagePicker from 'expo-image-picker';
import imagePickerService from '../image-picker.service';

// Mock expo-image-picker
jest.mock('expo-image-picker');

describe('ImagePickerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestCameraPermission', () => {
    it('should return true when permission is granted', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await imagePickerService.requestCameraPermission();
      expect(result).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await imagePickerService.requestCameraPermission();
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission error')
      );

      const result = await imagePickerService.requestCameraPermission();
      expect(result).toBe(false);
    });
  });

  describe('requestGalleryPermission', () => {
    it('should return true when permission is granted', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await imagePickerService.requestGalleryPermission();
      expect(result).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await imagePickerService.requestGalleryPermission();
      expect(result).toBe(false);
    });
  });

  describe('takePhoto', () => {
    it('should return error if camera permission is denied', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await imagePickerService.takePhoto();
      expect(result.success).toBe(false);
      expect(result.error).toContain('permisos de cámara');
    });

    it('should return image when photo is taken successfully', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{
          uri: 'file://photo.jpg',
          width: 800,
          height: 600,
          type: 'image',
        }],
      });

      const result = await imagePickerService.takePhoto();
      expect(result.success).toBe(true);
      expect(result.image).toBeDefined();
      expect(result.image?.uri).toBe('file://photo.jpg');
    });

    it('should return error when user cancels', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await imagePickerService.takePhoto();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Captura cancelada');
    });
  });

  describe('pickFromGallery', () => {
    it('should return error if gallery permission is denied', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await imagePickerService.pickFromGallery();
      expect(result.success).toBe(false);
      expect(result.error).toContain('permisos de galería');
    });

    it('should return image when photo is selected successfully', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{
          uri: 'file://gallery-photo.jpg',
          width: 1920,
          height: 1080,
          type: 'image',
        }],
      });

      const result = await imagePickerService.pickFromGallery();
      expect(result.success).toBe(true);
      expect(result.image).toBeDefined();
      expect(result.image?.uri).toBe('file://gallery-photo.jpg');
    });

    it('should return error when user cancels gallery selection', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await imagePickerService.pickFromGallery();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Selección cancelada');
    });

    it('should handle large images', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{
          uri: 'file://large-image.jpg',
          width: 4000,
          height: 3000,
          type: 'image',
          fileSize: 5000000,
        }],
      });

      const result = await imagePickerService.pickFromGallery();
      expect(result.success).toBe(true);
      expect(result.image).toBeDefined();
    });

    it('should handle different image formats', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{
          uri: 'file://image.png',
          width: 800,
          height: 600,
          type: 'image',
        }],
      });

      const result = await imagePickerService.pickFromGallery();
      expect(result.success).toBe(true);
    });
  });

  describe('Additional camera scenarios', () => {
    it('should handle camera launch errors', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockRejectedValue(
        new Error('Camera error')
      );

      const result = await imagePickerService.takePhoto();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle photo with different dimensions', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{
          uri: 'file://square.jpg',
          width: 1000,
          height: 1000,
          type: 'image',
        }],
      });

      const result = await imagePickerService.takePhoto();
      expect(result.success).toBe(true);
      expect(result.image?.width).toBe(1000);
    });

    it('should handle portrait orientation', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{
          uri: 'file://portrait.jpg',
          width: 600,
          height: 800,
          type: 'image',
        }],
      });

      const result = await imagePickerService.takePhoto();
      expect(result.success).toBe(true);
    });

    it('should handle landscape orientation', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{
          uri: 'file://landscape.jpg',
          width: 1920,
          height: 1080,
          type: 'image',
        }],
      });

      const result = await imagePickerService.takePhoto();
      expect(result.success).toBe(true);
    });
  });

  describe('Gallery edge cases', () => {
    it('should handle gallery launch errors', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockRejectedValue(
        new Error('Gallery error')
      );

      const result = await imagePickerService.pickFromGallery();
      expect(result.success).toBe(false);
    });

    it('should handle multiple image selection (single result)', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{
          uri: 'file://image1.jpg',
          width: 800,
          height: 600,
          type: 'image',
        }],
      });

      const result = await imagePickerService.pickFromGallery();
      expect(result.success).toBe(true);
    });

    it('should handle no assets returned', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [],
      });

      const result = await imagePickerService.pickFromGallery();
      expect(result.success).toBe(false);
    });

    it('should handle undefined assets', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
      });

      const result = await imagePickerService.pickFromGallery();
      expect(result.success).toBe(false);
    });
  });

  describe('Permission edge cases', () => {
    it('should handle camera permission request errors', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('System error')
      );

      const result = await imagePickerService.requestCameraPermission();
      expect(result).toBe(false);
    });

    it('should handle gallery permission request errors', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('System error')
      );

      const result = await imagePickerService.requestGalleryPermission();
      expect(result).toBe(false);
    });

    it('should handle undetermined permission status for camera', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      const result = await imagePickerService.requestCameraPermission();
      expect(result).toBe(false);
    });

    it('should handle undetermined permission status for gallery', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      const result = await imagePickerService.requestGalleryPermission();
      expect(result).toBe(false);
    });
  });

  describe('pickMultipleMedia', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully pick multiple images', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///image1.jpg',
            type: 'image',
            fileSize: 1024 * 1024, // 1MB
          },
          {
            uri: 'file:///image2.jpg',
            type: 'image',
            fileSize: 2 * 1024 * 1024, // 2MB
          },
        ],
      });

      const result = await imagePickerService.pickMultipleMedia();
      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(2);
      expect(result.files![0].type).toBe('image/jpeg');
    });

    it('should handle permission denial', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await imagePickerService.pickMultipleMedia();
      expect(result.success).toBe(false);
      expect(result.error).toContain('permisos');
    });

    it('should handle cancellation', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await imagePickerService.pickMultipleMedia();
      expect(result.success).toBe(false);
      expect(result.error).toContain('cancelada');
    });

    it('should limit number of files to maxFiles', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      const mockAssets = Array.from({ length: 10 }, (_, i) => ({
        uri: `file:///image${i}.jpg`,
        type: 'image',
        fileSize: 1024 * 1024,
      }));
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: mockAssets,
      });

      const result = await imagePickerService.pickMultipleMedia(3);
      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(3);
    });

    it('should reject files exceeding maxSizeMB', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///large.jpg',
            type: 'image',
            fileSize: 15 * 1024 * 1024, // 15MB (excede el límite de 10MB)
          },
        ],
      });

      const result = await imagePickerService.pickMultipleMedia(5, 10);
      expect(result.success).toBe(false);
      expect(result.error).toContain('exceden el tamaño máximo');
      expect(result.error).toContain('15.0MB');
    });

    it('should filter out oversized files and return only valid ones', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///small.jpg',
            type: 'image',
            fileSize: 2 * 1024 * 1024, // 2MB
          },
          {
            uri: 'file:///large.jpg',
            type: 'image',
            fileSize: 15 * 1024 * 1024, // 15MB (excede)
          },
        ],
      });

      const result = await imagePickerService.pickMultipleMedia(5, 10);
      expect(result.success).toBe(false);
      expect(result.error).toContain('exceden el tamaño máximo');
    });

    it('should handle video files', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///video.mp4',
            type: 'video',
            fileSize: 5 * 1024 * 1024, // 5MB
          },
        ],
      });

      const result = await imagePickerService.pickMultipleMedia();
      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
      expect(result.files![0].type).toBe('video/mp4');
      expect(result.files![0].name).toContain('video_');
    });

    it('should handle mixed images and videos', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///image.jpg',
            type: 'image',
            fileSize: 1024 * 1024,
          },
          {
            uri: 'file:///video.mp4',
            type: 'video',
            fileSize: 3 * 1024 * 1024,
          },
        ],
      });

      const result = await imagePickerService.pickMultipleMedia();
      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(2);
      expect(result.files![0].type).toBe('image/jpeg');
      expect(result.files![1].type).toBe('video/mp4');
    });

    it('should handle assets without fileSize', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///image.jpg',
            type: 'image',
            // Sin fileSize
          },
        ],
      });

      const result = await imagePickerService.pickMultipleMedia();
      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
      expect(result.files![0].fileSize).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission error')
      );

      const result = await imagePickerService.pickMultipleMedia();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Error');
    });

    it('should use custom maxFiles parameter', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          { uri: 'file:///1.jpg', type: 'image', fileSize: 1024 * 1024 },
          { uri: 'file:///2.jpg', type: 'image', fileSize: 1024 * 1024 },
          { uri: 'file:///3.jpg', type: 'image', fileSize: 1024 * 1024 },
        ],
      });

      const result = await imagePickerService.pickMultipleMedia(2);
      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(2);
    });

    it('should use custom maxSizeMB parameter', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///large.jpg',
            type: 'image',
            fileSize: 3 * 1024 * 1024, // 3MB
          },
        ],
      });

      // maxSizeMB = 2, entonces 3MB excede
      const result = await imagePickerService.pickMultipleMedia(5, 2);
      expect(result.success).toBe(false);
      expect(result.error).toContain('exceden el tamaño máximo de 2MB');
    });

    it('should generate unique filenames with timestamps', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///image1.jpg',
            type: 'image',
            fileSize: 1024 * 1024,
          },
          {
            uri: 'file:///image2.jpg',
            type: 'image',
            fileSize: 1024 * 1024,
          },
        ],
      });

      const result = await imagePickerService.pickMultipleMedia();
      expect(result.success).toBe(true);
      expect(result.files![0].name).toMatch(/image_\d+_0\.jpg/);
      expect(result.files![1].name).toMatch(/image_\d+_1\.jpg/);
    });
  });

  describe('showImageSourceSelector', () => {
    it('should return null (basic implementation)', async () => {
      const result = await imagePickerService.showImageSourceSelector();
      expect(result).toBeNull();
    });
  });
});
