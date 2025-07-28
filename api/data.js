import mongoose from 'mongoose';

const uri = "mongodb+srv://erarjunsingh32085:123@cluster0.zvimsjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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

const StandeeOrder = mongoose.models.StandeeOrder || mongoose.model('StandeeOrder', standeeOrderSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}

// 👇 Export GET function as per Vercel standard
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET method allowed' });
  }

  try {
    await connectDB();
    const orders = await StandeeOrder.find().sort({ created_at: -1 });

    const formatted = orders.map(order => ({
      name: order.name,
      phone: order.phone,
      standee_type: order.standee_type,
      icons_selected: order.icons_selected,
      other_icons: order.other_icons,
      logo_url: order.logo_url,
      upi_qr_url: order.upi_qr_url,
      created_at: order.created_at,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error('[GET /api/data]', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
