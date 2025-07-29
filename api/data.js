import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://erarjunsingh32085:123@cluster0.zvimsjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function connectDB() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db('bharattapp');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET method allowed' });
  }

  try {
    const db = await connectDB();
    const collection = db.collection('standee_orders');

    const orders = await collection
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    const formatted = orders.map(order => ({
      name: order.name,
      phone: order.phone,
      standee_type: order.standee_type,
      icons_selected: order.icons_selected || [],
      other_icons: order.other_icons || '',
      logo_url: order.logo_url || null,
      upi_qr_url: order.upi_qr_url || null,
      created_at: order.created_at,
    }));

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error('[GET /api/data]', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
