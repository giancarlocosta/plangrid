# Server Configuration Options
> Configure the server through config files, ENV vars, and/or commandline args. See [node-convict](https://github.com/mozilla/node-convict) for Precendence order info, etc.<br/>This doc contains the [Configuration Schema](#configuration-schema) and a beautified version of that schema in table format, [Configuration Table](#configuration-table).


## Configuration Table

|Name|Description|Default|Env Variable|Command Line Arg|
|----|----|----|----|----|
|env|The application environment.|production|NODE_ENV|env|
|host|The host address to bind.|0.0.0.0|SERVER_HOST|host|
|port|The port to bind.|3000|SERVER_PORT|port|
|log_level|The minimum log level to allow.|INFO|LOG_LEVEL|log_level|
|log_path|Where to write logs in addition to console.|/var/log/plangrid-service.log|LOG_PATH|log_path|
|storage_dir|Where to store files during life of service.|/tmp/plangrid-service|STORAGE_DIR|storage_dir|
|coverage|Whether to add hooks for code coverage (use for testing).|false|COVERAGE|coverage|
|config_dir|The location of JSON config files. These files will be alphabetically sorted in ascending order and then deep/recursively merged.|/opt/service/config|CONFIG_DIR|config_dir|
|config_check_interval|The interval in milliseconds between config change checks.|10000|CONFIG_CHECK_INTERVAL|config_check_interval|
|config_check_enabled|Whether to periodically (config_check_interval) check for config changes in config_dir.|false|CONFIG_CHECK_ENABLED|config_check_enabled|
|default_metric_ttl_ms|The TLL in milliseconds of a posted metric.|3600000|DEFAULT_METRIC_TTL_MS|default_metric_ttl_ms|
|query.min_page_size|Minimum page size returned by queries.|100|MIN_PAGE_SIZE|query.min_page_size|
|query.max_page_size|Maximum page size returned by queries.|500|MAX_PAGE_SIZE|query.max_page_size|
|query.default_page_size|Default page size returned by queries.|100|DEFAULT_PAGE_SIZE|query.default_page_size|

<br/><br/>
## Configuration Schema
> The schema version of the configuration table above.<br/>NOTE: ignore the `properties` fields!



```

{
   "properties": {
      "env": {
         "doc": "The application environment.",
         "format": [
            "production",
            "development",
            "test"
         ],
         "default": "production",
         "env": "NODE_ENV",
         "arg": "env"
      },
      "host": {
         "doc": "The host address to bind.",
         "format": "ipaddress",
         "default": "0.0.0.0",
         "env": "SERVER_HOST",
         "arg": "host"
      },
      "port": {
         "doc": "The port to bind.",
         "format": "port",
         "default": 3000,
         "env": "SERVER_PORT",
         "arg": "port"
      },
      "log_level": {
         "doc": "The minimum log level to allow.",
         "format": "string",
         "default": "INFO",
         "env": "LOG_LEVEL",
         "arg": "log_level"
      },
      "log_path": {
         "doc": "Where to write logs in addition to console.",
         "format": "string",
         "default": "/var/log/plangrid-service.log",
         "env": "LOG_PATH",
         "arg": "log_path"
      },
      "storage_dir": {
         "doc": "Where to store files during life of service.",
         "format": "string",
         "default": "/tmp/plangrid-service",
         "env": "STORAGE_DIR",
         "arg": "storage_dir"
      },
      "coverage": {
         "doc": "Whether to add hooks for code coverage (use for testing).",
         "format": "boolean",
         "default": false,
         "env": "COVERAGE",
         "arg": "coverage"
      },
      "config_dir": {
         "doc": "The location of JSON config files. These files will be alphabetically sorted in ascending order and then deep/recursively merged.",
         "format": "string",
         "default": "/opt/service/config",
         "env": "CONFIG_DIR",
         "arg": "config_dir"
      },
      "config_check_interval": {
         "doc": "The interval in milliseconds between config change checks.",
         "format": "int",
         "default": 10000,
         "env": "CONFIG_CHECK_INTERVAL",
         "arg": "config_check_interval"
      },
      "config_check_enabled": {
         "doc": "Whether to periodically (config_check_interval) check for config changes in config_dir.",
         "format": "boolean",
         "default": false,
         "env": "CONFIG_CHECK_ENABLED",
         "arg": "config_check_enabled"
      },
      "default_metric_ttl_ms": {
         "doc": "The TLL in milliseconds of a posted metric.",
         "format": "int",
         "default": 3600000,
         "env": "DEFAULT_METRIC_TTL_MS",
         "arg": "default_metric_ttl_ms"
      },
      "query": {
         "properties": {
            "min_page_size": {
               "doc": "Minimum page size returned by queries.",
               "format": "int",
               "default": 100,
               "env": "MIN_PAGE_SIZE",
               "arg": "query.min_page_size"
            },
            "max_page_size": {
               "doc": "Maximum page size returned by queries.",
               "format": "int",
               "default": 500,
               "env": "MAX_PAGE_SIZE",
               "arg": "query.max_page_size"
            },
            "default_page_size": {
               "doc": "Default page size returned by queries.",
               "format": "int",
               "default": 100,
               "env": "DEFAULT_PAGE_SIZE",
               "arg": "query.default_page_size"
            }
         }
      }
   }
}


```
