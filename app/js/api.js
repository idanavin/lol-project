window.utils = {
    timestamp_convert: function (stamp, time) {  
        var a = new Date(stamp);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDay();
        var hour = a.getHours();
        var min = a.getMinutes();
        // var sec = a.getSeconds();
        // var time = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min ;
        return time;
    }

}

window.League = {
    /**
     * Store application settings
     */
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
    createMatchlist: function (res) {    
        let new_data = [];    
        if (res.matches) {
            res.matches.forEach(function (a_match) {  
                if (new_data.length < 10) {
                    new_data.push(a_match);
                }
            });
            //Make timestamp into time
            let date = '';
            let timestamp = [];
            new_data.forEach(function (match) {
                timestamp.push(match.timestamp);
            });
            timestamp.forEach(function (a_match) {  
                let single_stamp = a_match;
                utils.timestamp_convert(single_stamp, date);
            });
            $('.matchhistory').appnd('<div class="matchhistory__champion">');
        }
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
            var $mainContent = $('.main__content')
            $mainContent.html('');
            for (let i = 0; i < res.data.length; i++) {
                $mainContent.append('<p class="champion">' +
                    '<img class="champion__img" src="http://ddragon.leagueoflegends.com/cdn/' + League.LOL_VER + '.1/img/champion/'
                    + res.data[i] + '.png" />'
                    + '<span class="champion__name">' + res.data[i] + '</span>' + '</p>');
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
            $mainContent.html('');
            for (var i = 0; i < res.data.length; i++) {
                $mainContent.append('<p class="champion">' +
                    '<img class="champion__img" src="http://ddragon.leagueoflegends.com/cdn/' + League.LOL_VER + '.1/img/champion/'
                    + res.data[i] + '.png" />'
                    + '<span class="champion__name">' + res.data[i] + '</span>' + '</p>');
            }
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
                        + '<div class="summoner__level" >Summoner Level: ' + res.summonerLevel + '</div><div class="match__history"></div></div>');
                    //$('#content').html(res.summonerLevel);
                }
                else if (res.status) {
                    console.log(res.status.message);
                }
                League.getMatchlist(res.accountId, function (res) {  
                    if (res.matches)
                    {League.createMatchlist (res)}
                    else {console.log('no res.matches', res);
                    }
                });
            }
            else if (res.err) { console.error(res.err); }
        });
    });
});

