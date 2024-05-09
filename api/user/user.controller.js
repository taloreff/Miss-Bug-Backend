import { loggerService } from "../../services/logger.service.js"
import { userService } from "./user.service.js"

export async function getUsers(req, res){
    try {
        const users = await userService.query()
        res.send(users)
    } catch (error) {
        loggerService.error(`Could'nt get users`, error)
        res.status(400).send(`Could'nt get users`)
    }
}

export async function getUser(req, res) {
    try {
        const userId = req.params.userId
        const user = await userService.getById(userId)
        res.send(user)
    } catch (error) {
        loggerService.error(`Could'nt get user`, error)
        res.status(400).send(`Could'nt get user`)
    }
}

export async function removeUser(req, res) {
    try {
        const userId = req.params.userId
        await userService.remove(userId)
        res.send('deleted')
    } catch (error) {
        loggerService.error(`Could'nt remove user`, error)
        res.status(400).send(`Could'nt remove user`)
    }
}

export async function updateUser(req, res){
    const { _id, fullname, username, password, score } = req.body 
    let userToSave = { _id, fullname, username, score: +score, password }

    try {
        userToSave = await userService.save(userToSave)
        res.send(userToSave)
    } catch (error) {
        loggerService.error(`Could'nt save user`, error)
        res.status(400).send(`Could'nt save user`)
    }
}

export async function addUser(req, res){
    const { fullname, username, password, score } = req.body 
    let userToSave = { fullname,username, score: +score, password }
    try {
        userToSave = await userService.save(userToSave)
        res.send(userToSave)
    } catch (error) {
        loggerService.error(`Could'nt save user`, error)
        res.status(400).send(`Could'nt save user`)
    }
}