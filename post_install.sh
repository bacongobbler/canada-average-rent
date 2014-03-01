#! /usr/bin/env bash

rm -rf /var/www
ln -fs /vagrant/www /var/www
ln -s /etc/apache2/sites-available/default /etc/apache2/sites-enabled/default
service apache2 restart
