# TSW Web Application
This project is a Python based web application using the Django framework. This application is used for managing production needs within TSW. There are areas of the
web application for monitoring facility conditions, managing Reticle production,
MOE simulation, Textured AR production, and purchasing/planning.

## Getting Started
1.  From a powershell window, 'cd' into the top-level repository directory and create a python virtual environment using:<br>
    `python -m venv env`<br>
    (Skip this step if you have already done this!)

2.	'cd' into the 'env' folder, then activate the virtual environment with the command:<br>
    `.\Scripts\activate`

3.  You can then install packages using 'pip':<br>
    `python -m pip install -r ../tsw_web/requirements.txt`

4. To run the development server, use the command:<br>
    `python manage.py runserver 8080 --settings=tsw_web.settings.development`<br>
    from the ./tsw_web/ folder.

5. To create migrations for the database models, you can use:<br>
    `python manage.py makemigrations`<br>

6. To apply migrations to the test database, use<br>
    `python manage.py migrate --settings=tsw_web.settings.development`<br>

7. When static files like templates or javascript change, you must run<br>
    `python manage.py collectstatic  --settings=tsw_web.settings.development`<br>
    to collect the static files locally.<br>

    **You must remove the `--settings` flag if you want to update static files in the Azure Blob container.

8. Scripts created inside the ./management folders within the sub-applications can be executed by
    `python manage.py <script-name>`

9. To add a new sub-application to the web app, from the ./tsw_web directory, run:<br>
    `django-admin startapp <app_name>`

10. When you are done developing, deactivate the environment by typing `deactivate` into the powershell or terminal.

## Build and Test
When the development is finished, the site can be deployed to Azure App Services.

Tests can be run on an SQLite database engine with:
`python manage.py test --settings=tsw_web.settings.testing`

## Resources
- [Django v.3.0.10](https://docs.djangoproject.com/en/3.0/)
- [TSW Web App Repository](https://ThorlabsSpectralWorks@dev.azure.com/ThorlabsSpectralWorks/tsw-web-app/_git/tsw-web-app)
