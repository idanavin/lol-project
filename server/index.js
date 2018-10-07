const express = require('express');
const cors = require('cors');
const app = express();

const port = 3000;

const https = require('https');
const { URL } = require('url');
const champions = require('./assets-new').champions.data;
const __champion_list = { championsCount: 0 };
const __api_key = 'RGAPI-105a639e-2ef9-4fa4-a0a8-ed2fd09bbcd4';
const champoin_gg_api_key = '71279cee69531ab69effb87cb7ba6fa4';

app.use(cors());

let utils = {
    request: {
        set_url_request: (path) => {
            return new URL(`https://eun1.api.riotgames.com${path}?api_key=${__api_key}`);
        },

        set_url_request_championgg: (path) => {
            return new URL(`https://api.champion.gg/v2/champions${path}&api_key=${champoin_gg_api_key}`);
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
        ids_to_names: (ids) => {
            ids.forEach((id, index) => {
                ids[index] = utils.riot.champ_name_by_id(id);
            });
            return ids;
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
            Object.keys(champions).forEach(champName => {
                if (champName === name) {
                    id.push(champions[champName].key);
                }
            });
        },
        champions: () => {
            Object.keys(champions).forEach(champName => {
                let champId = champions[champName].key;
                __champion_list[champId] = champName;
                __champion_list.championsCount++;
            });
        },
        champ_name_by_id: (champ_id) => {
            return __champion_list[champ_id];
        },
        set_champion_matches: (matches) => {
            matches.forEach((match) => {
                match.champion = {
                    id: match.champion,
                    name: utils.riot.champ_name_by_id(match.champion)
                }
            });
        },
        findParticipantIdent: (match, sumId) => {
            let partId;
            Object.keys(match.participantIdentities).forEach(player => {
                let a = match.participantIdentities[player].player.accountId;
                let aToString = a + '';
                if (aToString == sumId) {
                    partId = match.participantIdentities[player].participantId;
                }
            });
            return partId;
        },
        findSummStat: (match, match_id) => {
            let playerStats;
            Object.keys(match.participants).forEach(player => {
                let a = match.participants[player].participantId;
                if (a = match_id) {
                    playerStats = match.participants[player].stats;
                }
            });
            return playerStats;
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
    getMatchlist: (req, res) => {
        const result = { 'data': '' };
        const url = utils.request.set_url_request(`/lol/match/v3/matchlists/by-account/${req.query.id}`);
        utils.request.set_request(url, result, () => {
            let data = JSON.parse(result.data);
            let last_matches = data.matches.slice(0, 10);
            utils.riot.set_champion_matches(last_matches);
            res.send(last_matches);
        }, (err) => {
            res.send({ "err": err });
        });
    },
    getMatchById: (req, res) => {
        const result = { 'data': '' };
        const url = utils.request.set_url_request(`/lol/match/v3/matches/${req.query.id}`);
        utils.request.set_request(url, result, () => {
            let data = JSON.parse(result.data);
            let particId = utils.riot.findParticipantIdent(data, req.query.summonerid);
            let stats = utils.riot.findSummStat(data, particId);
            res.send(stats);
        }, (err) => {
            res.send({ "err": err });
        });
    },
    getFreeRotation: (req, res) => {
        const result = { 'data': '' };
        const url = utils.request.set_url_request(`/lol/platform/v3/champion-rotations`);
        utils.request.set_request(url, result, () => {
            let champ_ids = JSON.parse(result.data);
            const champ_names = utils.riot.ids_to_names(champ_ids.freeChampionIds);
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
                const id_rdy = [];
                let champ_ids = JSON.parse(result.data);
                utils.riot.data_to_id(champ_ids.champions, id_rdy);
                const champ_names = utils.riot.ids_to_names(id_rdy);
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
    getChampiongg: (req, res) => {
        const params = '?elo=PLATINUM,DIAMOND,MASTER,CHALLENGER&limit=200&champData=kda,damage,positions,summoners,skills,finalitems';
        const result = { 'data': '' };
        const champ_id = [];
        const champ_name = req.query.name;
        utils.riot.name_to_id(champ_name, champ_id);
        champ_id_rdy = champ_id[0];
        const url = utils.request.set_url_request_championgg(`/${champ_id_rdy}${params}`);
        utils.request.set_request(url, result, () => {
            console.log(result);

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

app.get('/getMatch', (req, res) => {
    if (req.query.id) {
        riot_api_ctrl.getMatchById(req, res);
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

utils.riot.champions();

app.listen(port, () => console.log(`Example server listening on port ${port}!`));
