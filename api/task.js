const moment = require('moment')

module.exports = app => {
    const getTasks = (req, res) => {
        const date = req.query.date ? 
            req.query.date : moment().endOf('day').toDate()

        app.db('tasks')
            .where({ userId: req.user.id })
            .where('estimateAt', '<=', date)
            .orderBy('estimateAt')
            .then(tasks => res.json(tasks))
            .catch(error => res.status(500).json(error))
    }
    const save = (req, res) => {
        if(!req.body.description.trim()){
            return res.status(400).send('Descrição é um campo obrigatório')
        }
        req.body.userId = req.user.id

        app.db('tasks')
            .insert(req.body)
            .then(_ => res.status(204).send())
            .catch(error => res.status(400).json(error))
    }

    const remove = (req, res) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })
            .del()
            .then(rowsDeleted => {
                if(rowsDeleted > 0) {
                    res.status(204).send()
                } else {
                    const msg = `Não foi encontrado nenhum usuário com o id ${req.params.id}.`
                    res.status(400).json(msg)
                }
            })
            .catch(error => res.status(400).json(error))
    }

    const updateTaskDoneAt = (req, res, doneAt) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })
            .update({ doneAt })
            .then(_ => res.status(400).json())
            .catch(error => res.status(400).json(error))
    }

    const toogleTask = (req, res) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })
            .first()
            .then(task => {
                if(!task) {
                    const msg = `Task com o id ${req.params.id} não foi encontrada.`
                    return res.status(400).json(msg)
                } 

                const doneAt = task.doneAt ? null : new Date()
                updateTaskDoneAt(req, res, doneAt)
            })
            .catch(error => res.status(400).json(error))
    }

    return { getTasks, save, remove, toogleTask }
}