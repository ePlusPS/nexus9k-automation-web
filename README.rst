Nexus9k Automation Website
==========================
Automation tools website for the Nexus 9000 series.


Browser Support
---------------
===========  ==========
Development  Chrome
Production   Full, IE 8
===========  ==========


Installation
------------
#. Install the latest stable version of Python.

   #. Install `python dependencies`_ needed to build Python from source.
   #. Install and configure `pyenv <https://github.com/yyuu/pyenv#installation>`_.
   #. Install and configure `pyenv virtualenv`_.

   .. _python dependencies: https://github.com/yyuu/pyenv/wiki/Common-build-problems#requirements
   .. _pyenv virtualenv: https://github.com/yyuu/pyenv-virtualenv#installation

#. Install dependencies::

    $ make install

#. Apply database schema migrations::

   $ python manage.py migrate

#. Compile SCSS::

   $ make compile-scss

#. Watch SCSS files for changes to compile (for developers only)::

   $ make watch-scss

#. Transpile JavaScript (must install node)::

  $ make compile-es6

#. Watch js files for changes to compile (for developers only)::

  $ make watch-es6

#. Run the server::

   $ make run
