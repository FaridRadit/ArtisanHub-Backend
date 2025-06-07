import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET 

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'Akses ditolak. Token tidak disediakan.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token tidak valid atau tidak ada format Bearer.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token kadaluarsa. Mohon login kembali.' });
            }
            return res.status(403).json({ message: 'Gagal mengautentikasi token.' });
        }
        
        req.user = decoded;
        next();
    });
}

function authorizeRole(roles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Akses ditolak. Informasi peran tidak tersedia.' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin yang diperlukan.' });
        }

        next();
    };
}

export { authenticateToken, authorizeRole };