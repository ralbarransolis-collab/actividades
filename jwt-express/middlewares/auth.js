const jwt = require("jsonwebtoken");

function auth(req, res, next) {
    const header = req.headers.authorization || "";
    const [tipo, token] = header.split(" ");

    if (tipo !== "Bearer" || !token) {
        return res.status(401).json({
            ok: false,
            mensaje: "Token requerido"
        });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            mensaje: "Token inválido o expirado"
        });
    }
}

module.exports = auth;
