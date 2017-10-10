
import mysql = require('mysql');
import moment = require('moment');
import NodeCache = require("node-cache");
import SqlString = require('sqlstring');

import { TdaoBase } from './TdaoBase';
import { Tapplication } from '../Tapplication';
import Promise = require("bluebird");

declare var app: Tapplication

export class TdaoMysql extends TdaoBase {

    table: string = null;
    viewTable: string = null;
    IDField: string = "id";
    IDFieldIsAuto: boolean = true;
    IDFieldType: string = "integer";
    cache: any = null;
    tablefieldsByName: any = null;
    viewtablefieldsByName: any = null;
    connections: number = 0
    poolname: any = null;
    logger: any = null;
    static pool: any = null;

    constructor(objectClassName, datasource, config) {

        super(objectClassName, datasource, config);

        this.table = config.tableName;
        this.viewTable = this.table;
        if (this.config.viewName)
            this.viewTable = this.config.viewName;
        if (this.config.IDField)
            this.IDField = this.config.IDField;
        if (this.config.IDFieldType)
            this.IDFieldType = this.config.IDFieldType;
        if (typeof this.config.IDFieldIsAuto != "undefined")
            this.IDFieldIsAuto = this.config.IDFieldIsAuto;
        this.cache = new NodeCache({ stdTTL: 3600 });
        if (typeof TdaoMysql.pool == "undefined")
            TdaoMysql.pool = {};
        this.datasource.multipleStatements = true;
        this.poolname = this.datasource.host + "_" + this.datasource.database + "_" + this.datasource.port;
    }
    init() {
        return this.getFields("table")
            .then(function () {
            return this.getFields("view");
        }.bind(this));
    }
    pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }
    getMysqDateFromDate(d) {
        return d.getFullYear() +
            '-' + this.pad(d.getMonth() + 1) +
            '-' + this.pad(d.getDate()) +
            ' ' + this.pad(d.getHours()) +
            ':' + this.pad(d.getMinutes()) +
            ':' + this.pad(d.getSeconds());
    }
    getPool() {
        if (typeof TdaoMysql.pool[this.poolname] == "undefined") {
            this.logger.debug("Create pool " + this.poolname);
            TdaoMysql.pool[this.poolname] = mysql.createPool(this.datasource);
            TdaoMysql.pool[this.poolname].on("open", this.onConnectionOpen.bind(this));
            TdaoMysql.pool[this.poolname].on("close", this.onConnectionClosed.bind(this));
            TdaoMysql.pool[this.poolname].on("error", this.onConnectionError.bind(this));
        }
        return TdaoMysql.pool[this.poolname];
    }
    getConnection() {
        return new Promise(function (resolve, reject) {
            this.getPool().getConnection(function (err, connection) {
                if (err) {
                    reject(err);
                }
                else {
                    this.connections++;
                    resolve(connection);
                }
            }.bind(this));
        }.bind(this));
    }
    releaseConnection(connection) {
        connection.release();
        this.connections--;
    }
    beginTransaction(connection) {
        return new Promise(function (resolve, reject) {
            connection.beginTransaction(function (err) {
                if (err)
                    reject(err);
                else
                    resolve(connection);
            });
        });
    }
    commitTransaction(connection) {
        return new Promise(function (resolve, reject) {
            connection.commit(function (err) {
                if (err) {
                    connection.rollback();
                    reject(err);
                }
                else {
                    resolve(connection);
                }
                this.releaseConnection(connection);
            }.bind(this));
        }.bind(this));
    }
    rollbackTransaction(connection) {
        this.logger.error("ROLLBACK");
        return new Promise(function (resolve, reject) {
            if (connection == null) {
                return Promise.resolve(connection);
            }
            else {
                connection.rollback(function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(connection);
                    }
                    this.releaseConnection(connection);
                }.bind(this));
            }
        }.bind(this));
    }
    queryTransaction(sql) {
        var conn = null;
        return this.getConnection()
            .then(function (connection) {
            conn = connection;
            return this.beginTransaction(connection);
        }.bind(this))
            .then(function (connection) {
            return this._query(sql, connection);
        }.bind(this))
            .then(function (rows, fields) {
            return this.commitTransaction(conn)
                .then(function (r) {
                return rows;
            }.bind(this));
        }.bind(this))
            .catch(function (err) {
            if (conn)
                this.rollbackTransaction(conn);
            return Promise.reject(err);
        }.bind(this));
    }
    query(sql) {
        var conn = null;
        var startTime = new Date();
        return this.getConnection()
            .then(function (connection) {
            conn = connection;
            return this._query(sql, connection);
        }.bind(this))
            .then(function (rows, fields) {
            this.releaseConnection(conn);
            var xtime = new Date().getTime() - startTime.getTime();
            this.logger.debug("QUERY EXEC TIME=" + xtime + " ms");
            return rows;
        }.bind(this));
    }
    _query(sql, connection) {
        return new Promise(function (resolve, reject) {
            connection.query(sql, function (err, rows, fields) {
                if (err) {
                    this.logger.debug("SQL=" + sql);
                    reject(err);
                }
                else {
                    if (typeof rows.push == "undefined")
                        resolve([rows]);
                    else
                        resolve(rows);
                }
            }.bind(this));
        });
    }
    execSelectQuery(sql) {
        return this.query(sql).then(function (result) {
            return this._processObjects(result);
        }.bind(this));
    }
    select(opt) {
        if (this.viewTable == null)
            throw new Error("viewTable is null");
        if (arguments.length == 0)
            opt = {};
        if (!opt.fields)
            opt.fields = "*";
        var sql = "select " + opt.fields + " from " + this.viewTable;
        if (opt.where)
            sql += " where " + opt.where;
        if (opt.orderBy)
            sql += " ORDER BY " + opt.orderBy;
        if (opt.limit)
            sql += " LIMIT " + opt.limit;
        return this.execSelectQuery(sql).then(function (result) {
            return this._processObjects(result);
        }.bind(this));
    }
    selectOne(opt) {
        return this.select(opt).then(function (result: any[]) {
            var r = null;
            if (result.length > 0)
                r = result[0];
            return r;
        });
    }
    empty(success, failure) {
        var sql = 'TRUNCATE `' + this.table + '`;';
        return this.query(sql);
    }
    getFields(type, opt = null) {
        if (this[type + "fieldsByName"] == null) {
            if (type == "table")
                var sql = "SHOW COLUMNS FROM " + this.table;
            else
                var sql = "SHOW COLUMNS FROM " + this.viewTable;
            return this.query(sql).then(function (fields) {
                if (this[type + "fieldsByName"] == null) {
                    this[type + "fieldsByName"] = {};
                    for (var i = 0; i < fields.length; i++)
                        this[type + "fieldsByName"][fields[i].Field] = fields[i];
                }
                return this[type + "fieldsByName"];
            }.bind(this));
        }
        else {
            return Promise.resolve(this[type + "fieldsByName"]);
        }
    }
    getByIds(idList, opt) {
        var defautlOpt = { throwIfIncomplete: false };
        if (arguments.length < 2) {
            opt = defautlOpt;
        }
        else {
            for (var k in defautlOpt)
                if (typeof opt["throwIfIncomplete"] == "undefined")
                    opt.throwIfIncomplete = defautlOpt[k];
        }
        var value;
        if (this.IDFieldType == "string")
            value = "'" + idList.join("','") + "'";
        else
            value = idList.join(",");
        var sql = "select * from " + this.viewTable + " where " + this.IDField + " IN (" + value + ")";
        return this.query(sql)
            .then(function (result) {
            var hashResult = {};
            for (var i = 0; i < result.length; i++)
                hashResult[result[i][this.IDField]] = result[i];
            var result2 = [];
            var notFound = [];
            for (var i = 0; i < idList.length; i++) {
                if (hashResult[idList[i]]) {
                    result2.push(hashResult[idList[i]]);
                }
                else {
                    notFound.push(idList[i]);
                    result2.push(null);
                }
            }
            if (opt.throwIfIncomplete && (notFound.length > 0))
                throw new Error("Records(s) not found: " + notFound.join(","));
            return this._processObjects(result2);
        }.bind(this));
    }
    getById(id) {
        var value = id;
        if (this.IDFieldType == "string") {
            value = "'" + id + "'";
        }
        else if (this.IDFieldType == "integer") {
            if (parseInt(value) != value)
                return Promise.reject("L'id doit être de type 'integer'");
        }
        var sql = "select * from " + this.viewTable + " where " + this.IDField + " = " + value;
        return this.query(sql)
            .then(function (result) {
            if (result.length > 0)
                return this._processObjects(result);
            else
                return null;
        }.bind(this))
            .then(function (result) {
            if (result != null)
                return result[0];
            else
                return null;
        });
    }
    delete(opt) {
        var sql = "DELETE from " + this.table;
        if (opt && opt.where)
            sql += " WHERE " + opt.where;
        return this.queryTransaction(sql)
            .then(function (result) {
            var recordsCount = this.cache.get("recordsCount");
            if (recordsCount)
                this.cache.set("recordsCount", result.affectedRows);
            return result[0];
        }.bind(this));
    }
    deleteById(id, opt) {
        return this.getById(id)
            .then(function (bddObject) {
            if (bddObject == null)
                throw "Object " + id + " does not exists";
            else
                return this.queryTransaction("DELETE from " + this.table + " WHERE " + this.IDField + " = " + id);
        }.bind(this))
            .then(function (result) {
            if (result.affectedRows == 0)
                throw "Object " + id + " does not exists";
            var recordsCount = this.cache.get("recordsCount");
            if (recordsCount)
                this.cache.set("recordsCount", recordsCount - 1);
            return id;
        }.bind(this));
    }
    save(obj, opt = {}) {
        var isArray = (typeof obj.push == 'function');
        var isCreation = false;
        if (isArray) {
            for (var i = 0; i < obj.length; i++) {
                var item = obj[i];
                var _isCreation = ((typeof item[this.IDField] == "undefined") || (item[this.IDField] == null) || (item[this.IDField] == 0));
                if ((isCreation != null) && (isCreation != _isCreation))
                    throw new Error("cannot update and create item in the same request");
                else
                    isCreation = _isCreation;
            }
        }
        else {
            isCreation = ((typeof obj[this.IDField] == "undefined") || (obj[this.IDField] == null) || (obj[this.IDField] == 0));
        }
        this.logger.debug("save: isCreation=" + isCreation + ", obj=", obj);
        if (isCreation) {
            return this._create(obj, opt);
        }
        else {
            return this._update(obj, opt);
        }
    }
    escapeSqlString(v) {
        var r = SqlString.escape(v);
        return r;
    }
    getReplaceSql(obj) {
        var sql = "REPLACE INTO " + this.table;
        var fieldsNames = [];
        var values = [];
        for (var k in obj) {
            if ((typeof this.tablefieldsByName[k] != "undefined") && (typeof obj[k] != "undefined")) {
                fieldsNames.push('`' + k + '`');
                if (typeof obj[k] == "number") {
                    values.push(obj[k]);
                }
                else if (typeof obj[k] == "string") {
                    values.push(this.escapeSqlString(obj[k]));
                }
                else if (obj[k] == null) {
                    values.push("NULL");
                }
                else if (typeof obj[k] == "boolean") {
                    if (obj[k])
                        values.push(1);
                    else
                        values.push(0);
                }
                else if (typeof obj[k] == "object") {
                    values.push(this.escapeSqlString(JSON.stringify(obj[k])));
                }
            }
        }
        sql += " (" + fieldsNames.join(",") + ")";
        sql += " VALUES ";
        sql += " (" + values + ")";
        return sql;
    }
    getUpdateSql(obj) {
        var sql = "UPDATE " + this.table + " SET ";
        var parts = [];
        for (var k in obj) {
            if ((typeof this.tablefieldsByName[k] != "undefined") && (typeof obj[k] != "undefined")) {
                if (typeof obj[k] == "boolean") {
                    if (obj[k])
                        parts.push(k + "=1");
                    else
                        parts.push(k + "=0");
                }
                else if (typeof obj[k] == "number") {
                    parts.push(k + "=" + obj[k]);
                }
                else if (typeof obj[k] == "string") {
                    parts.push(k + "=" + this.escapeSqlString(obj[k]));
                }
                else if (obj[k] == null) {
                    parts.push(k + "=NULL");
                }
                else if (typeof obj[k] == "object") {
                    parts.push(k + "=" + this.escapeSqlString(JSON.stringify(obj[k])));
                }
            }
        }
        sql += parts.join(",");
        sql += " WHERE " + this.IDField + "='" + obj[this.IDField] + "'";
        return sql;
    }
    getInsertSql(obj) {
        var sql = "INSERT INTO " + this.table;
        var fieldsNames = [];
        var values = [];
        for (var k in obj) {
            if (((this.IDFieldIsAuto && (k != this.IDField)) || !this.IDFieldIsAuto) && (typeof this.tablefieldsByName[k] != "undefined") && (typeof obj[k] != "undefined")) {
                fieldsNames.push('`' + k + '`');
                if (typeof obj[k] == "number") {
                    values.push(obj[k]);
                }
                else if (typeof obj[k] == "string") {
                    values.push(this.escapeSqlString(obj[k]));
                }
                else if (obj[k] == null) {
                    values.push("NULL");
                }
                else if (typeof obj[k] == "boolean") {
                    if (obj[k])
                        values.push(1);
                    else
                        values.push(0);
                }
                else if (typeof obj[k] == "object") {
                    values.push(this.escapeSqlString(JSON.stringify(obj[k])));
                }
            }
        }
        sql += " (" + fieldsNames.join(",") + ")";
        sql += " VALUES ";
        sql += " (" + values + ")";
        return sql;
    }
    _create(obj, opt = {}) {
        var isArray = (typeof obj.push == "function");
        if (isArray)
            throw new Error("create multi: not suported");
        this.logger.info("create in table '" + this.table + "'");
        return this.getFields("table")
            .then(function (fields) {
            var sql = this.getInsertSql(obj);
            return this.queryTransaction(sql);
        }.bind(this))
            .then(function (result) {
            return this.getById(result.insertId);
        }.bind(this))
            .then(function (result) {
            if (result == null)
                throw new Error("Object " + result[this.IDField] + " not created");
            result._isNew = true;
            result._changed = true;
            return result;
        }.bind(this));
    }
    _update(obj, opt = {}) {
        this.logger.info("update in table '" + this.table + "' ID=" + this.getIds(obj));
        var isArray = (typeof obj.push == "function");
        var idList = this.getIds(obj);
        return this.getFields("table")
            .then(function () {
            return this.getByIds(idList, { throwIfIncomplete: true });
        }.bind(this))
            .then(function (bddObjects) {
            var isArray = false;
            var sql = "";
            if (typeof obj.push == "function") {
                var isArray = true;
                for (var i = 0; i < obj.length; i++)
                    sql += this.getUpdateSql(obj[i]) + ";";
            }
            else {
                sql = this.getUpdateSql(obj);
            }
            return sql;
        }.bind(this))
            .then(function (sql) {
            return this.queryTransaction(sql);
        }.bind(this))
            .then(function (result) {
            return this.getByIds(idList, { throwIfIncomplete: true });
        }.bind(this))
            .then(function (bddObjects) {
            var result = bddObjects;
            if (!isArray) {
                result._isNew = false;
                result._changed = true;
                result = bddObjects[0];
            }
            return result;
        }.bind(this));
    }
    getIds(obj) {
        var r = [];
        if (typeof obj.push == "function") {
            for (var i = 0; i < obj.length; i++) {
                r.push(obj[i][this.IDField]);
            }
        }
        else {
            r.push(obj[this.IDField]);
        }
        return r;
    }
    getRecordsCount(where) {
        var sql = "SELECT COUNT(*) as count from " + this.viewTable;
        var whereIsSet = false;
        if ((arguments.length > 0) && (where != null)) {
            whereIsSet = true;
            sql += " WHERE " + where;
        }
        return this.query(sql).then(function (result) {
            var r = result[0].count;
            if (!whereIsSet)
                this.cache.set("recordsCount", r);
            return r;
        }.bind(this));
    }
    getSearchQuery(opt) {
        var r = {
            resultFields: {},
            where: null,
            groupBy: null,
            limit: null,
            offset: null,
            orderBy: null,
            sqlSelectFields: "",
            sql: ""
        };
        return this.getFields("view").then(function (fields) {
            opt.search = opt.search.replace(/\s+/g, ' ').trim();
            var words = [];
            if (opt.search)
                words = opt.search.split(" ");
            if (opt.fields != "*") {
                var resultFieldsNames = opt.fields.split(",");
                var sqlSelectFields = [];
                for (var i = 0; i < resultFieldsNames.length; i++) {
                    if (this.viewfieldsByName[resultFieldsNames[i]])
                        sqlSelectFields.push(resultFieldsNames[i]);
                    r.resultFields[resultFieldsNames[i]] = {
                        Type: "calc"
                    };
                }
                if (sqlSelectFields.length == 0)
                    r.sqlSelectFields = "*";
                else
                    r.sqlSelectFields = sqlSelectFields.join(",");
            }
            else {
                r.sqlSelectFields = "*";
                r.resultFields = this.viewfieldsByName;
            }
            var searchFields = [];
            if (opt.searchFields != "*") {
                var searchFieldsNames = opt.searchFields.split(",");
                for (var i = 0; i < searchFieldsNames.length; i++) {
                    var fieldname = searchFieldsNames[i];
                    if (typeof this.viewfieldsByName[fieldname] != "undefined")
                        searchFields.push(this.viewfieldsByName[fieldname]);
                }
            }
            else {
                for (var fieldName in fields)
                    searchFields.push(fields[fieldName]);
            }
            r.sql = "SELECT " + r.sqlSelectFields + " from " + this.viewTable;
            var whereIsset = false;
            if (words.length > 0) {
                for (var j = 0; j < words.length; j++) {
                    var parts = [];
                    var word = words[j];
                    for (var i = 0; i < searchFields.length; i++) {
                        var field = searchFields[i];
                        if (opt.rechExacte)
                            parts.push(field.Field + " like '" + word + "'");
                        else
                            parts.push(field.Field + " like '%" + word + "%'");
                    }
                    if (parts.length > 0) {
                        if (j > 0) {
                            r.where += " " + opt.logicPipe + " ";
                        }
                        else {
                            r.where = "";
                            whereIsset = true;
                        }
                        r.where += " (" + parts.join(" OR ") + ") ";
                    }
                }
            }
            if (opt.where) {
                if (!whereIsset)
                    r.where = opt.where;
                else
                    r.where += " AND (" + opt.where + ")";
            }
            if (opt.groupBy)
                r.groupBy = opt.groupBy;
            if (opt.orderBy)
                r.orderBy = opt.orderBy;
            if (opt.limit)
                r.limit = opt.limit;
            if (opt.offset > 0) {
                if (!r.limit)
                    r.limit = 1000000000;
                r.offset = opt.offset;
            }
            if (r.where)
                r.sql += " WHERE " + r.where;
            if (r.groupBy)
                r.sql += " GROUP BY " + r.groupBy;
            if (r.orderBy)
                r.sql += " ORDER BY " + r.orderBy;
            if (r.limit)
                r.sql += " LIMIT " + r.limit;
            if (r.offset)
                r.sql += " OFFSET " + r.offset;
            return r;
        }.bind(this));
    }
    search(opt) {
        var defaultOpt = {
            search: "",
            rechExacte: false,
            limit: null,
            where: null,
            orderBy: null,
            searchFields: "*",
            fields: "*",
            logicPipe: 'AND',
            groupBy: null,
            offset: null
        };
        if (typeof opt == "undefined")
            opt = defaultOpt;
        for (var k in defaultOpt) {
            if (typeof opt[k] == "undefined") {
                opt[k] = defaultOpt[k];
            }
            else {
                if (typeof opt[k] == "string")
                    opt[k] = opt[k].trim();
            }
        }
        if (opt.limit)
            opt.limit = parseInt(opt.limit);
        if (opt.offset)
            opt.offset = parseInt(opt.offset);
        var query;
        var r = {
            data: [],
            resultCount: null,
            total: null,
            offset: opt.offset,
            limit: opt.limit,
            groupBy: opt.groupBy,
            orderBy: opt.orderBy
        };
        return this.getSearchQuery(opt)
            .then(function (q) {
            query = q;
            return this.query(q.sql);
        }.bind(this))
            .then(function (result) {
            return this._processObjects(result, query.resultFields);
        }.bind(this))
            .then(function (result: any[]) {
            r.data = result;
        })
            .then(function (result) {
            return this.getRecordsCount();
        }.bind(this))
            .then(function (total) {
            r.total = total;
            if ((opt.limit != null) || (opt.offset != null) || query.where)
                return this.getRecordsCount(query.where);
            else
                return Promise.resolve(r.data.length);
        }.bind(this))
            .then(function (resultCount) {
            r.resultCount = resultCount;
            r.limit = query.limit;
            r.offset = query.offset;
            r.groupBy = query.groupBy;
            r.orderBy = query.orderBy;
            return r;
        }.bind(this));
    }
    _processObjects(objects, fields) {
        return new Promise(function (resolve, reject) {
            if (objects != null) {
                this.getFields("view").then(function (result) {
                    for (var i = 0; i < objects.length; i++) {
                        var obj = objects[i];
                        for (var k in obj) {
                            if (this.viewfieldsByName[k]) {
                                if (obj[k] != null) {
                                    var type = this.viewfieldsByName[k].Type;
                                    if ((type == "bit(1)") && (typeof obj[k] == "object")) {
                                        obj[k] = (obj[k][0] === 1);
                                    }
                                    else if ((typeof obj[k] == "object") && ((type == "datetime") || (type == "timestamp"))) {
                                        obj[k] = this.getMysqDateFromDate(obj[k]);
                                    }
                                }
                            }
                        }
                    }
                    resolve(this.processObjects(objects, fields));
                }.bind(this));
            }
            else {
                resolve(objects);
            }
        }.bind(this));
    }
    processObjects(objects, fields) {
        return objects;
    }
    onConnectionOpen(err) {
        this.logger.debug("SQL CONNECTION OPENED.");
    }
    onConnectionClosed(err) {
        this.logger.debug("SQL CONNECTION CLOSED.");
    }
    onConnectionError(err) {
        this.logger.error("SQL CONNECTION ERROR: " + err);
    }
}
