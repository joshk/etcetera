# etcetera

[![on npm](http://img.shields.io/npm/v/etcetera.svg?style=flat)](https://www.npmjs.org/package/etcetera)  [![Tests](http://img.shields.io/travis/npm/etcetera.svg?style=flat)](http://travis-ci.org/npm/etcetera)  [![Dependencies](http://img.shields.io/david/npm/etcetera.svg?style=flat)](https://david-dm.org/npm/etcetera)

Read config from etcd. Fill out templates. Write upstart files. Be our diode electrode  generator oscillator configurator make a circuit with us.

## Usage

`npm install -g @npminc/etcetera`

This will install two commandline tools.

## etcetera

Configure the named application by filling out its template with data from etcd.

```
etcetera [-d deploydir] [-g hostgroup] [-c template] appname
Options:
  -d, --deploydir  full path to deploy directory
  -t, --template   configuration template file name
                                                 [default: "configuration.tmpl"]
  -g, --group      hostgroup, if there is one                      [default: ""]
  -s, --silent     do not log helpfully                                [boolean]
  --help           Show help                                           [boolean]

Examples:
  etcetera my-service
  etcetera -d /mnt/deploys/foozle my-service
```

## upstarter

Generate an upstart file from the provided config

```
upstarter [-o output] [service-name|configpath]
Options:
  -o, --output  where to write the upstart files          [default: "/etc/init"]
  -s, --silent  do not log helpfully                                   [boolean]
  --help        Show help                                              [boolean]

Examples:
  upstarter my-service
  upstarter -o /etc/whatever /mnt/deploys/my-service/configuration.toml
```

If you don't have a full path in the target for `upstarter`, it will look for a configuration file in `/mnt/deploys/TARGET/configuration.toml`.


## .renvrc

`etcetera` will read your etcd configuration from any `.renvrc` files you have sitting around.

## LICENSE

ISC.
