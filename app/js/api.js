window.League = {
    /**
     * Store application settings
     */
    config: {},

    BASE_URL: 'https://eun1.api.riotgames.com',
    LOL_VER: '8.19',

    init: function( opt ) {
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

    getChampion: function (callback) {  
        var endpoint = 'http://localhost:3000/getChampion?champ=' + champId;
        this.getJSON(endpoint, callback);
    },

    /**
     * Search summoner by name
     */
    searchByName: function( name, callback ) {
        var endpoint = 'http://localhost:3000/getByName?name=' + name;
        this.getJSON( endpoint, callback );
    },

    getJSON: function( url, callback ) {
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            success: function( response ) {
                if ( typeof callback === 'function' ) callback( response );
            }
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
            $('.content').html('<div class="champion_container"><div class="champions"><div class="main_message">Free Champion Rotation</div></div>');
            for (var i = 0; i < res.result.names.length; i++){
                $('.champions').append( '<p class="champion_img">' +
                '<img src="http://ddragon.leagueoflegends.com/cdn/'+ League.LOL_VER +'.1/img/champion/' 
                + res.result.names[i] + '.png" /></a>'
                + res.result.names[i] + '</p>');
                let championName = res.result.names[i];
                $('p:last').on('submit', function (e) {  
                    e.preventDefault();
                    League.getChampion(championName, function (res) {  
                        console.log(championName);
                        
                    });
                });
            }
            $('.champions').append('</div>');
        })
    });

    $('#champs').on('submit', function (e) {  
        e.preventDefault();
        League.getChampions(function (res) {
            $('.content').html('<div class="champions"><div class="main_message">Champions</div></div>');
            for (var i = 0; i < res.result.names.length; i++){
                $('.champions').append( '<p class="champion_img">' + 
                '<img src="http://ddragon.leagueoflegends.com/cdn/'+ League.LOL_VER +'.1/img/champion/' 
                + res.result.names[i] + '.png" />'
                + res.result.names[i] + '</p>');
            }
        })
    });
    
    $('#form').on('submit', function (e) { 
        
        e.preventDefault();
        var searchName = $('#search').val();
        League.searchByName(searchName, function (res) {
            if (res.result) {
                res = JSON.parse(res.result);
                if (res.id) {
                    $('.content').html( '<div class="summoner--info">' +
                    '<img class="summoner--icon" src="http://ddragon.leagueoflegends.com/cdn/8.19.1/img/profileicon/' + res.profileIconId + '.png" />'
                    + '<div class="summoner--name">Summoner name: ' + res.name + '</div>'
                    + '<div class="summoner--level" >Summoner Level: ' + res.summonerLevel + '</div></div>');
                    //$('#content').html(res.summonerLevel);
                }
                else if (res.status) {
                    console.log(res.status.message);
                }
            }
            else if (res.err) {console.error(res.err);}
        });
     });
});

