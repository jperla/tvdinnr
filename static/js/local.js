/*jslint white: true, onevar: true, undef: true, nomen: true, regexp: true, plusplus: true, bitwise: true, newcap: true, strict: false, maxerr: 50, indent: 4 */

// #TODO: jperla: put video name in url

// #TODO: jperla: add time length to videos bottom right corner
// #TODO: jperla: category browse
// #TODO: jperla: about, press, twitter, etc pages

// wget -S http://gawker.com/5799240/the-sad-pink-donkey-who-ignited-a-taco+boycotting-revolution -U "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
// #TODO: jperla: linter

// #TODO: jperla: when search, show 2 quick jump previews

// #TODO: low: design: jperla: search youtube button
// #TODO: low: design: jperla: youtube search entry results prettier

// ################### URL STUFF ######################

var load_page = function(search_target, content_target, side_target) {
    // accepts nothing. reloads video if video in url.
    // basically, a router
    var href = current_url();
    relocate_bad_url(href);

    // #TODO: jperla: really bad
    // #TODO: jperla: need to generalize page display
    $('#sidebar').css('display', 'block');


    // ASSUMES search bar always present
    if (href == 'http://tvdinnr.com/#/') {
        home_page(content_target, side_target);
    } else
    // video pages
    if(href.indexOf('#/v/') != -1) {
        var videoid = videoid_from_url(href);
        show_video(content_target, side_target, videoid);
    } else
    // query pages
    if(href.indexOf('#/q/') != -1) {
        var query = query_from_url(href);
        set_title(query + ' videos');
        $(side_target).find('.related').html(''); // #TODO: jperla: generalize
        $(side_target).find('.info').html(''); // #TODO: jperla: generalize
        $(search_target).find('input.search').val(query);
        $(search_target).find('.search-button').click();
    } else
    if(href.indexOf('#/a/') != -1) {
        // #TODO: jperla: do proper author videos
    }

    // scroll to top of window
    scrollTo(0, 0);

    // track page view on google analytics
    _gaq.push(['_trackPageview', '/#' + hash_tag(current_url())]);

    // update like buttons
    $('#share').html('');
    $('#share').html(addthis_update(current_url(), $('title').text()));
    addthis.toolbox('#adtb');
}

var addthis_update = function(url, title) {
    var e = '<!-- AddThis Button BEGIN --><div id="adtb" class="addthis_toolbox addthis_default_style" addthis:url="' + url + '" addthis:title="' + title + '"><a class="addthis_button_facebook_like" fb:like:layout="button_count"></a><a class="addthis_button_tweet"></a><a class="addthis_counter addthis_pill_style"></a></div><script type="text/javascript">var addthis_config = {"data_track_clickback":true};</script><!-- AddThis Button END -->';
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
    // Accepts url. Returns the videoid if in url, #/v/<id>, else ''.
    var path = hash_tag(href);
    // assert path startswith
    if(path.length > 4) {
        var videoid = path.substr(3);
        return videoid;
    } else {
        return '';
    }
}

var hash_tag = function(url) {
    // Accepts url. Returns the part after hash tag, #<hash>, else '/'.
    if(url.indexOf('#') != -1) {
        var h = url.split('#', 2)[1];
        if(h.length > 0 && h[0] == '/') {
            return h;
        } else {
            return '/';
        }
    } else {
        return '/';
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
var url_for_author = partial(url_for_x, 'q');
// ################### URL STUFF ABOVE ######################


var widget_width = '640';

var facebook_code = function(url) {
    //var html = '<div id="fb-root"></div><fb:comments href="' + url + '" num_posts="10" width="' + widget_width + '"></fb:comments>';
    // Accepts local url. Returns facebook comments html code.
    var html = '<div class="fb-comments" data-href="' + url + '" data-num-posts="20" data-width="' + widget_width + '"></div>'
    html += '<script>(function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id; js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=213072778706255"; fjs.parentNode.insertBefore(js, fjs); }(document, "script", "facebook-jssdk"));</script>';
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

// #TODO: jperla: double related videos funcs?
var yt_related_videos = function(videoid) {
    var url = 'http://gdata.youtube.com/feeds/api/videos/' + videoid + '/related?callback=?';
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
        try {
            return e['yt$statistics']['viewCount'];
        } catch(err) {
            return '0';
        }
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
var h1 = partial(html_element, 'h1')
var h2 = partial(html_element, 'h2')

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

var related_videos = function(videoid, callback) {
    // accepts videoid, callback func that accepts array of [YtEntry].
    // Find the video's related videos via jsonp youtube gdata api, 
    // sends to callback.
    var url = 'http://gdata.youtube.com/feeds/api/videos/' + videoid + '/related?callback=?';
    var p = $.getJSON(url, {'v':2, 'alt':'json'});
    p.success(success_forward_entries(callback));
}

var make_html = function(entries, html_func) {
    // accepts entry results, and func (entry => html)
    // returns concatenated html string.
    var html = $.map(entries, function(e) { return html_func(e); });
    return html.join('');
}

var html_yt_entry_small = function(e) {
    // accepts YtEntry. returns html string.
    var url = url_for_video(e.id());

    var thumb = div(a_href(url, img(e.thumbnail())), 'thumb link_video');

    var t = truncate(e.title(), 50);
    var title = div(a_href(url, t), 'link_video title');
    var author = div('by ' + e.author(), 'author');
    var views = div(thousands(e.viewCount()) + ' views', 'views');

    var details = div(title + author + views, 'details');
    return div(thumb + details, 'result-small');
}


var html_yt_entry_big = function(e) {
    // accepts YtEntry. returns html string.
    var url = url_for_video(e.id());

    var thumb = div(a_href(url, img(e.thumbnail())), 'thumb link_video');
    var t = truncate(e.title(), 60);
    var title = div(a_href(url, t), 'link_video title');

    var description = div(truncate(e.description(), 150), 'description');

    // #TODO: low: jperla: add dates
    var a = e.author();

    var author = 'by ' + a_href(url_for_author(a), a);
    var views = strong(thousands(e.viewCount()) + ' views');

    // #TODO: very low: jperla: bar lengths indicating # views
    var info = div(author + ' | ' + views, 'info');

    // fb comments counts
    //#TODO: jperla: add comments
    var comments = ''; //div('<fb:comments-count href="' + url + '"></fb:comments-count> comments', 'comments');

    var details = div(title + description + info + comments, 'details');
    return div(thumb + details, 'result');
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

var author_videos = function(author_username, callback) {
    var url = 'http://gdata.youtube.com/feeds/api/users/' + author_username + '/uploads?callback=?'
    var p = $.getJSON(url, {'v':2, 'alt':'json'});
    p.success(success_forward_entries(callback));
}

var standard_feed = function(url, callback) {
    // accepts feed url, callback func that accepts array of [YtEntry].
    // Find the videod of that urls feed, then
    // sends to callback.
    var new_url = url + '&callback=?';
    var p = $.getJSON(new_url, {'alt':'json'});
    p.success(success_forward_entries(callback));
}

var most_popular = partial(standard_feed, 'http://gdata.youtube.com/feeds/api/standardfeeds/most_popular?v=2&time=today');
var most_viewed = partial(standard_feed, 'http://gdata.youtube.com/feeds/api/standardfeeds/most_viewed?v=2&time=today');
var most_shared = partial(standard_feed, 'http://gdata.youtube.com/feeds/api/standardfeeds/most_shared?v=2');
var most_discussed = partial(standard_feed, 'http://gdata.youtube.com/feeds/api/standardfeeds/most_discussed?v=2&time=today');

var recently_featured = partial(standard_feed, 'http://gdata.youtube.com/feeds/api/standardfeeds/recently_featured?v=2');
var trending_videos = partial(standard_feed, 'http://gdata.youtube.com/feeds/api/standardfeeds/on_the_web?v=2');
var most_recent = partial(standard_feed, 'http://gdata.youtube.com/feeds/api/standardfeeds/most_recent?v=2');


var yt_info = function(videoid, callback) {
    // accepts videoid, callback func that accepts YtEntry.
    // Find the video's info via jsonp youtube gdata api, 
    // sends to callback.
    var url = 'http://gdata.youtube.com/feeds/api/videos/' + videoid + '?callback=?';
    var p = $.getJSON(url, {'v':2, 'alt':'json'});
    p.success(success_forward_one_entry(callback));
}




var results_from_json = function(json) {
    // accepts youtube results feed. returns array of youtube entries.
    var entries = new Array();
    var feed = json['feed'];
    // if no results, no entry
    if('entry' in feed) {
        entries = feed['entry'];
    }
    return $.map(entries, function(e) {return YtEntry(e)});
}

var cache_on_first_arg = function(arg_cache, func) {
    // accepts func that takes one arg X , and callback that accepts one arg Y.
    // returns new func that caches result Y from arg X in a dict.
    // speeds up the function by caching.
    // ASSUMES func returns nothing.
    var new_func = function(X, callback) {
        var new_callback = function(Y) {
            arg_cache[X] = Y;
            callback(Y);
        }
        /* Clear arg cache if too big! */
        if(arg_cache.length > 10000) {
            arg_cache = new Array();
        }
        // end
        if(X in arg_cache) {
            callback(arg_cache[X]);
        } else {
            func(X, new_callback);
        }
    }
    return new_func;
}

var cache_ytentries = function(cache_dict, func) {
    // accepts cache dict, function that accepts one arg and returns list of YtEntries.
    // returns wrapped function.
    // caches results which are YtEntries in the cache dict
    return function(arg) {
        var results = func(arg);
        for(var i=0;i<results.length;i++) {
            var r = results[i];
            var id = r.id();
            if(!(id in cache_dict)) {
                cache_dict[id] = r;
            }
        }
        return results;
    }
}

var ytentry_cache = new Array();
yt_info = cache_on_first_arg(ytentry_cache, yt_info);
results_from_json = cache_ytentries(ytentry_cache, results_from_json);

var home_page = function(content_target, side_target) {
    set_title('TVDinnr: civilized conversation - it\'s YouTube with Facebook comments');
    var fill_callback = function(target, results) {
        var html = make_html(results, html_yt_entry_small);
        $(target).html(html);
    }
    $(content_target).html(div('<h2>Most Popular</h2>' + div(''), 'home1') + div('<h2>Most Shared</h2>' + div(''), 'home2') + div('<h2>Most Discusssed</h2>' + div(''), 'home3'));
    $('#sidebar').css('display', 'none');

    most_popular(partial(fill_callback, '.home1 div'));
    most_shared(partial(fill_callback, '.home2 div'));
    most_discussed(partial(fill_callback, '.home3 div'));
}

var search_system = function(search_box_target, content_target) {
    // accepts search area div, and content div.
    // activates search area to respond to changes, and
    // displays results in content.

    var top_rated = partial(standard_feed, 'http://gdata.youtube.com/feeds/api/standardfeeds/top_rated');
    var top_favorites = partial(standard_feed, 'http://gdata.youtube.com/feeds/api/standardfeeds/top_favorites');
    var most_responded = partial(standard_feed, 'http://gdata.youtube.com/feeds/api/standardfeeds/most_responded');




    var fill_results = function(json) {
        // accepts youtube results feed. 
        // fills content with search results.
        var results = results_from_json(json);
        var html = make_html(results, html_yt_entry_big);
        $(content_target).html(div(html, 'search-results'));
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
    fill_info(side_target, videoid);

    var t = $(content_target)
    t.html('');
    t.append(player_code(videoid));
    t.append(facebook_code(url_for_video(videoid)));

    related_videos(videoid, function(results) {
        var html = make_html(results, html_yt_entry_small);
        $(side_target).find('.related').html(html);
    });

    write_doc('http://connect.facebook.net/en_US/all.js#xfbml=1');
    player.init();
}

var fill_info = function(target, videoid) {
    // #TODO: jperla: published #TODO: jperla:
    // #TODO: jperla: duration
    // #TODO: jperla: rating average
    yt_info(videoid, function(e) {
        var t = e.title();
        set_title(t);
        var title = h2(t);
        var a = e.author();
        var author = div(a_href(url_for_author(a), a), 'author');
        var views = strong(thousands(e.viewCount()) + ' views');
        // #TODO: jperla: shorten it ; show it
        var description = '';//div(e.description())
        var html = title + author + views + description;
        $(target).find('.info').html(html);
    });
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

var relocate_bad_url = function(url) {
    if(url.indexOf('#') == -1) { 
        // if no hash tag, go to home page
        window.location = '#/' 
    } else
    if (url.indexOf('?') >= 0) {
        // if query arguments, strip them
        var i = url.indexOf('/', 8);
        var root = url.substr(0, i);
        window.location = root + '/#' + hash_tag(url);
    }
}

$(document).ready(function() {
    $('.logo').live('click', function() { window.location = '#/' });

    var url = current_url();
    relocate_bad_url(url);

    // #TODO: jperla: make local search_system
    // #TODO: jperla: encapsulate search data api properly
    search_system('#search', '#content').init();
    var lp = partial(load_page, '#search', '#content', '#sidebar');
    lp()

    $(window).hashchange(lp);

    // enables small results to be clickable everywhere
    $('.result-small').live('click', function() {
        window.location = $(this).find('a').attr('href');
    });

    $('#search .search').focus();

    // subscribe to register comment creation after 30 seconds 
    // (hopefully FB loaded by then)
    setTimeout(function() {
        FB.Event.subscribe('comment.create', function(response) {
            _gaq.push(['_trackEvent', 'comment', 'create', hash_tag(current_url())]);
        });
        FB.Event.subscribe('edge.create', function(response) {
            _gaq.push(['_trackEvent', 'fblike', hash_tag(current_url())]);
        });
    }, 30000);
});


