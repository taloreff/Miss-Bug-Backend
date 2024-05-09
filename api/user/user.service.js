import fs from 'fs' 
import { utilService } from "../../services/util.service.js";

const users = utilService.readJsonFile('data/users.json');

export const userService = {
    query,
    getById,
    remove,
    save
}

async function query() {
    try {
        return users;
    } catch (error) {
        throw error;
    }
}


async function getById(userId) {
    try {
        const user = users.find(user => user._id === userId)
        return user
    } catch (error) {
        throw error
    }
}


async function remove(userId) {
    try {
        const userIdx = users.findIndex(user => user._id === userId)
        users.splice(userIdx, 1)
        _saveUsersToFile()
    } catch (error) {
        throw error
    }
}


async function save(userToSave) {
    try {
        if (userToSave._id) {
            const idx = users.findIndex(user => user._id === userToSave._id)
            if (idx < 0) throw `Cant find user with _id ${userToSave._id}`
            users[idx] = userToSave
        } else {
            userToSave._id = utilService.makeId()
            users.push(userToSave)
        }
        await _saveUsersToFile()
        return userToSave
    } catch (error) {
        throw error
    }
}


function _saveUsersToFile(path = './data/users.json') {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(users, null, 4)
        fs.writeFile(path, data, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}