#!/usr/bin/env python
import re
import os
import sys
import subprocess
import logging
from contextlib import contextmanager

valid_extensions = ['css', 'js']

@contextmanager
def in_dir(dir):
    """Accepts directory name.
        Creates with statement context manager that moves you into dir and 
        then back to current dir when done.
        Falls back to parent of dir if cwd is lost.
    """
    assert os.path.isdir(dir)
    default = os.path.dirname(dir)
    try:
        curdir = os.getcwd()
    except OSError:
        curdir = default
    os.chdir(dir)
    try:
        yield
    finally:
        os.chdir(curdir)

class CommitNotExistsError(Exception):
    pass

@contextmanager
def git_commit(commit):
    """Accepts commit hash.
        Creates with statement context manager that checks out the commit,
        and cleans up after everything is done.
    """
    call_raw_command(['git', 'pull'], 'Grabbing latest commits')
    output, err = call_raw_command(['git', 'checkout', commit], 'Checking out commit {0}'.format(commit))
    try:
        if err.startswith('error:') or err.startswith('fatal:'): 
            raise CommitNotExistsError('Failed to check out commit: {0} ({1})'.format(err, output))
        else:
            yield
    finally:
        call_raw_command(['git', 'checkout', 'master'], 'Checking out master again')

def last_updated(filename):
    """Accepts filename.
        Returns commit hash of last time it was upated.
    """
    command = ['git', 'log', '-n', '1', '--pretty=oneline', '--', filename]
    output,_ = call_raw_command(command, 'Grabbing commit hash')
    hash = output.split(' ', 1)[0]
    return hash

def list_file_versions(filenames):
    """Accepts filenames.
        Returns a dictionary with the version commit hash they were last updated.
    """
    return dict((f, last_updated(f)) for f in filenames)

def list_files_in_dir(dir, matches=None, absolute=False):
    """Accepts directory, and matches regex pattern.
        Returns relative path (from dir) of all files in dir
            that match the pattern.
    """
    for root, dirs, files in os.walk(dir):
        # jperla: +1 for '/'
        base = root[len(dir) + 1:]
        for f in files:
            if matches is None or matches.match(f):
                if absolute:
                    yield os.path.join(dir, os.path.join(base, f))
                else:
                    yield os.path.join(base, f)
    
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

def calculate_cache_key(filename, commit):
    """Accepts filename and commit number.
        Returns string cache key.
        Turns ('v2/bla.css', '7abe3') => 'v2___bla______7abe3.css'
    """
    name, extension = filename.rsplit('.', 1)
    cache_key = '{0}______{1}.{2}'.format(name.replace('/', '___'), commit, extension)
    return cache_key 

def compressed_cache(cache_dir, filename, commit):
    """Accepts cache_dir, and filename of js or css to compress.
        Does nothing if cache exists, otherwise uses YUI to minify.
        Replaces slashes with triple underscore, / => ___.
    """
    cache_key = calculate_cache_key(filename, commit)
    cache_path = os.path.join(cache_dir, cache_key)
    if not os.path.exists(cache_path):
        if os.path.basename(filename).startswith('nominify'):
            with open(cache_path, 'w') as f:
                f.write(open(filename, 'r').read())
        else:
            logging.info('Minifying {0}'.format(filename))

            compressor = '/static.stickybits/deploy/yuicompressor/yuicompressor.jar'
            command = ['java', '-jar', compressor, 
                                '-o', cache_path, 
                                #'--nomunge',  # try not to over-optimize yet
                                '--preserve-semi', 
                                #'--disable-optimizations',
                                filename]

            call_raw_command(command, 'YUI Compressing {0} to {1}'.format(filename, cache_path))
        return os.path.exists(cache_path)
    return True

def cache_latest_files(static_cache_dir):
    """Accepts directory where git repository has static js/css files, and
        static cache dir where the caches of minified files are stored.
        Minifies and caches all static files according to latest version found 
            in directory at the time it is run.
        Make sure you are on desired commit/branch before running this.
    """
    filenames = [os.path.realpath(f)
                    for f in list_files_in_dir(os.curdir, re.compile('^.*\.(js|css)$', re.S))]
    print filenames
    file_versions = list_file_versions(filenames)
    
    for filename, commit in file_versions.iteritems():
        b = compressed_cache(static_cache_dir, filename, commit)
        assert b, 'Failed to compress %s' % filename
    return file_versions

def compressed_cache_filename(static_cache_compressed_dir, package, commit, extension):
    """Given the dir, package, commit number, and extension, return string of cache filename."""
    compressed_filename_base = os.path.join(static_cache_compressed_dir, package + '.' + commit)
    filename = compressed_filename_base + '.' + extension
    return filename 


def compress_js_and_css(package, commit, file_versions, static_cache_files_dir, static_cache_compressed_dir):
    """Accepts package, commit, file versions dictionary, and
        static files cache, and compressed dir cache to save to.
        Read in all the js files, put them into one file in order, and save it
        to the compressed_dir.  Do the same for the css.
        Puts them in order by file path length, name including dirs.
        Separates them with a starred comment.
    """
    def concatenate_files(file_versions, static_cache_files_dir):
        """Accepts file versions dict, and static cache dir.
            Returns string with all files concatenated.
            Puts them in order by file path length, name including dirs.
        """
        file = []
        for filename,commit in sorted(file_versions.iteritems(), key=lambda f: (len(f[0]), f[0])):
            cache_key = calculate_cache_key(filename, commit)
            cache_path = os.path.join(static_cache_files_dir, cache_key)
            with open(cache_path, 'r') as f:
                file.append('\n/************ {0} **************/\n'.format(filename))
                file.append(f.read())
        return ''.join(file)

    css_filename = compressed_cache_filename(static_cache_compressed_dir, package, commit, 'css')
    js_filename = compressed_cache_filename(static_cache_compressed_dir, package, commit, 'js')

    css_files = dict((k,v) for k,v in file_versions.iteritems() if k.endswith('.css'))
    js_files = dict((k,v) for k,v in file_versions.iteritems() if k.endswith('.js'))

    with open(css_filename, 'w') as f:
        f.write(concatenate_files(css_files, static_cache_files_dir))
    with open(js_filename, 'w') as f:
        f.write(concatenate_files(js_files, static_cache_files_dir))

    return (css_filename, js_filename)

if __name__=='__main__':
    """Accepts commit number to compress as first argument.
        Returns the filename base for css/js files.
    """
    #logging.basicConfig(level=logging.INFO) # DEBUG

    #commit = 'd4569506736edf6d9ec2691edffc8303009266b5' #DEBUG
    commit = sys.argv[1] 

    # CONFIG
    dir = '/static.stickybits/static/'
    # /dev/shm is a tempfs dir, so it's temporary, but *fast* since stored in RAM
    static_cache_dir = '/dev/shm/static/'
    static_cache_files_dir = os.path.join(static_cache_dir, 'files/')
    static_cache_compressed_dir = os.path.join(static_cache_dir, 'compressed/')

    # make dirs CONFIG
    #TODO: jperla: make into recursive thing
    if not os.path.exists(static_cache_dir):
        os.mkdir(static_cache_dir)
    if not os.path.exists(static_cache_files_dir):
        os.mkdir(static_cache_files_dir)
    if not os.path.exists(static_cache_compressed_dir):
        os.mkdir(static_cache_compressed_dir)

    # where all the caching/minifying happens
    with in_dir(dir):
        with git_commit(commit):
            file_versions = cache_latest_files(dir, static_cache_files_dir)
    # where the compression happens
    f = compress_js_and_css(commit, file_versions, static_cache_files_dir, static_cache_compressed_dir)
    
    # output the file
    print f

