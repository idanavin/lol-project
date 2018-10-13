window.utils = {
    timestamp_convert: function (stamp, time) {
        var a = new Date(stamp);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDay();
        var hour = a.getHours();
        var min = a.getMinutes();
        // var sec = a.getSeconds();
        // var time = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min;
        return time;
    },
    time_convert: function (time) {   
        // Hours, minutes and seconds
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = ~~time % 60;
    
        // Output like "1:01" or "4:03:59" or "123:03:59"
        var ret = "";
    
        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }
    
        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    }
}

window.League = {
    config: {},

    BASE_URL: 'https://eun1.api.riotgames.com',
    LOL_VER: '8.19',

    init: function (opt) {
        opt = opt || {};

        this.config.api_key_temp = opt.api_key_temp;
    },

    freeChampionRotation: function (callback) {
        var endpoint = 'http://localhost:3000/getFreeRotation';
        this.getJSON(endpoint, callback);
    },

    getChampions: function (callback) {
        var endpoint = 'http://localhost:3000/getChampions';
        this.getJSON(endpoint, callback);
    },

    getChampion: function (champId, callback) {
        var endpoint = 'http://localhost:3000/getChampion?name=' + champId;
        this.getJSON(endpoint, callback);
    },

    /**
     * Search summoner by name
     */
    searchByName: function (name, callback) {
        var endpoint = 'http://localhost:3000/getByName?name=' + name;
        this.getJSON(endpoint, callback);
    },
    getMatchlist: function (accountId, callback) {
        var endpoint = 'http://localhost:3000/getMatchlist?id=' + accountId;
        this.getJSON(endpoint, callback);
    },
    getMatchById: function (gmaeId, sumId, callback) {
        var endpoint = 'http://localhost:3000/getMatch?id=' + gmaeId + '&summonerid=' + sumId;
        this.getJSON(endpoint, callback);
    },
    createMatchlist: function (res, summ_id) {
        if (res) {
            //Make timestamp into time
            // let date = '';
            // let timestamp = [];
            // res.matches.forEach(function (match) {
            //     timestamp.push(match.timestamp);
            // });
            // timestamp.forEach(function (a_match) {  
            //     let single_stamp = a_match;
            //     utils.timestamp_convert(single_stamp, date);
            // });
            $matchHistory = $('.matchhistory');
            for (var i = 0; i < res.length; i++) {
                $matchHistory.append('<div class="matchhistory__match" id="match' + i + '"><p class="matchhistory_img" id="png' + i + '">' +
                    '<img class="matchhistory__champion_img" src="http://ddragon.leagueoflegends.com/cdn/' + League.LOL_VER + '.1/img/champion/'
                    + res[i].champion.name + '.png" />'
                    + '<span class="champion__name">' + res[i].champion.name.replace(/([A-Z])/g, ' $1').trim() + '</span></p></div>');
                let index = i;
                League.getMatchData(res[i].gameId, summ_id, index);

            }
        }
    },
    getMatchTeams: () => {

    },
    getMatchData: (gameId, sumId, index) => {
        League.getMatchById(gameId, sumId, function (res) {
            let addToMatch = "#match" + index;
            let addToImg = "#png" + index;
            if (res.participantId) {
                let teamId = res.teamId;
                let teamDeaths = res.teamScore[teamId].deaths;
                let feederMeter = 'FEEDER'
                let kda = (res.stats.kills + res.stats.assists) / res.stats.deaths;
                let won = 'Defeat'
                if (res.gameDuration < 500) { won = 'Remake'; $(addToMatch).addClass('__remake');}
                else if (res.stats.win === true) { won = 'Victory'; }
                console.log(res);
                
                if ((res.stats.deaths / teamDeaths) < 0.5) {
                    feederMeter = 'Not feeder'
                }
                $(addToMatch).prepend('<p class="matchhistory_win_time"><span class="matchhistory__text">' + won + '</span>' +
                '<span class="matchhistory__text">' + utils.time_convert(res.gameDuration) + '</span></p>');
                $(addToImg).append(
                    '<img class="matchhistory__summoner_img" src="http://ddragon.leagueoflegends.com/cdn/' + League.LOL_VER + '.1/img/spell/'
                    + res.spellname1 + '.png" />' + 
                    '<img class="matchhistory__summoner_img matchhistory__summoner_second" src="http://ddragon.leagueoflegends.com/cdn/' + League.LOL_VER + '.1/img/spell/'
                    + res.spellname2 + '.png" />');

                if (res.gameDuration > 500) {
                    $(addToMatch).append('<p class="matchhistory_data"><span class="matchhistory__text">' + 
                    res.stats.kills + ' / ' + res.stats.deaths + ' / ' + res.stats.assists + '</span>' +
                    '<span class="matchhistory__text matchhistory__text__small">' + kda.toFixed(2) + ' KDA</span>' +
                    '<span class="matchhistory__text matchhistory__text__small">' + feederMeter + '</span></p>');
                }
                else {
                    $(addToMatch).append('<p class="matchhistory_data"><span class="matchhistory__text">Match ended with a remake</span></p>');
                }
            }
            else {
                console.log('not the right results', res);
            }
        });
        // console.log(a);
        // return a;
    },
    getJSON: function (url, callback) {
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            success: function (response) {
                if (typeof callback === 'function') callback(response);
            }
        });
    },
    setChampUrl: function (name) {
        $('.champion:last').on('click', function (e) {
            e.preventDefault();
            console.log('clicked');
            League.getChampion(name, function (res) {
                console.log(res.data);

            });
        });
    },
    championLoader: function ($mainDiv) {
        $mainDiv.html('<div class="champion__grid"></div>');
        var timer = 200;
        
        for (var i = 0; i < 15; i++) {
            var timeout = setTimeout(function () {
                $('.champion__grid').append('<p class="emptybox"></p>');
                $('.emptybox').fadeIn('slow');
            }, timer);
            timer += 200;
        }
        clearTimeout(timeout);
        setTimeout(function () {
            $('.emptybox').fadeOut(500, function () {
                $('.emptybox').remove();
                $('.champion').fadeIn()
            });
        }, 3000);
    }
};

League.init({
    api_key_temp: _api.key
});

$(document).ready(function () {

    $('#rotation').on('submit', function (e) {
        e.preventDefault();
        League.freeChampionRotation(function (res) {
            $('.main__header').html('Free Champion Rotation');
            var $mainContent = $('.main__content');
            League.championLoader($mainContent);
            $championGrid = $('.champion__grid');
            for (let i = 0; i < res.data.length; i++) {
                $championGrid.append('<p class="champion hidden">' +
                    '<img class="champion__img" src="http://ddragon.leagueoflegends.com/cdn/' + League.LOL_VER + '.1/img/champion/'
                    + res.data[i] + '.png" />'
                    + '<span class="champion__name">' + res.data[i].replace(/([A-Z])/g, ' $1').trim() + '</span>' + '</p>');
                let res_curr_name = res.data[i];
                League.setChampUrl(res_curr_name);
            }
        });
    });

    $('#champs').on('submit', function (e) {
        e.preventDefault();
        League.getChampions(function (res) {
            $('.main__header').html('Champions');
            var $mainContent = $('.main__content');
            League.championLoader($mainContent);
            $championGrid = $('.champion__grid');
            for (var i = 0; i < res.data.length; i++) {
                $championGrid.append('<p class="champion hidden">' +
                    '<img class="champion__img" src="http://ddragon.leagueoflegends.com/cdn/' + League.LOL_VER + '.1/img/champion/'
                    + res.data[i] + '.png" />'
                    + '<span class="champion__name">' + res.data[i].replace(/([A-Z])/g, ' $1').trim() + '</span>' + '</p>');
            }
            $('.snaptarget').droppable({
                accept: '.champion', drop: function (event, ui) {
                    $('.snaptarget').html('');
                    ui.draggable.clone().appendTo($('.snaptarget'));
                }
            });
            $(function () {
                $('.champion').draggable({ snap: ".snaptarget", helper: "clone", opacity: 0.35, revert: 'invalid' });
            });
        });
    });

    $('#form').on('submit', function (e) {

        e.preventDefault();
        var searchName = $('#search').val();
        League.searchByName(searchName, function (res) {
            if (res.data) {
                res = JSON.parse(res.data);
                if (res.id) {
                    $('.main__content').html('<div class="summoner">' +
                        '<img class="summoner__icon" src="http://ddragon.leagueoflegends.com/cdn/8.19.1/img/profileicon/' + res.profileIconId + '.png" />'
                        + '<div class="summoner__name">Summoner name: ' + res.name + '</div>'
                        + '<div class="summoner__level" >Summoner Level: ' + res.summonerLevel + '</div><div class="matchhistory"></div></div>');
                    //$('#content').html(res.summonerLevel);
                }
                else if (res.status) {
                    console.log(res.status.message);
                }
                let accId = res.accountId
                League.getMatchlist(accId, function (res) {
                    if (res[0].gameId) { League.createMatchlist(res, accId) }
                    else {
                        console.log('no res.matches', res);
                    }
                });
            }
            else if (res.err) { console.error(res.err); }
        });
    });
});
