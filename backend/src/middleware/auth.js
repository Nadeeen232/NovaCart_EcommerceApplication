import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const protect=async(req,res,next)=>{const raw=req.headers.authorization;if(!raw?.startsWith('Bearer ')) return res.status(401).json({message:'Authentication required'});try{const payload=jwt.verify(raw.slice(7),process.env.JWT_SECRET);req.user=await User.findById(payload.sub);if(!req.user) throw new Error();next();}catch{return res.status(401).json({message:'Invalid or expired token'});}};
export const adminOnly=(req,res,next)=>req.user?.role==='admin'?next():res.status(403).json({message:'Admin access required'});
