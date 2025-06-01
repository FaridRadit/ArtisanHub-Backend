import Event from "../Database/Table/events.js";
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

async function getAllEvents(req, res) {
    try {
        const { lat, lon, radius, date_from, date_to, q, limit = 10, offset = 0 } = req.query;
        let whereClause = {};
        let orderClause = [['start_date', 'ASC']];

        if (q) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${q}%` } },
                { description: { [Op.iLike]: `%${q}%` } }
            ];
        }

        if (date_from && date_to) {
            whereClause.start_date = { [Op.between]: [date_from, date_to] };
        } else if (date_from) {
            whereClause.start_date = { [Op.gte]: date_from };
        } else if (date_to) {
            whereClause.end_date = { [Op.lte]: date_to };
        }

        let events = await Event.findAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: orderClause
        });

        if (lat && lon && radius) {
            const userLat = parseFloat(lat);
            const userLon = parseFloat(lon);
            const searchRadius = parseFloat(radius);

            if (isNaN(userLat) || isNaN(userLon) || isNaN(searchRadius)) {
                return res.status(400).json({ message: "Invalid latitude, longitude, or radius." });
            }

            events = events.filter(event => {
                if (event.latitude && event.longitude) {
                    const distance = calculateDistance(userLat, userLon, event.latitude, event.longitude);
                    event.dataValues.distance = parseFloat(distance.toFixed(2));
                    return distance <= searchRadius;
                }
                return false;
            });

            events.sort((a, b) => a.dataValues.distance - b.dataValues.distance);
        }

        if (events.length === 0) {
            return res.status(404).json({ message: "No events found matching your criteria." });
        }

        res.status(200).json({
            message: "Events retrieved successfully",
            data: events
        });

    } catch (error) {
        console.error('Error getting all events:', error.message);
        res.status(500).json({ message: "Server error getting events", error: error.message });
    }
}

async function getEventById(req, res) {
    try {
        const { id } = req.params;

        const event = await Event.findByPk(id);

        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        res.status(200).json({
            message: "Event retrieved successfully",
            data: event
        });

    } catch (error) {
        console.error('Error getting event by ID:', error.message);
        res.status(500).json({ message: "Server error getting event", error: error.message });
    }
}

async function createEvent(req, res) {
    try {
        const userRole = req.user.role;

        if (userRole !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only admins can create events." });
        }

        const {
            name, description, start_date, end_date,
            location_name, address, latitude, longitude,
            organizer, event_url, poster_image_url
        } = req.body;

        if (!name || !start_date || !end_date || !location_name || !address || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ message: "Name, start_date, end_date, location_name, address, latitude, and longitude are required." });
        }
        if (new Date(start_date) > new Date(end_date)) {
            return res.status(400).json({ message: "Start date cannot be after end date." });
        }

        const newEvent = await Event.create({
            name,
            description,
            start_date,
            end_date,
            location_name,
            address,
            latitude,
            longitude,
            location_point: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
            organizer: organizer || null,
            event_url: event_url || null,
            poster_image_url: poster_image_url || null
        });

        res.status(201).json({
            message: "Event created successfully",
            data: newEvent
        });

    } catch (error) {
        console.error('Error creating event:', error.message);
        res.status(500).json({ message: "Server error creating event", error: error.message });
    }
}

async function updateEvent(req, res) {
    try {
        const { id } = req.params;
        const userRole = req.user.role;

        if (userRole !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only admins can update events." });
        }

        const event = await Event.findByPk(id);

        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        const updateData = req.body;

        if (updateData.start_date && updateData.end_date) {
            if (new Date(updateData.start_date) > new Date(updateData.end_date)) {
                return res.status(400).json({ message: "Start date cannot be after end date." });
            }
        } else if (updateData.start_date && new Date(updateData.start_date) > new Date(event.end_date)) {
            return res.status(400).json({ message: "New start date cannot be after current end date." });
        } else if (updateData.end_date && new Date(event.start_date) > new Date(updateData.end_date)) {
            return res.status(400).json({ message: "Current start date cannot be after new end date." });
        }

        if (updateData.latitude !== undefined || updateData.longitude !== undefined) {
            const newLat = updateData.latitude !== undefined ? parseFloat(updateData.latitude) : event.latitude;
            const newLon = updateData.longitude !== undefined ? parseFloat(updateData.longitude) : event.longitude;
            if (!isNaN(newLat) && !isNaN(newLon)) {
                updateData.location_point = { type: 'Point', coordinates: [newLon, newLat] };
            }
        }

        await event.update(updateData);

        res.status(200).json({
            message: "Event updated successfully",
            data: event
        });

    } catch (error) {
        console.error('Error updating event:', error.message);
        res.status(500).json({ message: "Server error updating event", error: error.message });
    }
}

async function deleteEvent(req, res) {
    try {
        const { id } = req.params;
        const userRole = req.user.role;

        if (userRole !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only admins can delete events." });
        }

        const event = await Event.findByPk(id);

        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        await event.destroy();

        res.status(200).json({ message: "Event deleted successfully." });

    } catch (error) {
        console.error('Error deleting event:', error.message);
        res.status(500).json({ message: "Server error deleting event", error: error.message });
    }
}

export {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};