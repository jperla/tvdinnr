var videoid_from_url = function() {
    var href = document.location.href;
    if(href.indexOf('#') != -1) {
        var path = href.split('#', 2)[1];
        // assert path startswith
        if(path.length > 8) {
            var videoid = path.substr(7);
            return videoid;
        } else {
            return '';
        }
    } else {
        return '';
    }
}

var url_for_video = function(videoid) {
    var root = document.location.href.split('#', 2)[0];
    return root + '#/video/' + videoid
}

var widget_width = '640';

var facebook_code = function(url) {
    var html = '<div id="fb-root"></div><fb:comments href="' + url + '" num_posts="10" width="' + widget_width + '"></fb:comments>';
    return html;
}

var player_code = function(videoid) {
    var html = '<iframe id="player" type="text/html" width="' + widget_width + '" height="390" src="http://www.youtube.com/embed/' + videoid + '?enablejsapi=1&origin=tvdinnr.com" frameborder="0">'
    return html;
}

var local_facebook_code = function() {
    var inner = '<input type="text" value="0" class="videotime"/>' +
                '<input type="submit" value="play" class="play">' +
                '<input type="submit" value="pause" class="pause">';
    return '<div class="player" style="width:480px;height:390px">' + inner + '</div>';
}

var player = null;

var local_player = function() {
    var is_increment = null;
    var v = $('.player .videotime')

    var increment = function() {
        v.attr('value', parseInt(v.attr('value')) + 1);
    };
    var position = function() {
        return v.attr('value');
    }
    
    var play = function() {
        if (is_increment === null) {
            is_increment = setInterval(increment, 1000);
        }
    }
    var pause = function() {
        if (is_increment !== null) {
            clearInterval(is_increment);
            is_increment = null;
        }
    }
    var init = function() {
        $('.player .play').live('click', player.play);
        $('.player .pause').live('click', player.pause);
    }
    return {
        play: play,
        pause: pause,
        position: position,
        init: init
    }
};

var search_system = function(search_box) {
    search_box.find('.search').live('keyup', );
    return {};
}


if (!local) {
    // todo
} else {
    player = local_player();
}

var random_sessionid = function() {
    return Math.floor(Math.random() * 100000000000000);
}

$(document).ready(function() {
    //# onload
    var videoid = videoid_from_url();
    if(!videoid) {
        /* default page */
        videoid = 'NnSxOfYatg8';
        window.location = url_for_video(videoid);
    }
    if (!local) {
        $('#content').append(player_code(videoid));
        $('#content').append(facebook_code(url_for_video(videoid)));
    } else {
        $('#content').append(local_facebook_code());
        $('#content').append('<h2>Facebook comments</h2>');
    }
    player.init();
});
