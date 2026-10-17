"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
cat > src / index.ts << 'EOF';
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const prisma_1 = require("./prisma");
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
}));
app.use(express_1.default.json());
app.get('/api/health', async (_req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'ok',
            message: 'Devfy API is running',
            database: 'connected',
        });
    }
    catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
        });
    }
});
app.use('/api/auth', auth_1.default);
app.listen(PORT, () => {
    console.log(`Devfy API running at http://localhost:${PORT}`);
});
EOF;
//# sourceMappingURL=index.js.map