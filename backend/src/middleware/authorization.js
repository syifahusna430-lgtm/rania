import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token tidak ada" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token tidak valid" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid/expired" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: akses ditolak" });
    }
    next();
  };
};