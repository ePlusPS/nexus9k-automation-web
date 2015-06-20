Nexus9k Automation
==================
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

  $ make transpile-js

#. Watch js files for changes to compile (for developers only)::

  $ make watch-js

#. Run the server::

   $ make run

#. Start Celery::

   $ celery -A nexus9k worker -l info

#. Set up cron job to update search index every 5 minutes::
    #. Open crontab for editing

        $ crontab -e
    #. Add the following entry :

        5 * * * *   path_to_virtual_env/bin/python path_to_project_dir/manage.py update_index


Management Commands
------------
1,  scan_scripts
  scans all the registered github repositories for nexusscripts and add them into db.
  Syntax:  python manage.py scan_scripts

2, get_github_token
  Allows to get a new github access token, which can be used to access github api.
  Syntax: python manage.py get_github_token  -u username -p password

3, setup_permissions
  Creates default permissions set for all the roles.

4, load_products
  Scraps products information from cisco's website and populates database
  Syntax: python manage.py load_products

5, load_solutions
  Scraps solutions information from cisco's website and populates database
  Syntax: python manage.py load_solutions

6, load_articles
  Scraps articles information from cisco's website and populates database
  Syntax: python manage.py load_articles


Troubleshooting
-----------

+ CodeShare, sync script not working.
  Make sure that django_omibus server is running. Add it as a supervisor job.

       python manage.py omnibusd

  Ensure that port no 4242 is open for ws requests.

  Make sure celery is running.

