#!/usr/bin/env python
import re
import os
import urllib2
import logging
import tempfile
import subprocess

from pyquery import PyQuery as pq

def call_raw_command(raw_command, text):
    """Accepts a command string with args separated by spaces (no spaces in args), and
        a comment/debug text string.
        Returns the stdout and stderr in a 2-tuple.
    """
    process = subprocess.Popen(raw_command,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    logging.info('%s: %s...' % (' '.join(raw_command), text))
    return process.communicate()


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
    doc = pq(html)
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


def replace_scripts(html, css, js):
    """Accepts html string, and css and js to add.
        Returns new strings with those attached.
        Removed any other script src or link href in <head>
    """
    new_doc = pq(html)
    new_doc('head link').remove()
    new_doc('head script[src]').remove()
    new_js = '<script type="text/javascript"><!--\n%s\n--></script>' % js
    new_css = '<style type="text/css">%s</style>' % css
    new_doc('head').append(new_css).append(new_js)
    new_html = new_doc.outerHtml()
    return new_html


def yuicompress(script, script_type):
    """accept script string, and js or css.
        Returns the script minified.
    """
    assert script_type in ['js', 'css']
    d = tempfile.mkdtemp(prefix='compressor')
    input_filename = os.path.join(d, 'input.' + script_type)
    output_filename = os.path.join(d, 'output.' + script_type)
    compressor = 'scripts/yuicompressor.jar'

    with open(input_filename, 'w') as f:
        f.write(script)
    command = ['java', '-jar', compressor, 
                        '-o', output_filename, 
                        #'--nomunge',  # try not to over-optimize yet
                        '--preserve-semi', 
                        #'--disable-optimizations',
                        input_filename]

    dbg = 'YUI Compressing {0} to {1}'.format(input_filename, output_filename)
    call_raw_command(command, dbg)
    return open(output_filename, 'r').read()

if __name__=='__main__':
    filename = 'index.html'
    
    # all paths relative to index html
    os.chdir(os.path.dirname(os.path.abspath(filename)))

    html = open(filename, 'r').read()

    css = yuicompress(concatenate_scripts(all_css(html)), 'css')
    js = yuicompress(concatenate_scripts(all_scripts(html)), 'js')

    new_html = replace_scripts(html, css, js)

    open('public/index.html', 'w').write(new_html)
