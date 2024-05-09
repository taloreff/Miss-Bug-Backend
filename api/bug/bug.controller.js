import ms from 'ms';
import { loggerService } from "../../services/logger.service.js"
import { bugService } from "./bug.service.js"

export async function getBugs(req, res){
    const { title, severity, pageIdx, labels } = req.query
    const filterBy = { title, severity: +severity, pageIdx, labels }

    try {
        const bugs = await bugService.query(filterBy)
        res.send(bugs)
    } catch (error) {
        loggerService.error(`Could'nt get bugs`, error)
        res.status(400).send(`Could'nt get bugs`)
    }
}

export async function getBug(req, res) {
    try {
        const bugId = req.params.bugId
        console.log(req.cookies);
        let bugLimiter = req.cookies.bugLimiter
        console.log('bugLimiter :>> ', bugLimiter);
        bugLimiter = updateVisitedBugs(bugId, bugLimiter)
        res.cookie('bugLimiter', bugLimiter)
        const bug = await bugService.getById(bugId)
        res.send(bug)
    } catch (error) {
        if (error.message === 'bugLimit Reached') {
            res.status(401).send('Wait for a bit')
        } else {
            loggerService.error(`Could'nt get bug`, error)
            res.status(400).send(`Could'nt get bug`)
        }
    }
}

export async function removeBug(req, res) {
    try {
        const bugId = req.params.bugId
        await bugService.remove(bugId)
        res.send('deleted')
    } catch (error) {
        loggerService.error(`Could'nt remove bug`, error)
        res.status(400).send(`Could'nt remove bug`)
    }
}

export async function updateBug(req, res){
    const { _id, title, description, severity, labels } = req.body 
    let bugToSave = { _id, title, description, severity: +severity, labels }

    try {
        bugToSave = await bugService.save(bugToSave)
        res.send(bugToSave)
    } catch (error) {
        loggerService.error(`Could'nt save bug`, error)
        res.status(400).send(`Could'nt save bug`)
    }
}

export async function addBug(req, res){
    const { title, description , severity, labels } = req.body 
    let bugToSave = { title,description, severity: +severity, labels }
    try {
        bugToSave = await bugService.save(bugToSave)
        res.send(bugToSave)
    } catch (error) {
        loggerService.error(`Could'nt save bug`, error)
        res.status(400).send(`Could'nt save bug`)
    }
}

const updateVisitedBugs = (bugId, bugLimiter) => {
    const timeout = '57 seconds';

    if (!bugLimiter) {
        bugLimiter = {
            visitedBugs: [bugId],
            lastVisit: Date.now()
        };
        console.log('no bug limiter found, creating one:', bugLimiter)
        return bugLimiter;
    }

    if (bugLimiter.visitedBugs.length < 3) {
        console.log('length is less than 3, adding bugId to visitedBugs:');
        if (!bugLimiter.visitedBugs.includes(bugId)) {
            console.log('bugId is not in visitedBugs, adding it:');
            bugLimiter.visitedBugs.push(bugId);
            console.log('pushed to bugLimiter.visitedBugs:', bugLimiter.visitedBugs);
            if (bugLimiter.visitedBugs.length === 3) {
                bugLimiter.lastVisit = Date.now();
            }
        }
    } else {
        if (Date.now() - bugLimiter.lastVisit > ms(timeout)) {
            bugLimiter.visitedBugs = [];
        } else {
            throw new Error('bugLimit Reached');
        }
    }

    console.log(`User visited the following bugs: ${bugLimiter.visitedBugs} within the past ${timeout}`);

    return bugLimiter;
};
