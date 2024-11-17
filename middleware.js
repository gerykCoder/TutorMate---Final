function checkRole(role){

    return (req, res, next)=>{
        if(req.session.user && req.session.user.role === role){
            next();
        }
        else{
            res.status(403).send('Access Denied');
        }
    }
};

module.exports = checkRole;