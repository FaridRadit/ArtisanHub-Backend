import admin from 'firebase-admin';
import DeviceToken from '../Database/Table/DeviceToken.js';
import Notification from '../Database/Table/Notification.js';

const FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 = "InR5cGUiOiAic2VydmljZV9hY2NvdW50IiwKICAicHJvamVjdF9pZCI6ICJhcnRpc2FuaHViLTlhNDJkIiwKICAicHJpdmF0ZV9rZXlfaWQiOiAiNTY5MGIyNmIzNmJlNjNjNWE0MTlmNGNiOTFjMDc0M2UxMmEwZDgwZSIsCiAgInByaXZhdGVfa2V5IjogIi0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZBSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS1l3Z2dTaUFnRUFBb0lCQVFERHV4M1VXbkw1b2FYcFxuQVg4eHF1bFY1UWNGbW1NT0llWUlaY2RtNFFDVkVGV2hLZklzZnd0ajlleVBLL1ZsaUVBOEZFeG1nZ0VSVXNYdlxuN1FCUjRpUENMZ1dnR0o3UTIzQkVXODNuNVQ0cVdteVk4U3Q1UWdhSzFVaGJhVVNHTjk3UnBCeEpmQ3pNd21ZVVxud1BYTH";

let serviceAccount;
try {
    if (!FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set.");
    }
    serviceAccount = JSON.parse(Buffer.from(FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('ascii'));
} catch (error) {
    console.error("Failed to parse Firebase service account key from Base64:", error.message);
   
}

if (!admin.apps.length) {
    if (serviceAccount) { 
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized.');
    } else {
        console.error('Firebase Admin SDK could not be initialized: serviceAccount is null or undefined.');
    }
} else {
    console.log('Firebase Admin SDK already initialized.');
}

async function sendNotificationToUser(userId, title, body, dataPayload = {}, notificationType = 'general', targetId = null) {
    try {
        const deviceTokens = await DeviceToken.findAll({
            where: { user_id: userId },
            attributes: ['device_token']
        });

        if (deviceTokens.length === 0) {
            console.log(`No device tokens found for user ID: ${userId}. Notification not sent.`);
            return { success: false, message: 'No device tokens found.' };
        }

        const registrationTokens = deviceTokens.map(dt => dt.device_token);

        const message = {
            notification: {
                title: title,
                body: body,
            },
            data: {
                ...dataPayload,
                notificationType: notificationType,
                targetId: targetId ? String(targetId) : '',
            },
            tokens: registrationTokens,
        };

        const response = await admin.messaging().sendMulticast(message);

        await Notification.create({
            user_id: userId,
            type: notificationType,
            title: title,
            message: body,
            target_id: targetId,
            is_read: false,
            sent_at: new Date()
        });

        console.log(`Successfully sent message to user ${userId}:`, response.successCount, 'sent,', response.failureCount, 'failed.');
        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`Failed to send to token ${registrationTokens[idx]}:`, resp.error);
                }
            });
        }

        return { success: true, response: response };

    } catch (error) {
        console.error('Error sending notification to user:', error);
        return { success: false, message: 'Failed to send notification.', error: error.message };
    }
}

async function sendNotificationToTopic(topic, title, body, dataPayload = {}) {
    try {
        const message = {
            notification: {
                title: title,
                body: body,
            },
            data: {
                ...dataPayload,
            },
            topic: topic,
        };

        const response = await admin.messaging().send(message);
        console.log(`Successfully sent message to topic ${topic}:`, response);
        return { success: true, response: response };
    } catch (error) {
        console.error('Error sending notification to topic:', error);
        return { success: false, message: 'Failed to send topic notification.', error: error.message };
    }
}

export {
    sendNotificationToUser,
    sendNotificationToTopic
};