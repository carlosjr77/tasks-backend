const bcript = require('bcrypt-nodejs')

module.exports = app => {
    const obterHash = (password, callback) => {
        bcript.genSalt(10, (error, salt) => {
            bcript.hash(password, salt, null, (error, hash) => callback(hash))
        })
    }

    const save = (req, res) => {
        obterHash(req.body.password, hash => {
            const password = hash
            
            app.db('users')
                .insert({ name: req.body.name, email: req.body.email, password })
                .then(_ => res.status(204).send())
                .catch(error => res.status(500).json(error))
        })
    }

    return { save }
}