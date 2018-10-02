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
                    $('.main__content').html('<div class="summoner--info">' +
                        '<img class="summoner--icon" src="http://ddragon.leagueoflegends.com/cdn/8.19.1/img/profileicon/' + res.profileIconId + '.png" />'
                        + '<div class="summoner--name">Summoner name: ' + res.name + '</div>'
                        + '<div class="summoner--level" >Summoner Level: ' + res.summonerLevel + '</div></div>');
                    //$('#content').html(res.summonerLevel);
                }
                else if (res.status) {
                    console.log(res.status.message);
                }
            }
            else if (res.err) { console.error(res.err); }
        });
    });
});

