![Publish Status](https://github.com/ether/ep_dynamic_default_content/workflows/Node.js%20Package/badge.svg) ![Backend Tests Status](https://github.com/ether/ep_dynamic_default_content/workflows/Backend%20tests/badge.svg)

# ep_dynamic_default_content

Etherpad plugin to dynamically generate a pad's initial content.

## Installation

From the Etherpad working directory, run:

```shell
npm install --no-save --legacy-peer-deps ep_dynamic_default_content
```

Or, install from Etherpad's `/admin/plugins` page.

## Configuration

### MariaDB

To obtain the pad's initial content from MariaDB (MySQL), add something like the
following to your `settings.json`:

```json
  "ep_dynamic_default_content": {
    "type": "mariadb",
    "mariadb": {
      "config": "mariadb://username:password@host/database",
      "sql": "SELECT txt FROM config WHERE customer = REGEXP_SUBSTR(:padId, '^[^-]+');"
    }
  },
```

Properties of the `mariadb` object:

  * `config` (required): Any value accepted by the
    [`mariadb.createPool()`](https://github.com/mariadb-corporation/mariadb-connector-nodejs/blob/2.5.6/documentation/promise-api.md#createpooloptions--pool)
    function.
  * `sql` (required): Query to issue to obtain the pad content. This may use any
    of the following [named
    placeholders](https://github.com/mariadb-corporation/mariadb-connector-nodejs/blob/2.5.6/documentation/promise-api.md#namedPlaceholders):
      * `:authorId` (string): The author ID of the user that is creating the
        pad.
      * `:padId` (string): The pad's ID.

The query should return one row with one column containing the desired text.

### JavaScript

You can run arbitrary code to generate the default pad content by adding
something like the following to your `settings.json`:

```json
  "ep_dynamic_default_content": {
    "type": "javascript",
    "javascript": {
      "settings": {"place": "world"},
      "init": "return {place: settings.place.toUpperCase()};",
      "handle": "ctx.type = 'text'; ctx.content = `hello ${state.place}!`;",
      "shutdown": "doCleanupStuff(state);"
    }
  },
```

Properties of the `javascript` object:

  * `settings` (optional): Arbitrary value that will be passed to your `init`
    function (if provided).

  * `init` (optional): Body of an
    [AsyncFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction)
    that performs any desired initialization at startup.

    Parameters:

      * `settings`: The value of the
        `ep_dynamic_default_content.javascript.settings` property in your
        `settings.json`, or nullish if your `settings.json` does not have such a
        value.

    Return value: Optional. If your code returns a value, that value
    will be passed as the `state` parameter to the `handle` and `shutdown`
    functions.

  * `handle` (required): Body of an
    [AsyncFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction)
    that is called to obtain a new pad's initial content.

    Parameters:

      * `state`: The value returned by the `init` function, or nullish if you
        did not provide an `init` function or the `init` function did not return
        a value.

      * `ctx`: The context object for the [`padDefaultContent`
        hook](https://etherpad.org/doc/v1.9.0/#index_padDefaultContext).

    Return value: ignored.

  * `shutdown` (optional): Body of an
    [AsyncFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction)
    that is called when Etherpad is shutting down or restarted. Use this to
    clean up any state (e.g., cancel timers, close connections) created by your
    `init` or `handle` functions.

    Parameters:

      * `state`: The value returned by the `init` function, or nullish if you
        did not provide an `init` function or the `init` function did not return
        a value.

## Copyright and License

Copyright © 2022 Richard Hansen
and the ep_dynamic_default_content authors and contributors

Licensed under the [Apache License, Version 2.0](LICENSE) (the "License"); you
may not use this file except in compliance with the License. You may obtain a
copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
