import { IncomingForm } from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

// Disable Next.js's default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dihstpdcn',
  api_key: '248125376569948',
  api_secret: 'lmG-CCfd1NjxpWoNDJv-V6Ws4MU',
});

// MongoDB URI
const MONGO_URI = "mongodb+srv://erarjunsingh32085:123@cluster0.zvimsjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB schema
const standeeOrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, match: /^\d{10}$/ },
  standee_type: { type: String, required: true },
  icons_selected: { type: [String], default: [] },
  other_icons: { type: String, default: '' },
  logo_url: { type: String, required: true },
  upi_qr_url: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});

// Prevent model overwrite on hot-reload
const StandeeOrder = mongoose.models.StandeeOrder || mongoose.model('StandeeOrder', standeeOrderSchema);

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}

// Parse multipart form data
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ keepExtensions: true, maxFileSize: 5 * 1024 * 1024 });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// Main handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    await connectDB();

    const { fields, files } = await parseForm(req);

    const { name, phone, standee_type, icons_selected = '', other_icons = '' } = fields;
    const logo = files.logo;
    const upiQR = files.upi_qr;

    // Validations
    if (!name || !phone || !standee_type || !logo) {
      return res.status(400).json({ success: false, message: 'Required fields are missing' });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must be 10 digits' });
    }

    // Upload logo
    const logoUpload = await cloudinary.uploader.upload(logo.filepath, {
      folder: 'standee_app',
    });

    // Upload UPI QR if available
    let upiQRUrl = null;
    if (upiQR) {
      const upiUpload = await cloudinary.uploader.upload(upiQR.filepath, {
        folder: 'standee_app/upi_qr',
      });
      upiQRUrl = upiUpload.secure_url;
    }

    // Create new document
    const newOrder = new StandeeOrder({
      name,
      phone,
      standee_type,
      icons_selected: icons_selected.split(','),
      other_icons,
      logo_url: logoUpload.secure_url,
      upi_qr_url: upiQRUrl,
    });

    await newOrder.save();

    res.status(200).json({ success: true, message: 'Order submitted successfully.' });
  } catch (err) {
    console.error('[Submit API Error]', err);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
}
