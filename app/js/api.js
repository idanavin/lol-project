window.League = {
    /**
     * Store application settings
     */
    config: {},

    BASE_URL: 'https://eun1.api.riotgames.com',

    init: function( opt ) {
        opt = opt || {};

        this.config.api_key_temp = opt.api_key_temp;
    },

    freeChampionRotation: function (callback) {  
        var endpoint = this.BASE_URL + '/lol/platform/v3/champion-rotations?api_key=' + this.config.api_key_temp;
        this.getJSON(endpoint, callback);
    },

    /**
     * Search summoner by name
     */
    searchByName: function( name, callback ) {
        var endpoint = this.BASE_URL + '/lol/summoner/v3/summoners/by-name/' + name + '?api_key=' + this.config.api_key_temp;
        this.getJSON( endpoint, callback );
    },

    getJSON: function( url, callback ) {
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            headers: {
                "Origin": "https://developer.riotgames.com",
                "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Riot-Token": "RGAPI-ea374b45-3e54-47c2-b421-32ddd851e8a6",
                "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
            },
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
    
    $('#form').on('submit', function (e) { 
        
        e.preventDefault();
        
        var searchName = $('#search').val();
        League.searchByName = (searchName, function (response) {  
           console.log(response);
            
            var $result = $('.content');
            $result.html(response.summonerLevel);
        });
     });

    //  $('.content').html(response)

});

