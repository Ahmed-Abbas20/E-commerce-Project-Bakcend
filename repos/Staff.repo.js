const Staff = require('../models/staff.model');

exports.isSuperAdmin = (userId) => Staff.findOne({ _id: userId, role: 'super_admin' });