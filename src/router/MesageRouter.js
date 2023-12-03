const express = require('express')
const Router = express.Router();

const Messages = require('../models/Messages')

Router.post("/get", (req, res) => {
    const { from, to } = req.body;
    //console.log(from , to)
    Messages.find({
        users: {
            $all: [from, to]
        }
    }).sort({ updatedAt: 1 })
        .then(messages => {
            const projectedMessage = messages.map((messageReques) => {
                return {
                    self: messageReques.sender.toString() === from,
                    message: messageReques.message.text,
                    date: messageReques.createdAt,
                    base64Image : messageReques.base64Image.text
                }
            })
            return res.status(200).json({
                code: 1,
                message: "Get message Successfully",
                data: projectedMessage
            })
        })
        .catch(error => {
            res.status(401).json({
                code: 0,
                message: "Fail send Message.Error : " + error.message
            })
        })
});

Router.post('/add', (req, res) => {
    const { from, to, message, base64Image } = req.body;
    console.log("🚀 ~ file: MesageRouter.js:38 ~ Router.post ~ { from, to, message, base64Image }:", { from, to, message, base64Image })


    const newMessaga = Messages({
        message: { text: message },
        users: [from, to],
        sender: from,
        base64Image: { text: base64Image }
    })

    console.log("🚀 ~ file: MesageRouter.js:45 ~ Router.post ~ newMessaga:", newMessaga)

    // return

    newMessaga.save()
        .then(data => {
            return res.status(200).json({
                code: 1,
                message: "Message added successfully",
                data: data
            })
        })
        .catch(err => {
            return res.json({
                code: 0,
                message: "Failed to add message to the database.Error : " + err,
            })
        })
})

module.exports = Router