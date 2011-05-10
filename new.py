#!/usr/bin/env python
import re
import os
import urllib2
from pyquery import PyQuery as pq


def all_scripts(html):
    '''Accepts html string.
    Returns list of js source locations.
    '''
    doc = pq(html)
    js = [s.get('src') for s in doc('head script') if s.get('src')]
    return js

def all_css(html):
    '''Accepts htmls tring.
        Returns list of css source locations.
    '''
    css = [s.get('href') for s in doc('head link') if s.get('href')]
    return css

def concatenate_scripts(filenames):
    """Accepts list of filenames.  
        Downloads and reads and concatenates them.
        Returns strings of all concatenated.
    """
    final = ''
    for f in filenames:
        if f.startswith('http'):
            h = urllib2.urlopen(f).read()
        else:
            h = open(f, 'r').read()
        final += ' /******** %s *********/ \n' % f
        final += h
    return final



if __name__=='__main__':
    filename = 'index.html'
    
    # all paths relative to index html
    os.chdir(os.path.dirname(os.path.abspath(filename)))

    html = open(filename, 'r').read()
    doc = pq(html)

    js = concatenate_scripts(all_scripts(html))
    css = concatenate_scripts(all_css(html))

    new_doc = doc.clone()
    new_doc('head link,head script[src]').remove()
    new_js = '<script type="text/javascript"><!--\n%s\n--></script>' % js
    #TODO: jperla: correct tag, no cdata?
    new_css = '<style type="text/css">%s</style>' % css
    new_doc('head').append(new_js).append(new_css)
    new_html = new_doc.outerHtml()
    print new_html

