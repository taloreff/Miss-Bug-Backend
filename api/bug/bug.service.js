import fs from 'fs' 
import { utilService } from "../../services/util.service.js";

const PAGE_SIZE = 5
const bugs = utilService.readJsonFile('./data/bugs.json');

export const bugService = {
    query,
    getById,
    remove,
    save
}

async function query(filterBy = {}) {
    let filteredBugs = [...bugs];
    try {
        if (filterBy.title) {
            const regExp = new RegExp(filterBy.title, 'i');
            filteredBugs = filteredBugs.filter(bug => regExp.test(bug.title) || regExp.test(bug.description));
        }
        if (filterBy.severity !== 0) {
            filteredBugs = filteredBugs.filter(bug => bug.severity >= filterBy.severity);
        }
        if (filterBy.labels && filterBy.labels.length) {
            filteredBugs = filteredBugs.filter(bug => filterBy.labels.every(label => bug.labels.includes(label)));
        }
        
        filteredBugs.sort((bug1, bug2) => {
            if (bug1.severity !== bug2.severity) {
                return bug1.severity - bug2.severity;
            }
            if (bug1.createdAt !== bug2.createdAt) {
                return bug1.createdAt - bug2.createdAt;
            }
            return bug1.title.localeCompare(bug2.title);
        });
        
        if (filterBy.pageIdx) {
            const startIdx = filterBy.pageIdx * PAGE_SIZE;
            const endIdx = startIdx + PAGE_SIZE;
            filteredBugs = filteredBugs.slice(startIdx, endIdx);
        }

        
        return filteredBugs;
    } catch (error) {
        throw error;
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
            bugs.push(bugToSave)
        }
        await _saveBugsToFile()
        return bugToSave
    } catch (error) {
        throw error
    }
}


function _saveBugsToFile(path = './data/bugs.json') {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile(path, data, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}