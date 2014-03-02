canada-average-rent
===================

A simple web application that visualizes the average rent costs for living in BC as specified at http://data.gc.ca/data/en/dataset/1146388b-a150-4e70-98ec-eb40cb9083c8

## Deploying

This project utilizes [vagrant][1] and [berkshelf][2] to quickly fire up a server on Virtualbox with all the application's dependencies. To start, [install virtualbox][3] and [vagrant][1], then run

    $ gem install berkshelf
    $ vagrant plugin install vagrant-berkshelf
    $ berks install
    $ vagrant up

After the server has booted up, you can go to [http://localhost:3000/](http://localhost:3000/) to view the application.


[1]: http://www.vagrantup.com/
[2]: http://berkshelf.com/
[3]: https://www.virtualbox.org/wiki/Downloads
