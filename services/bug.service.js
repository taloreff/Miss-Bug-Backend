import fs from 'fs'
import { utilService } from "./util.service.js"

const bugs = utilService.readJsonFile('data/bugs.json');
const PAGE_SIZE = 5

export const bugService = {
    query,
    getById,
    remove,
    save
}

async function query(filterBy = {}) {
    let filteredBugs = [...bugs]

    try {
        if (filterBy.txt) {
            const regExp = new RegExp(filterBy.txt, 'i')
            filteredBugs = filteredBugs.filter(bug => regExp.test(bug.vendor))
        }
    
        if (filterBy.severity) {
            filteredBugs = filteredBugs.filter(bug => bug.severity >= filterBy.severity)
        }

        if(filterBy.labels){
            filteredBugs = filteredBugs.filter(bug => bug.labels.some(label => filterBy.labels.includes(label)))
        }

        if(filterBy.sortBy === 'severity') {
            filteredBugs.sort((bug1, bug2) => bug1.severity - bug2.severity)
        }

        if(filterBy.sortBy === 'createdAt') {
            filteredBugs.sort((bug1, bug2) => bug1.createdAt - bug2.createdAt)
        }

        if(filterBy.sortBy === 'title') {
            filteredBugs.sort((bug1, bug2) => bug1.title.localeCompare(bug2.title))
        }

        if(filterBy.pageIdx) {
            const startIdx = filterBy.pageIdx * PAGE_SIZE
            filteredBugs = filteredBugs.slice(startIdx, startIdx + PAGE_SIZE)
        }

        return filteredBugs
    } catch (error) {
        throw error
    }
}

async function getById(bugId) {
    try {
        const bug = bugs.find(bug => bug._id === bugId)
        return bug
    } catch (error) {
        throw error
    }
}


async function remove(bugId) {
    try {
        const bugIdx = bugs.findIndex(bug => bug._id === bugId)
        bugs.splice(bugIdx, 1)
        _saveBugsToFile()
    } catch (error) {
        throw error
    }
}


async function save(bugToSave) {
    try {
        if (bugToSave._id) {
            const idx = bugs.findIndex(bug => bug._id === bugToSave._id)
            if (idx < 0) throw `Cant find bug with _id ${bugToSave._id}`
            bugs[idx] = bugToSave
        } else {
            bugToSave._id = utilService.makeId()
            const currentTime = Date.now();
            bugToSave.createdAt = currentTime
            bugs.push(bugToSave)
        }
        await _saveBugsToFile()
        return bugToSave
    } catch (error) {
        throw error
    }
}


function _saveBugsToFile(path = 'data/bugs.json') {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile(path, data, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}