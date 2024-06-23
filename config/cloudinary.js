import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.v2.config({
  cloud_name: 'dimdv1umm',
  api_key: '298367857295941',
  api_secret: 'C1fjaW3Rwrc11sT5mHupmKUtSac',
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req, file) => {
    let folder = 'default';
    if (file.fieldname === 'criminalRecord') folder = 'criminal_records';
    if (file.fieldname === 'logoImage') folder = 'logo_images';
    if (file.fieldname === 'image') folder = 'citizen_images';
    return {
      folder: folder,
      resource_type: 'auto', 
    };
  },
});

const upload = multer({ storage: storage });

export { cloudinary, upload };
