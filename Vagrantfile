# -*- mode: ruby -*-
# vim: set ft=ruby sw=2 :

Vagrant.configure("2") do |config|
  config.berkshelf.enabled = true

  config.vm.define "test-vm"
  config.vm.box = "precise64"
  config.vm.box_url = "http://files.vagrantup.com/precise64.box"

  config.vm.network :forwarded_port, guest: 80, host: 3000

  config.vm.provision :chef_solo do |chef|

    # install dependency prerequisites
    chef.add_recipe 'apt'
    chef.add_recipe 'build-essential'
    chef.add_recipe 'xml'

    # install databases
    chef.add_recipe 'mysql::server'

    # install the webserver with php
    chef.add_recipe 'apache2'

    # install plugins
    chef.add_recipe 'apache2::mod_rewrite'
    chef.add_recipe 'php::module_mysql'

    # install dev tools
    chef.add_recipe 'git'
    chef.add_recipe 'vim'

    chef.json =
    {
      'mysql' =>
      {
        'server_root_password' => '',
        'server_repl_password' => '',
        'server_debian_password' => '',
        'remove_anonymous_users' => true,
        'remove_test_database' => true,
        'allow_remote_root' => false
      }
    }
  end
  config.vm.provision :shell, :path => "post_install.sh"
end
