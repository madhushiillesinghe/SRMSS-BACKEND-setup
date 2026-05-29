// repositories/admin.repository.js
const { Admin } = require("../models");

const findAdminByUsername = async (username) => {
    return await Admin.findOne({ where: { username } });
};

const findAdminByEmail = async (email) => {
    return await Admin.findOne({ where: { email } });
};

// WITHOUT password (for profile, middleware)
const findAdminById = async (id) => {
    return await Admin.findByPk(id, {
        attributes: { exclude: ["password"] }
    });
};

// WITH password (for login, password change)
const findAdminByIdWithPassword = async (id) => {
    return await Admin.findByPk(id);
};

const createAdmin = async (data) => {
    return await Admin.create(data);
};

const updateAdminLastLogin = async (id, lastLogin) => {
    return await Admin.update({ last_login: lastLogin }, { where: { admin_id: id } });
};

const updateAdminPassword = async (id, hashedPassword) => {
    return await Admin.update({ password: hashedPassword }, { where: { admin_id: id } });
};

const findAllAdmins = async () => {
    return await Admin.findAll({
        attributes: { exclude: ["password"] },
        order: [["created_at", "DESC"]]
    });
};

const updateAdminStatus = async (id, status) => {
    return await Admin.update({ status }, { where: { admin_id: id } });
};

const deleteAdmin = async (id) => {
    return await Admin.destroy({ where: { admin_id: id } });
};

module.exports = {
    findAdminByUsername,
    findAdminByEmail,
    findAdminById,
    findAdminByIdWithPassword,
    createAdmin,
    updateAdminLastLogin,
    updateAdminPassword,
    findAllAdmins,
    updateAdminStatus,
    deleteAdmin
};