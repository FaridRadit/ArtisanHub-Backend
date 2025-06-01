const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Artisan Hub Backend API',
            version: '1.0.0',
            description: 'Dokumentasi API untuk aplikasi Artisan Hub, memungkinkan pencarian pengrajin, produk, event, dan manajemen profil.',
            contact: {
                name: 'Tim Artisan Hub',
                email: 'support@artisanhub.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Server Pengembangan Lokal'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Masukkan token JWT Anda di sini (misal: Bearer eyJhbGciO...)'
                }
            },
            // Definisi Skema Model (untuk Reusability)
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        username: { type: 'string', example: 'userbaru' },
                        email: { type: 'string', format: 'email', example: 'userbaru@example.com' },
                        password_hash: { type: 'string', example: 'hashedpasswordexample' }, // Jangan tampilkan di respons publik
                        role: { type: 'string', enum: ['user', 'artisan', 'admin'], example: 'user' },
                        full_name: { type: 'string', example: 'Pengguna Biasa' },
                        phone_number: { type: 'string', example: '08123456789' },
                        profile_picture_url: { type: 'string', format: 'uri', example: 'http://example.com/profile.jpg' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                ArtisanProfile: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        user_id: { type: 'integer', example: 1 },
                        bio: { type: 'string', example: 'Pengrajin batik tulis tradisional.' },
                        expertise_category: { type: 'string', example: 'Batik Tulis' },
                        address: { type: 'string', example: 'Jl. Pengrajin No. 1, Yogyakarta' },
                        latitude: { type: 'number', format: 'float', example: -7.788697 },
                        longitude: { type: 'number', format: 'float', example: 110.370000 },
                        location_point: {
                            type: 'object',
                            properties: {
                                type: { type: 'string', example: 'Point' },
                                coordinates: { type: 'array', items: { type: 'number' }, example: [110.370000, -7.788697] }
                            }
                        },
                        operational_hours: { type: 'object', example: {"Monday": "09:00-17:00"} },
                        contact_email: { type: 'string', format: 'email', example: 'kontak@artisan.com' },
                        contact_phone: { type: 'string', example: '08123456789' },
                        website_url: { type: 'string', format: 'uri', example: 'http://artisan.com' },
                        social_media_links: { type: 'object', example: {"instagram": "artisan_ig"} },
                        avg_rating: { type: 'number', format: 'float', example: 4.5 },
                        total_reviews: { type: 'integer', example: 100 },
                        is_verified: { type: 'boolean', example: false },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        artisan_id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Tas Batik Tulis' },
                        description: { type: 'string', example: 'Tas tangan dari kulit asli dengan motif batik tulis.' },
                        price: { type: 'number', format: 'float', example: 250000.00 },
                        currency: { type: 'string', example: 'IDR' },
                        main_image_url: { type: 'string', format: 'uri', example: 'http://example.com/tas_batik.jpg' },
                        category: { type: 'string', example: 'Tas' },
                        stock_quantity: { type: 'integer', example: 10 },
                        is_available: { type: 'boolean', example: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Event: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Festival Kriya Nasional' },
                        description: { type: 'string', example: 'Pameran kriya terbesar tahunan.' },
                        start_date: { type: 'string', format: 'date', example: '2025-07-10' },
                        end_date: { type: 'string', format: 'date', example: '2025-07-15' },
                        location_name: { type: 'string', example: 'Balai Sidang Jakarta' },
                        address: { type: 'string', example: 'Jl. Gatot Subroto No.1, Jakarta' },
                        latitude: { type: 'number', format: 'float', example: -6.208763 },
                        longitude: { type: 'number', format: 'float', example: 106.845599 },
                        location_point: {
                            type: 'object',
                            properties: {
                                type: { type: 'string', example: 'Point' },
                                coordinates: { type: 'array', items: { type: 'number' }, example: [106.845599, -6.208763] }
                            }
                        },
                        organizer: { type: 'string', example: 'Pemerintah Provinsi' },
                        event_url: { type: 'string', format: 'uri', example: 'http://event.com/kriya' },
                        poster_image_url: { type: 'string', format: 'uri', example: 'http://event.com/poster.jpg' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Notification: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        user_id: { type: 'integer', example: 1 },
                        type: { type: 'string', example: 'promo' },
                        title: { type: 'string', example: 'Diskon 20%!' },
                        message: { type: 'string', example: 'Dapatkan diskon untuk semua produk batik.' },
                        target_id: { type: 'integer', example: 101 },
                        is_read: { type: 'boolean', example: false },
                        sent_at: { type: 'string', format: 'date-time' }
                    }
                },
                DeviceToken: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        user_id: { type: 'integer', example: 1 },
                        device_token: { type: 'string', example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' },
                        platform: { type: 'string', enum: ['android', 'ios'], example: 'android' },
                        last_used_at: { type: 'string', format: 'date-time' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
       
    ],
};

export default swaggerOptions;