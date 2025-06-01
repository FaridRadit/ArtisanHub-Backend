import DeviceToken from "../Database/Table/DeviceToken.js";
import Notification from "../Database/Table/Notification.js";
import { Op } from "sequelize";

/**
 * @swagger
 * tags:
 * name: Notifikasi
 * description: Manajemen notifikasi dan device token pengguna
 */

/**
 * @swagger
 * /notifications/register-token:
 * post:
 * summary: Mendaftarkan atau memperbarui device token pengguna untuk notifikasi push
 * tags: [Notifikasi]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - device_token
 * - platform
 * properties:
 * device_token: { type: 'string', example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' }
 * platform: { type: 'string', enum: ['android', 'ios'], example: 'android' }
 * responses:
 * 200:
 * description: Device token berhasil diperbarui.
 * content:
 * application/json:
 * schema: { type: 'object', properties: { message: { type: 'string', example: 'Device token updated successfully.' } } }
 * 201:
 * description: Device token berhasil didaftarkan.
 * content:
 * application/json:
 * schema: { type: 'object', properties: { message: { type: 'string', example: 'Device token registered successfully.' } } }
 * 400:
 * description: Input tidak valid.
 * 401:
 * description: Token tidak disediakan atau kadaluarsa.
 * 403:
 * description: Gagal mengautentikasi token.
 * 500:
 * description: Server error.
 */
async function registerDeviceToken(req, res) {
    try {
        const userId = req.user.id;
        const { device_token, platform } = req.body;

        if (!device_token || !platform) {
            return res.status(400).json({ message: "Device token and platform are required." });
        }
        if (!['android', 'ios'].includes(platform)) {
            return res.status(400).json({ message: "Invalid platform. Must be 'android' or 'ios'." });
        }

        const [deviceTokenRecord, created] = await DeviceToken.findOrCreate({
            where: { user_id: userId, platform: platform, device_token: device_token },
            defaults: {
                user_id: userId,
                device_token: device_token,
                platform: platform,
                last_used_at: new Date()
            }
        });

        if (!created && deviceTokenRecord.device_token === device_token) {
            await deviceTokenRecord.update({ last_used_at: new Date() });
            return res.status(200).json({ message: "Device token updated successfully." });
        } else if (!created) {
             await deviceTokenRecord.update({ device_token: device_token, last_used_at: new Date() });
             return res.status(200).json({ message: "Device token re-registered successfully." });
        }

        res.status(201).json({ message: "Device token registered successfully." });

    } catch (error) {
        console.error('Error registering device token:', error.message);
        res.status(500).json({ message: "Server error registering device token", error: error.message });
    }
}

/**
 * @swagger
 * /notifications:
 * get:
 * summary: Mendapatkan daftar notifikasi untuk pengguna yang sedang login
 * tags: [Notifikasi]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: limit
 * schema: { type: integer, default: 10 }
 * description: Jumlah notifikasi per halaman.
 * - in: query
 * name: offset
 * schema: { type: integer, default: 0 }
 * description: Jumlah notifikasi untuk dilewati.
 * - in: query
 * name: is_read
 * schema: { type: boolean }
 * description: Filter notifikasi berdasarkan status dibaca (true/false).
 * responses:
 * 200:
 * description: Notifikasi berhasil diambil.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: 'string', example: 'Notifications retrieved successfully' }
 * data:
 * type: array
 * items:
 * $ref: '#/components/schemas/Notification'
 * 401:
 * description: Token tidak disediakan atau kadaluarsa.
 * 403:
 * description: Gagal mengautentikasi token.
 * 404:
 * description: Notifikasi tidak ditemukan untuk pengguna ini.
 * 500:
 * description: Server error.
 */
async function getNotifications(req, res) {
    try {
        const userId = req.user.id;
        const { limit = 10, offset = 0, is_read } = req.query;

        let whereClause = { user_id: userId };
        if (is_read !== undefined) {
            whereClause.is_read = is_read === 'true';
        }

        const notifications = await Notification.findAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['sent_at', 'DESC']]
        });

        if (notifications.length === 0) {
            return res.status(404).json({ message: "No notifications found for this user." });
        }

        res.status(200).json({
            message: "Notifications retrieved successfully",
            data: notifications
        });

    } catch (error) {
        console.error('Error getting notifications:', error.message);
        res.status(500).json({ message: "Server error getting notifications", error: error.message });
    }
}

/**
 * @swagger
 * /notifications/{id}/read:
 * put:
 * summary: Menandai notifikasi sebagai sudah dibaca
 * tags: [Notifikasi]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema: { type: integer }
 * required: true
 * description: ID unik notifikasi yang akan ditandai sudah dibaca.
 * responses:
 * 200:
 * description: Notifikasi berhasil ditandai sudah dibaca.
 * content:
 * application/json:
 * schema: { type: 'object', properties: { message: { type: 'string', example: 'Notification marked as read successfully.' } } }
 * 401:
 * description: Token tidak disediakan atau kadaluarsa.
 * 403:
 * description: Gagal mengautentikasi token atau tidak memiliki izin.
 * 404:
 * description: Notifikasi tidak ditemukan atau tidak dimiliki oleh pengguna.
 * 500:
 * description: Server error.
 */
async function markNotificationAsRead(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await Notification.findOne({
            where: { id: id, user_id: userId }
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found or not owned by user." });
        }

        await notification.update({ is_read: true });

        res.status(200).json({ message: "Notification marked as read successfully." });

    } catch (error) {
        console.error('Error marking notification as read:', error.message);
        res.status(500).json({ message: "Server error marking notification as read", error: error.message });
    }
}

export {
    registerDeviceToken,
    getNotifications,
    markNotificationAsRead
}