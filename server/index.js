const express = require('express');
const cors = require('cors');
const app = express();

const port = 3000;

const https = require('https');
const { URL } = require('url');
const champoins = require('./assets').champions.data;
const api_key = 'RGAPI-6fef9aca-937f-4dd9-bd88-d206900cb3b7';

// function timeOut() {
//     let timeout = setTimeout(parseChamps, 3000);
// }
// function parseChamps(champ_ids) {
//     if (typeof result !== 'undefined') {
//         champ_ids = JSON.parse(result);
//     }
// }

app.use(cors());

let riot_api_ctrl = {
    getByName: (req, res) => {
        let result;
        let url, pathname;
        pathname = `/lol/summoner/v3/summoners/by-name/${req.query.name}`;
        url = new URL(`https://eun1.api.riotgames.com${pathname}?api_key=${api_key}`);
        let riotReq = https.request(url, (riotRes) => {
            // console.log('statusCode:', riotRes.statusCode);
            // console.log('headers:', riotRes.headers);
            riotRes.setEncoding('utf8');
            riotRes.on('data', (data) => {
                result = data;
            });
            riotRes.on('end', () => {
                res.send({ "result": result });
            });
        });

        riotReq.on('error', (err) => {
            res.send({ "err": err });
        });
        riotReq.end();
    },
    getFreeRotation: (req, res) => {
        let result;
        let url, pathname;
        pathname = `/lol/platform/v3/champion-rotations`;
        url = new URL(`https://eun1.api.riotgames.com${pathname}?api_key=${api_key}`);
        let riotReq = https.request(url, (riotRes) => {
            // console.log('statusCode:', riotRes.statusCode);
            // console.log('headers:', riotRes.headers);
            riotRes.setEncoding('utf8');
            riotRes.on('data', (data) => {
                result = data;
            });
            riotRes.on('end', () => {
                let champ_names = [];
                let champ_ids = JSON.parse(result);
                //champ_names.sort((a, b) => {parseFloat(a.champions.id) - parseFloat(b.champions.id)});
                Object.keys(champoins).forEach((champName) => {
                    if (champ_ids.freeChampionIds.length > champ_names.length) {
                        let index = champ_ids.freeChampionIds.findIndex((id) => champoins[champName].id === id);
                        if (index !== undefined) {
                            champ_names.push(champName);
                            champ_names.sort(function (a, b) {
                                var nameA = a.toUpperCase(); // ignore upper and lowercase
                                var nameB = b.toUpperCase(); // ignore upper and lowercase
                                if (nameA < nameB) {
                                    return -1;
                                }
                                if (nameA > nameB) {
                                    return 1;
                                }
                            });
                        }
                        else {
                            return;
                        }
                    }
                });
                res.send({ "result": { "names": champ_names } });
            });
        });

        riotReq.on('error', (err) => {
            res.send({ "err": err });
        });
        riotReq.end();
    },
    getChampions: (req, res) => {
        let result;
        let url, pathname;
        pathname = `/lol/platform/v3/champions`;
        url = new URL(`https://eun1.api.riotgames.com${pathname}?api_key=${api_key}`);
        let riotReq = https.request(url, (riotRes) => {
            // console.log('statusCode:', riotRes.statusCode);
            // console.log('headers:', riotRes.headers);
            riotRes.setEncoding('utf8');
            riotRes.on('data', (data) => {
                result = data;
                // setTimeout(function(result){  }, 3000);
            });
            riotRes.on('end', () => {
                let champ_names = [];
                let champ_ids = [];
                if (typeof result == "string" && typeof result !== 'undefined') {
                    champ_ids = JSON.parse(result);
                }
                // champ_ids.sort((a, b) => {parseFloat(a.champions.id) - parseFloat(b.champions.id)});
                Object.keys(champoins).forEach((champName) => {
                    if (champ_ids.champions.length > champ_names.length) {
                        let index = champ_ids.champions.findIndex((id) => champoins[champName].id === id);
                        if (index !== undefined) {
                            champ_names.push(champName);
                        }
                        else {
                            return;
                        }
                    }
                });
                champ_names.sort(function (a, b) {
                    var nameA = a.toUpperCase(); // ignore upper and lowercase
                    var nameB = b.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                });
                res.send({ "result": { "names": champ_names } });
            });
        });

        riotReq.on('error', (err) => {
            res.send({ "err": err });
        });
        riotReq.end();
    }
};

app.get('/getChampions', riot_api_ctrl.getChampions)

app.get('/getByName', (req, res) => {
    if (req.query.name) {
        riot_api_ctrl.getByName(req, res);
    }
    else {
        res.send({ err: 'No name specified' })
    }
});

app.get('/getFreeRotation', riot_api_ctrl.getFreeRotation)

app.listen(port, () => console.log(`Example server listening on port ${port}!`));