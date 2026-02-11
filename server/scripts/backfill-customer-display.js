/**
 * Mevcut siparişlerde customerInfo şifresini çözüp customerInfoDisplay alanını doldurur.
 * Böylece admin panelde müşteri bilgileri görünür (şifre çözülemezse bile display varsa gösterilir).
 * Kullanım: node server/scripts/backfill-customer-display.js
 * .env içinde ENCRYPTION_KEY doğru olmalı.
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import Order from '../models/OrderSchema.js';
import { decryptSensitiveFields } from '../utils/encryption.js';

async function main() {
  await connectDB();
  const orders = await Order.find({}).lean();
  let updated = 0;
  let skipped = 0;
  for (const order of orders) {
    if (order.customerInfoDisplay?.email) {
      skipped++;
      continue;
    }
    try {
      const decrypted = decryptSensitiveFields(order);
      const ci = decrypted?.customerInfo;
      if (!ci || (!ci.email && !ci.address)) continue;
      const display = {
        firstName: String(ci.firstName ?? '').trim(),
        lastName: String(ci.lastName ?? '').trim(),
        email: String(ci.email ?? '').trim(),
        phone: String(ci.phone ?? '').trim(),
        address: String(ci.address ?? '').trim()
      };
      if (!display.email && !display.address) continue;
      await Order.updateOne(
        { _id: order._id },
        { $set: { customerInfoDisplay: display } }
      );
      updated++;
      console.log('Güncellendi:', order._id, display.email || '(email yok)');
    } catch (e) {
      console.warn('Atlandı', order._id, e.message);
    }
  }
  console.log('Bitti. Güncellenen:', updated, ', Zaten dolu atlanan:', skipped);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
