import jwt from "jsonwebtoken"

export const authMiddleware = async(req, res, next)=>{
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace('Bearer ',  '');
  
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Token not found"
            })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;

        next();
    }
    catch(err){
        console.log("Unauthorized error: ", err);
        return res.status(500).json({
            success: false,
            message: "Unauthorized access",
        })
    }
}


export const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required",
        });
    }
    next();
};