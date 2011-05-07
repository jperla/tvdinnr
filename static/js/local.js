// #TODO: jperla: related videos
// #TODO: jperla: home page
// #TODO: jperla: author pages
// #TODO: jperla: title and description on page
// #TODO: low: design: jperla: search youtube button

// ################### URL STUFF ######################
var load_page = function(search_target, content_target, side_target) {
    // accepts nothing. reloads video if video in url.
    // basically, a router
    var href = current_url();

    // ASSUMES search bar always present
    if (href == 'http://tvdinnr.com/#/') {
        window.location = url_for_video('tHqFWYYOUAM');
    }

    // video pages
    if(href.indexOf('#/v/') != -1) {
        var videoid = videoid_from_url(href);
        show_video(content_target, side_target, videoid);
    } else
    // query pages
    if(href.indexOf('#/q/') != -1) {
        var query = query_from_url(href);
        set_title(query + ' videos');
        $(search_target).find('input.search').val(query);
        $(search_target).find('.search-button').click();
    }

    // #TODO: jperla: add this fail!
    //$('#share').html('');
    //('#share').html(addthis_update(current_url(), $('title').text()));
}

var addthis_update = function(url, title) {
    var e = '<!-- AddThis Button BEGIN --><div class="addthis_toolbox addthis_default_style" addthis:url="' + url + '" addthis:title="' + title + '"><a class="addthis_button_facebook_like" fb:like:layout="button_count"></a><a class="addthis_button_tweet"></a><a class="addthis_counter addthis_pill_style"></a></div><script type="text/javascript">var addthis_config = {"data_track_clickback":true};</script><!-- AddThis Button END -->';
    return e;
}

var set_title = function(title) {
    $('title').text(title + ' - TVDinnr');
}

var truncate = function(text, chars) {    
    // accepts text, and number of chars max. attempts to truncate by words.    
    if(text.length <= chars) {        
        return text;
    } else {
        var t = text.substr(0, chars + 1);
        var words = t.split(' ');
        var fewer_words = words.slice(0, words.length - 1);
        var word_t = fewer_words.join(' ');
        if(word_t.length > (t.length / 2)) {
            return word_t + ' ...';
        } else {
            return t + ' ...';
        }
    }
}


var videoid_from_url = function(href) {
    // Accepts nothing. Returns the videoid if in url, #/v/<id>, else ''.
    if(href.indexOf('#') != -1) {
        var path = href.split('#', 2)[1];
        // assert path startswith
        if(path.length > 4) {
            var videoid = path.substr(3);
            return videoid;
        } else {
            return '';
        }
    } else {
        return '';
    }
}

var query_from_url = function(href) {
    // Accepts nothing. Returns the query if in url, #/q/<q>, else ''.
    if(href.indexOf('#') != -1) {
        var path = href.split('#', 2)[1];
        // assert path startswith
        if(path.length > 4) {
            var p = path.substr(3);
            return p;
        } else {
            return '';
        }
    } else {
        return '';
    }
}

var url_for_x = function(prefix, argument) {
    // Accepts prefix and argument. Returns canonical url for that argument.
    // Basically, returns #/<prefix>/arg .
    var root = document.location.href.split('#', 2)[0];
    return root + '#/' + prefix + '/' + argument;
}

// Accepts videoid. Returns canonical url for that video id.
var url_for_video = partial(url_for_x, 'v');

// Accepts query string. Returns canonical url for that search.
var url_for_query = partial(url_for_x, 'q');

// Accepts author. Returns canonical url for that author.
var url_for_author = partial(url_for_x, 'a');
// ################### URL STUFF ABOVE ######################

var widget_width = '640';

var facebook_code = function(url) {
    // Accepts local url. Returns facebook comments html code.
    var html = '<fb:comments href="' + url + '" num_posts="10" width="' + widget_width + '"></fb:comments>';
    return html;
}

var player_code = function(videoid) {
    // Accepts video id. Returns html code to show youtube widget.
    // rel=0 turns off related videos at end; autoplay=1 turns on autoplay
    var html = '<iframe id="player" type="text/html" width="' + widget_width + '" height="390" src="http://www.youtube.com/embed/' + videoid + '?enablejsapi=1&rel=0&autoplay=1&origin=tvdinnr.com" frameborder="0">'
    return html;
}

var local_facebook_code = function() {
    // Returns inputs to simulate a youtube player locally.
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


var live_player = function() {
    var is_increment = null;
    var v = $('.player .videotime')

    var position = function() {
        return 0;
    }
    
    var play = function() {
    }
    var pause = function() {
    }
    var init = function() {
    }
    return {
        play: play,
        pause: pause,
        position: position,
        init: init
    }
};

var yt_related_videos = function(videoid) {
    var url = 'http://gdata.youtube.com/feeds/api/videos/' + videoid + '/related';
    var p = $.getJSON(url, {'v':2,
                            'alt':'json',
    });
    return p;
}

var yt_search = function(query) {
    // Accepts query. Returns jsonp ajax promise.
    var url = 'http://gdata.youtube.com/feeds/api/videos?callback=?';
    var p = $.getJSON(url, {'q':query,
                                'max-results':20,
                                'v':2,
                                'alt':'json',
                                //'strict':'true',
                                // we want strictness;
                                // but jquery1.5 adds an _=timestamp
                                // argument, so can't be strict
    });
    return p;
}

var YtEntry = function(e) {
    // Accepts YouTube feed entry. Returns object with fields accessible.
    var title = function() {
        return e['title']['$t'];
    }
    var id = function() {
        var parts = e['id']['$t'].split(/(\/|\:)/g);
        return parts[parts.length - 1];
    }
    var published = function() {
        return e['published']['$t'];
    }
    var description = function() {
        return e['media$group']['media$description']['$t'];
    }
    var author = function() {
        return e['author'][0]['name']['$t'];
    }
    var thumbnail = function() {
        return 'http://i.ytimg.com/vi/' + id() + '/0.jpg'
    }
    var duration = function() {
        // #TODO: jperla: convert to int?
        return e['media$group']['yt$duration']['seconds'];
    }
    var rating_average = function() {
        return e['gd$rating']['average'];
    }
    var viewCount = function() {
        return e['yt$statistics']['viewCount'];
    }
    return {
        title: title,
        id: id,
        published: published,
        description: description,
        author: author,
        thumbnail: thumbnail,
        duration: duration,
        rating_average: rating_average,
        viewCount: viewCount
    }
}

var generic_xhr_error = function(jqxhr, textStatus, errorThrown) {
    // Accept standard xhr error args.  Alerts error to user.
    alert(textStatus) 
};

var a_href = function(href, text, class_name) {
    var html = '<a href="' + href + '"';
    if(class_name) {
        html += ' class="' + class_name + '"';
    }
    return html + '>' + text + '</a>';
}

var html_element = function(name, text) {
    // Accepts element name, and inner text. 
    // Returns string with html element.
    return '<' + name + '>' + text + '</' + name + '>';
}

var li = partial(html_element, 'li')
var strong = partial(html_element, 'strong')

var div = function(inner, class_name) {
    var html = '<div';
    if(class_name) {
        html += ' class="' + class_name + '"';
    }
    return html + '>' + inner + '</div>';
}

var img = function(src) {
    return '<img src="' + src + '" />';
}

var thousands = function(numstr) {
    // Improves readability.
    // Accepts numberstring. 
    // Recursively adds comma to last thousands place.
    if(numstr.length <= 3) {
        return numstr;
    } else {
        var a = numstr.length - 3;
        var b = numstr.length;
        return thousands(numstr.substr(0, a)) + ',' + numstr.substr(a, b);
    }
}

var search_system = function(search_box_target, content_target) {
    // accepts search area div, and content div.
    // activates search area to respond to changes, and
    // displays results in content.

    var html_search_result = function(e) {
        // accepts YtEntry. returns html string.
        var url = url_for_video(e.id());

        var thumb = div(a_href(url, img(e.thumbnail())), 'thumb link_video');
        var t = truncate(e.title(), 60);
        var title = div(a_href(url, t), 'link_video title');

        var description = div(truncate(e.description(), 150), 'description');

        // #TODO: low: jperla: add dates
        var a = e.author();

        // #TODO: low: jperla: add author urls
        //var author = 'by ' + a_href(url_for_author(a), a);
        var author = 'by ' + a;
        var views = strong(thousands(e.viewCount()) + ' views');

        // !! #TODO: jperla: add facebook comment counts

        // #TODO: very low: jperla: bar lengths indicating # views
        var info = div(author + ' | ' + views, 'info');

        var details = div(title + description + info, 'details');
        return div(thumb + details, 'result');
    }

    var results_from_json = function(json) {
        // accepts youtube results feed. returns array of youtube entries.
        var entries = json['feed']['entry'];
        return $.map(entries, function(e) {return YtEntry(e)});
    }

    var make_html = function(entries, html_func) {
        // accepts entry results, and func (entry => html)
        // returns concatenated html string.
        var html = $.map(entries, function(e) { return html_func(e); });
        return html.join('');
    }
    
    var success_forward_one_entry = function(callback) {
        return function(json) {
            var entry = YtEntry(json['entry']);
            callback(entry);
        };
    };

    var success_forward_entries = function(callback) {
        return function(json) {
            var entries = results_from_json(json);
            callback(entries);
        };
    };

    var yt_info = function(videoid, callback) {
        // accepts videoid, callback func that accepts YtEntry.
        // Find the video's info via jsonp youtube gdata api, 
        // sends to callback.
        var url = 'http://gdata.youtube.com/feeds/api/videos/' + videoid;
        var p = $.getJSON(url, {'v':2, 'alt':'json'});
        p.success(success_forward_one_entry(callback));
    }

    var related_videos = function(videoid, callback) {
        // accepts videoid, callback func that accepts array of [YtEntry].
        // Find the video's related videos via jsonp youtube gdata api, 
        // sends to callback.
        var url = 'http://gdata.youtube.com/feeds/api/videos/' + videoid + '/related';
        var p = $.getJSON(url, {'v':2, 'alt':'json'});
        p.success(success_forward_entries(callback));
    }

    var fill_results = function(json) {
        // accepts youtube results feed. 
        // fills content with search results.
        var results = results_from_json(json);
        var html = make_html(results, html_search_result);
        $(content_target).html(html, 'search-results');
    }

    var click_search = function(e) {
        var input = $(search_box_target).find('.search').eq(0);
        var query = input.val()
        var feed = yt_search(query);
        window.location.href = url_for_query(query);
        feed.success(fill_results);
        feed.error(generic_xhr_error);
    }

    var onkeydown = function(e) {
        // accepts keydown event.  if enter, then search youtube and show.
        if(e.keyCode == 13) { 
            click_search();
        }
    }

    var init = function () {
        // Creates event handler that monitors search box for enters.
        $(search_box_target).find('.search').live('keydown', onkeydown);
        $(search_box_target).find('.search-button').live('click', click_search);
    }

    return {
        init: init
    };
}


var random_sessionid = function() {
    // Accepts nothing, returns a random large integer
    return Math.floor(Math.random() * 100000000000000);
}

var local_show_video = function(content_target, side_target, videoid) {
    // accepts target, and videoid string. sets youtube and facebook there.
    var t = $(content_target)
    t.append(local_facebook_code());
    t.append('<h2>Facebook comments</h2>');
    player.init();
}

var live_show_video = function(content_target, side_target, videoid) {
    // accepts target, videoid. 
    // sets content to show video and facebook comments.
    
    // ASSUMES content target always exists

    var t = $(content_target)
    t.html('');
    t.append(player_code(videoid));
    t.append(facebook_code(url_for_video(videoid)));
    write_doc('http://connect.facebook.net/en_US/all.js#xfbml=1');
    player.init();
}


// Enables the live player, or local one for local development
if (!local) {
    player = live_player();
    show_video = live_show_video;
} else {
    player = local_player();
    show_video = local_show_video;
}

var current_url = function() {
    return document.location.href;
}

function partial(fn) {
    var slice = Array.prototype.slice;
    var args = slice.apply(arguments, [1]);
    return function () {
        return fn.apply(null, args.concat(slice.apply(arguments)));
    };
}

$(document).ready(function() {
    $('.logo').live('click', function() { window.location = '#/' });

    //# onload
    var videoid = videoid_from_url(current_url());

    if(!videoid) {
        /* default page */
        window.location = url_for_video('tHqFWYYOUAM');
    }

    // #TODO: jperla: make local search_system
    search_system('#search', '#content').init();
    var lp = partial(load_page, '#search', '#content', '#sidebar');
    lp()

    $(window).hashchange(lp);

    write_doc('http://s7.addthis.com/js/250/addthis_widget.js#pubid=jperla');
});


