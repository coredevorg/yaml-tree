const yaml = require('js-yaml');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');
let $$ = { debug: console.log };

let content = fs.readFileSync('./data/metadata-invoice-min.yml', 'utf8');
let metayml = fs.readFileSync('./data/yaml-metadata.yml', 'utf8');
let json = yaml.load(content);
let type = yaml.load(metayml);
console.log(JSON.stringify(type.keys, null, 2));



let treeData = (json, meta, title) => {

    let _data = {};
    let _tree = {};

    $$.debug(meta.KEYS.ROOT);

    let rootKeys = meta.KEYS.ROOT.filter( (key) => {
        return !('items' in key[Object.keys(key)[0]]);
    }).map( (key) => {
        return Object.keys(key)[0];
    });

    let anyKeys = meta.KEYS.ANY.filter( (key) => {
        return !('items' in key[Object.keys(key)[0]]);
    }).map( (key) => {
        return Object.keys(key)[0];
    });

    $$.debug(anyKeys);

    let showItem = (key, value, level, path, obj) => {
        console.log(level, Array(level*2 +1).join(' ') + key + " : " + value + ' [' + path + ']');
    };

    let newItem = (id, items, data, _path) => {

        // create unique key for data structure
        let path = ( _path  && _path.length > 0 ) ? [].concat(_path) : [];
        path.push(id);
        let key = path.join('.');

        // generate data structure entry
        _data[key] = {};
        _data[key].path = path;
        _data[key].data = data;
        _data[key].items = items;

        // process tree item
        let text = id;  // calculate node name from id and displayName
        if ( parseInt(id) >= 0 && typeof data === 'string' ) {
            text = '[' + id + '] ' + data;
        } else {
            text = ( data && data.displayName ) ? data.displayName + ' [' + id + ']' : id;
        }

        let entry = null;

        if ( data && typeof data === 'object' ) {

            entry = {
                id: key,
                text: text
            };

            if ( items && items.length > 0 ) {
                entry.items = items;
                // entry.expanded = true;
            }
        }

        return entry;
    };

    let getItems = (obj, func, level, path) => {
        let items = [];
        let data = {};
        level++;
        for (let key in obj) {
            let children = [];
            data = obj[key];
            if (func)
                func(key, obj[key], level, path, obj);
            if ( obj[key] !== null && typeof(obj[key]) === "object" ) {
                path.push(key);
                children = getItems(obj[key], func, level, path);
                path.pop();
            }
            let item = newItem(key, children, data, path);
            if ( item ) items.push(item);
        }

        level--;
        return items;
    };

    _tree = {
        id: 'root',
        text: (title) ? title : 'Root entry',
        expanded: true,
        items: getItems(_.cloneDeep(json), showItem, 0, [])
    };

    return {
        tree: _tree,
        data: _data
    };
};

let td = treeData(json, type);

console.log('Done!');
