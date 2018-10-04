const express = require('express');
const cors = require('cors');
const app = express();

const port = 3000;

const https = require('https');
const { URL } = require('url');
const champoins = require('./assets-new').champions.data;
const api_key = 'RGAPI-3c3fe831-9772-4f6a-878d-27d3769b4cc3';

// function timeOut() {
//     let timeout = setTimeout(parseChamps, 3000);
// }
// function parseChamps(champ_ids) {
//     if (typeof result !== 'undefined') {
//         champ_ids = JSON.parse(result);
//     }
// }

app.use(cors());

let utils = {
    request: {
        set_url_request: (path) => {
            return new URL(`https://eun1.api.riotgames.com${path}?api_key=${api_key}`);
        },

        set_request: (url, result, cbr, cbe) => {
            // Build the request
            let req = https.request(url, (res) => {
                res.setEncoding('utf8');
                // Data event
                res.on('data', (data) => {
                    result.data += data;
                });
                // End Event
                res.on('end', cbr);
            });
            // Error handler
            req.on('error', cbe);
            // End behavior
            req.end();
        }
    },
    riot: {
        ids_to_names: (ids, buffer) => {
            Object.keys(champoins).forEach(champName => {
                if (ids.length > buffer.length) {
                    let index = ids.find(id => champoins[champName].key == id);
                    if (index !== undefined) {
                        buffer.push(champName);
                    }
                    else { return; }
                }
            });
        },
        data_to_id: (ids, buffer) => {
            ids.forEach(champID => {
                buffer.push(champID.id);
            });
        },
        champion_to_id: (ids, buffer) => {
            ids.forEach(champID => {
                buffer.push(champID.champion);
            });
        },
        name_to_id: (name, id) => {
            Object.keys(champoins).forEach(champName => {
                if(champName === name){
                    id.push(champoins[champName].key);
                }
            });
        }
    }
};

let riot_api_ctrl = {
    getByName: (req, res) => {
        const result = { 'data': '' };
        const url = utils.request.set_url_request(`/lol/summoner/v3/summoners/by-name/${req.query.name}`);
        utils.request.set_request(url, result, () => {
            res.send(result);
        }, (err) => {
            res.send({ "err": err });
        });
    },
    getMatchlist: (req, res_match) => {
        const result = { 'data': '' };
        const url = utils.request.set_url_request(`/lol/match/v3/matchlists/by-account/${req.query.id}`);
        utils.request.set_request(url, result, () => {
            let data = JSON.parse(result.data)
            let new_data = [];
            data.matches.forEach(a_match => {  
                if (new_data.length < 10) {
                    new_data.push(a_match);
                }
            });

            const champion_name = [];
            const id_rdy = [];
            utils.riot.champion_to_id(new_data, id_rdy);
            // const id_rdy_obj = { 'data': id_rdy }
            utils.riot.ids_to_names(id_rdy, champion_name)
            const champion_name_obj = { 'data': champion_name }
            // champion_name.forEach(name => {champion_name[name]})
            new_data.forEach(match => {new_data[match] += champion_name_obj.data[match]}); //not working not the right place to add it
            console.log(new_data);
            
            res_match.send(new_data);
        }, (err) => {
            res_match.send({ "err": err });
        });
    },
    getFreeRotation: (req, res) => {
        const result = { 'data': '' };
        const url = utils.request.set_url_request(`/lol/platform/v3/champion-rotations`);
        utils.request.set_request(url, result, () => {
            const champ_names = [];
            let champ_ids = JSON.parse(result.data);
            utils.riot.ids_to_names(champ_ids.freeChampionIds, champ_names);
            champ_names.sort((a, b) => a.toUpperCase() <= b.toUpperCase() ? -1 : 1);
            result.data = champ_names;
            res.send(result);

        }, (err) => {
            res.send({ "err": err });
        });
    },
    getChampions: (req, res) => {
        const result = { 'data': '' };
        const url = utils.request.set_url_request(`/lol/platform/v3/champions`);
        utils.request.set_request(url, result,
            () => {
                const champ_names = [];
                const id_rdy = [];
                let champ_ids = JSON.parse(result.data);
                utils.riot.data_to_id(champ_ids.champions, id_rdy);
                utils.riot.ids_to_names(id_rdy, champ_names);
                champ_names.sort((a, b) => a.toUpperCase() <= b.toUpperCase() ? -1 : 1);
                result.data = champ_names;
                res.send(result);
            },
            err => {
                res.send({ "err": err });
            });
    },
    getChampion: (req, res) => {
        const result = { 'data': '' };
        const champ_id = [];
        const champ_name = req.query.name;
        utils.riot.name_to_id(champ_name, champ_id);
        const url = utils.request.set_url_request(`/lol/platform/v3/champions/${champ_id}`);
        utils.request.set_request(url, result, () => {
            res.send(result);
        }, (err) => {
            res.send({ "err": err });
        });
    },
};

app.get('/getMatchlist', (req, res) => {
    if (req.query.id) {
        riot_api_ctrl.getMatchlist(req, res);
    }
    else {
        res.send({ err: 'No name specified' })
    }
});

app.get('/getChampion', (req, res) => {
    if (req.query.name) {
        riot_api_ctrl.getChampion(req, res);
    }
    else {
        res.send({ err: 'No name specified' })
    }
});

app.get('/getByName', (req, res) => {
    if (req.query.name) {
        riot_api_ctrl.getByName(req, res);
    }
    else {
        res.send({ err: 'No name specified' })
    }
});

app.get('/getChampions', riot_api_ctrl.getChampions)

app.get('/getFreeRotation', riot_api_ctrl.getFreeRotation)

app.listen(port, () => console.log(`Example server listening on port ${port}!`));