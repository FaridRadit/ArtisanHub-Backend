import ArtisanProfile from "../Database/Table/art.js";
import User from "../Database/Table/user.js";
import { Op } from "sequelize";

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

async function getAllArtisans(req, res) {
    try {
        const { lat, lon, radius, category, q, limit = 10, offset = 0 } = req.query;
        let whereClause = {};
        // Perbaikan: Tambahkan whereClause untuk User jika q harus mencari di username/full_name
        let userWhereClause = {};

        if (category) {
            whereClause.expertise_category = category;
        }

        if (q) {
            // PERBAIKAN DI SINI: Sesuaikan pencarian berdasarkan kolom yang ada di ArtisanProfile
            // Atau jika ingin mencari di nama user, Anda harus tambahkan kondisi di include User
            whereClause[Op.or] = [
                { bio: { [Op.like]: `%${q}%` } },
                { expertise_category: { [Op.like]: `%${q}%` } }
            ];

            // Jika Anda ingin mencari di username atau full_name user, tambahkan kondisi ini:
            userWhereClause[Op.or] = [
                { username: { [Op.like]: `%${q}%` } },
                { full_name: { [Op.like]: `%${q}%` } }
            ];
        }

        let artisans = await ArtisanProfile.findAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: User,
                    attributes: ['username', 'email', 'full_name', 'profile_picture_url'],
                    // Terapkan kondisi pencarian 'q' untuk User di sini
                    where: Object.keys(userWhereClause).length > 0 ? userWhereClause : {}
                }
            ]
        });

        // ... (Logika LBS dan respons lainnya) ...

        if (lat && lon && radius) {
            const userLat = parseFloat(lat);
            const userLon = parseFloat(lon);
            const searchRadius = parseFloat(radius);

            if (isNaN(userLat) || isNaN(userLon) || isNaN(searchRadius)) {
                return res.status(400).json({ message: "Invalid latitude, longitude, or radius." });
            }

            artisans = artisans.filter(artisan => {
                if (artisan.latitude && artisan.longitude) {
                    const distance = calculateDistance(userLat, userLon, artisan.latitude, artisan.longitude);
                    artisan.dataValues.distance = parseFloat(distance.toFixed(2));
                    return distance <= searchRadius;
                }
                return false;
            });

            artisans.sort((a, b) => a.dataValues.distance - b.dataValues.distance);
        }

        if (artisans.length === 0) {
            return res.status(404).json({ message: "No artisans found matching your criteria." });
        }

        res.status(200).json({
            message: "Artisans retrieved successfully",
            data: artisans
        });

    } catch (error) {
        console.error('Error getting all artisans:', error.message);
        res.status(500).json({ message: "Server error getting artisans", error: error.message });
    }
}

async function getArtisanById(req, res) {
    try {
        const { id } = req.params;

        const artisan = await ArtisanProfile.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['username', 'email', 'full_name', 'profile_picture_url']
                }
            ]
        });

        if (!artisan) {
            return res.status(404).json({ message: "Artisan not found." });
        }

        res.status(200).json({
            message: "Artisan retrieved successfully",
            data: artisan
        });

    } catch (error) {
        console.error('Error getting artisan by ID:', error.message);
        res.status(500).json({ message: "Server error getting artisan", error: error.message });
    }
}

async function createArtisanProfile(req, res) {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        const existingArtisanProfile = await ArtisanProfile.findOne({ where: { user_id: userId } });
        if (existingArtisanProfile) {
            return res.status(409).json({ message: "User already has an artisan profile." });
        }

        if (userRole !== 'artisan' && userRole !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only artisans or admins can create artisan profiles." });
        }

        const {
            bio, expertise_category, address, latitude, longitude,
            operational_hours, contact_email, contact_phone, website_url, social_media_links
        } = req.body;

        if (!expertise_category || !address || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ message: "Expertise category, address, latitude, and longitude are required." });
        }

        const userToUpdate = await User.findByPk(userId);
        if (userToUpdate && userToUpdate.role === 'user') {
            await userToUpdate.update({ role: 'artisan' });
        } else if (!userToUpdate) {
            return res.status(404).json({ message: "Associated user not found." });
        }

        const newArtisanProfile = await ArtisanProfile.create({
            user_id: userId,
            bio,
            expertise_category,
            address,
            latitude,
            longitude,
            location_point: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
            operational_hours,
            contact_email,
            contact_phone,
            website_url,
            social_media_links
        });

        res.status(201).json({
            message: "Artisan profile created successfully",
            data: newArtisanProfile
        });

    } catch (error) {
        console.error('Error creating artisan profile:', error.message);
        res.status(500).json({ message: "Server error creating artisan profile", error: error.message });
    }
}

async function updateArtisanProfile(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const artisanProfile = await ArtisanProfile.findByPk(id);

        if (!artisanProfile) {
            return res.status(404).json({ message: "Artisan profile not found." });
        }

        if (artisanProfile.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: "Forbidden: You are not authorized to update this profile." });
        }

        const updateData = req.body;

        if (updateData.latitude !== undefined || updateData.longitude !== undefined) {
            const newLat = updateData.latitude !== undefined ? parseFloat(updateData.latitude) : artisanProfile.latitude;
            const newLon = updateData.longitude !== undefined ? parseFloat(updateData.longitude) : artisanProfile.longitude;
            if (!isNaN(newLat) && !isNaN(newLon)) {
                updateData.location_point = { type: 'Point', coordinates: [newLon, newLat] };
            }
        }

        await artisanProfile.update(updateData);

        res.status(200).json({
            message: "Artisan profile updated successfully",
            data: artisanProfile
        });

    } catch (error) {
        console.error('Error updating artisan profile:', error.message);
        res.status(500).json({ message: "Server error updating artisan profile", error: error.message });
    }
}

async function deleteArtisanProfile(req, res) {
    try {
        const { id } = req.params;
        const userRole = req.user.role;

        if (userRole !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only admins can delete artisan profiles." });
        }

        const artisanProfile = await ArtisanProfile.findByPk(id);

        if (!artisanProfile) {
            return res.status(404).json({ message: "Artisan profile not found." });
        }

        await artisanProfile.destroy();

        res.status(200).json({ message: "Artisan profile deleted successfully." });

    } catch (error) {
        console.error('Error deleting artisan profile:', error.message);
        res.status(500).json({ message: "Server error deleting artisan profile", error: error.message });
    }
}

export {
    getAllArtisans,
    getArtisanById,
    createArtisanProfile,
    updateArtisanProfile,
    deleteArtisanProfile
};