// server/models/Admin.js
const Admin = sequelize.define('admin', {
  // Make sure these names match your MySQL columns!
  full_name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, primaryKey: true }, // or whatever your PK is
  password: { type: DataTypes.STRING }
}, {
  timestamps: false // If you don't have createdAt/updatedAt columns
});