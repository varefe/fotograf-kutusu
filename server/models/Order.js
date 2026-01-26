import { DataTypes } from 'sequelize';
import { encryptSensitiveFields, decryptSensitiveFields } from '../utils/encryption.js';

// Order Model - sequelize instance'ı parametre olarak alır
export const defineOrder = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // Geriye uyumluluk için photo'yu JSONB olarak sakla
    photo: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    // Birden fazla fotoğraf desteği - JSONB array
    photos: {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: false
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customSize: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    frameType: {
      type: DataTypes.STRING,
      defaultValue: 'standard'
    },
    paperType: {
      type: DataTypes.STRING,
      defaultValue: 'glossy'
    },
    colorMode: {
      type: DataTypes.STRING,
      defaultValue: 'color'
    },
    shippingType: {
      type: DataTypes.STRING,
      defaultValue: 'standard'
    },
    // Müşteri bilgileri - JSONB (şifrelenmiş)
    customerInfo: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Yeni'
    },
    paymentStatus: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isEncrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    orderGroupId: {
      type: DataTypes.STRING,
      allowNull: true,
      index: true
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    hooks: {
      beforeCreate: async (order) => {
        // Hassas bilgileri şifrele
        const orderData = {
          photo: order.photo,
          photos: order.photos || [],
          customerInfo: order.customerInfo,
          notes: order.notes
        };
        
        const encryptedData = encryptSensitiveFields(orderData);
        
        if (encryptedData.photo) {
          order.photo = encryptedData.photo;
        }
        if (encryptedData.photos) {
          order.photos = encryptedData.photos;
        }
        if (encryptedData.customerInfo) {
          order.customerInfo = encryptedData.customerInfo;
        }
        if (encryptedData.notes !== undefined) {
          order.notes = encryptedData.notes;
        }
        
        order.isEncrypted = true;
      },
      beforeUpdate: async (order) => {
        // Eğer hassas alanlar değiştiyse şifrele
        const hasPhotoChanges = order.changed('photo') || order.changed('photos');
        if (hasPhotoChanges || order.changed('customerInfo') || order.changed('notes')) {
          const orderData = {
            photo: order.photo,
            photos: order.photos || [],
            customerInfo: order.customerInfo,
            notes: order.notes
          };
          
          const encryptedData = encryptSensitiveFields(orderData);
          
          if (encryptedData.photo) {
            order.photo = encryptedData.photo;
          }
          if (encryptedData.photos) {
            order.photos = encryptedData.photos;
          }
          if (encryptedData.customerInfo) {
            order.customerInfo = encryptedData.customerInfo;
          }
          if (encryptedData.notes !== undefined) {
            order.notes = encryptedData.notes;
          }
          
          order.isEncrypted = true;
        }
      }
    }
  });

  // Order formatOrder metodu (admin için decrypt)
  Order.formatOrder = (order, isAdmin = false) => {
    try {
      // Admin ise şifreleri çöz
      if (isAdmin) {
        const decrypted = decryptSensitiveFields({
          photo: order.photo,
          photos: order.photos || [],
          customerInfo: order.customerInfo,
          notes: order.notes
        });
        
        return {
          ...order,
          photo: decrypted.photo,
          photos: decrypted.photos || [],
          customerInfo: decrypted.customerInfo,
          notes: decrypted.notes,
          id: order.id || order._id,
          _id: order.id || order._id
        };
      }
      
      // Normal kullanıcı için hassas bilgileri gizle
      return {
        ...order,
        photo: null,
        photos: [],
        customerInfo: {
          email: order.customerInfo?.email ? '***' : undefined
        },
        notes: null,
        id: order.id || order._id,
        _id: order.id || order._id
      };
    } catch (error) {
      console.error('formatOrder hatası:', error);
      return {
        ...order,
        id: order.id || order._id,
        _id: order.id || order._id
      };
    }
  };

  return Order;
};
