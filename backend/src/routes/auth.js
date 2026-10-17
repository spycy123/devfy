"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
function createToken(userId) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET belum dikonfigurasi');
    }
    return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn: '1d' });
}
router.post('/register', async (req, res) => {
    try {
        const { name, username, email, password } = req.body ?? {};
        if (typeof name !== 'string' ||
            typeof username !== 'string' ||
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !name.trim() ||
            !username.trim() ||
            !email.trim() ||
            password.length < 8 ||
            password.length > 72) {
            return res.status(400).json({
                message: 'Isi semua data dengan benar. Password harus 8–72 karakter.',
            });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim().toLowerCase();
        if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
            return res.status(400).json({
                message: 'Username harus 3–30 karakter, huruf kecil, angka, atau underscore.',
            });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ message: 'Format email tidak valid.' });
        }
        const existingUser = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: normalizedEmail },
                    { username: normalizedUsername },
                ],
            },
            select: { id: true },
        });
        if (existingUser) {
            return res.status(409).json({
                message: 'Email atau username sudah digunakan.',
            });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.prisma.user.create({
            data: {
                name: name.trim(),
                username: normalizedUsername,
                email: normalizedEmail,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
            },
        });
        return res.status(201).json({
            message: 'Registrasi berhasil.',
            user,
            token: createToken(user.id),
        });
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'P2002') {
            return res.status(409).json({
                message: 'Email atau username sudah digunakan.',
            });
        }
        console.error('Register error:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server.',
        });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        if (typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password ||
            password.length > 72) {
            return res.status(400).json({
                message: 'Email dan password wajib diisi.',
            });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        });
        if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash))) {
            return res.status(401).json({
                message: 'Email atau password salah.',
            });
        }
        return res.json({
            message: 'Login berhasil.',
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
            },
            token: createToken(user.id),
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server.',
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map