"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
const NodeCache = require("node-cache");
const SqlString = require("sqlstring");
const TdaoBase_1 = require("./TdaoBase");
const Promise = require("bluebird");
class TdaoMysql extends TdaoBase_1.TdaoBase {
    constructor(objectClassName, datasource, config) {
        super(objectClassName, datasource, config);
        this.table = null;
        this.viewTable = null;
        this.IDField = "id";
        this.IDFieldIsAuto = true;
        this.IDFieldType = "integer";
        this.cache = null;
        this.viewfieldsByName = null;
        this.tablefieldsByName = null;
        this.connections = 0;
        this.poolname = null;
        this.jsonFields = null;
        if (this.config.jsonFields) {
            this.jsonFields = {};
            for (let fieldname of this.config.jsonFields)
                this.jsonFields[fieldname] = true;
        }
        this.table = config.tableName;
        this.viewTable = this.table;
        if (this.config.viewName)
            this.viewTable = this.config.viewName;
        if (this.config.model.IDField)
            this.IDField = this.config.model.IDField;
        if (this.config.model.IDFieldType)
            this.IDFieldType = this.config.model.IDFieldType;
        if (typeof this.config.IDFieldIsAuto != "undefined")
            this.IDFieldIsAuto = this.config.IDFieldIsAuto;
        this.cache = new NodeCache({ stdTTL: 3600 });
        this.datasource.multipleStatements = true;
        this.datasource.dateStrings = true;
        this.poolname = this.datasource.host + "_" + this.datasource.database + "_" + this.datasource.port;
    }
    init() {
        return this.getFields("table")
            .then(() => {
            return this.getFields("view");
        });
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
    resetPool() {
        return new Promise((resolve, reject) => {
            if (typeof TdaoMysql.pool[this.poolname] !== "undefined") {
                TdaoMysql.pool[this.poolname].end((err) => {
                    if (err) {
                        this.logger.error('resetPool ' + this.poolname + ' ' + err.toString());
                        reject('resetPool: ' + this.poolname + ' ' + err.toString());
                    }
                    else {
                        this.logger.info('resetPool ' + this.poolname + ' OK');
                        resolve();
                    }
                });
                delete TdaoMysql.pool[this.poolname];
            }
            else {
                return resolve();
            }
        });
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
        return new Promise((resolve, reject) => {
            this.getPool().getConnection((err, connection) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.connections++;
                    resolve(connection);
                }
            });
        });
    }
    releaseConnection(connection) {
        connection.release();
        this.connections--;
    }
    beginTransaction(connection) {
        return new Promise((resolve, reject) => {
            connection.beginTransaction((err) => {
                if (err)
                    reject(err);
                else
                    resolve(connection);
            });
        });
    }
    commitTransaction(connection) {
        return new Promise((resolve, reject) => {
            connection.commit((err) => {
                if (err) {
                    connection.rollback();
                    reject(err);
                }
                else {
                    resolve(connection);
                }
                this.releaseConnection(connection);
            });
        });
    }
    rollbackTransaction(connection) {
        this.logger.error("ROLLBACK sur dao " + this.objectClassName);
        return new Promise((resolve, reject) => {
            if (connection == null) {
                resolve(connection);
            }
            else {
                connection.rollback((err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(connection);
                    }
                    this.releaseConnection(connection);
                });
            }
        });
    }
    queryTransaction(sql) {
        var conn = null;
        let rows;
        return this.getConnection()
            .then((connection) => {
            conn = connection;
            return this.beginTransaction(connection);
        })
            .then((connection) => {
            return this._query({ sql: sql }, connection);
        })
            .then((result) => {
            rows = result;
            return this.commitTransaction(conn);
        })
            .then((r) => {
            return rows;
        })
            .catch((err) => {
            if (conn)
                this.rollbackTransaction(conn);
            return Promise.reject(err);
        });
    }
    query(sql) {
        var conn = null;
        var startTime = new Date();
        return this.getConnection()
            .then((connection) => {
            conn = connection;
            return this._query({ sql: sql }, connection);
        })
            .then((rows) => {
            var xtime = new Date().getTime() - startTime.getTime();
            this.logger.trace("QUERY EXEC TIME=" + xtime + " ms");
            return rows;
        })
            .finally(() => {
            if (conn)
                this.releaseConnection(conn);
        });
    }
    _query(opt, connection) {
        return new Promise((resolve, reject) => {
            if (!opt.timeout)
                opt.timeout = this.queryTimeout;
            connection.query(opt, (err, rows, fields) => {
                if (err) {
                    this.logger.debug("SQL=" + opt.sql);
                    reject(err);
                }
                else {
                    if (typeof rows.push == "undefined")
                        resolve([rows]);
                    else
                        resolve(rows);
                }
            });
        });
    }
    execSelectQuery(sql, opt = {}) {
        return this.query(sql)
            .then((result) => {
            if ((typeof opt.processObjects === "undefined") || (opt.processObjects === true))
                return this._processObjects(result);
            else
                return result;
        });
    }
    select(opt = {}) {
        if (this.viewTable == null)
            throw new Error("viewTable is null");
        if (!opt.fields)
            opt.fields = "*";
        var sql = "select " + opt.fields + " from " + this.viewTable;
        if (opt.where)
            sql += " where " + opt.where;
        if (opt.groupBy)
            sql += " GROUP BY " + opt.groupBy;
        if (opt.orderBy)
            sql += " ORDER BY " + opt.orderBy;
        if (opt.limit)
            sql += " LIMIT " + opt.limit;
        return this.query(sql)
            .then((result) => {
            if ((typeof opt.processObjects === "undefined") || (opt.processObjects === true))
                return this._processObjects(result);
            else
                return result;
        });
    }
    selectOne(opt) {
        return this.select(opt).then((result) => {
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
            return this.query(sql)
                .then((fields) => {
                if (this[type + "fieldsByName"] == null) {
                    this[type + "fieldsByName"] = {};
                    for (var i = 0; i < fields.length; i++)
                        this[type + "fieldsByName"][fields[i].Field] = fields[i];
                }
                return this[type + "fieldsByName"];
            });
        }
        else {
            return Promise.resolve(this[type + "fieldsByName"]);
        }
    }
    getByIds(idList, opt = null) {
        var defautlOpt = { throwIfIncomplete: false };
        if (!opt) {
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
            .then((result) => {
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
        });
    }
    getById(id, opt = null) {
        var value = id;
        if (this.IDFieldType == "string") {
            value = "'" + id + "'";
        }
        else if (this.IDFieldType == "integer") {
            if (parseInt(value) != value)
                return Promise.reject("L'id doit être de type 'integer'. Valeur donnée: " + value);
        }
        var fields = "*";
        if (opt && opt.fields)
            fields = opt.fields;
        var sql = "select " + fields + " from " + this.viewTable + " where " + this.IDField + " = " + value + " LIMIT 1";
        return this.query(sql)
            .then((result) => {
            if (result.length > 0)
                return this._processObjects(result);
            else
                return null;
        })
            .then((result) => {
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
            .then((result) => {
            var recordsCount = this.cache.get("recordsCount");
            if (recordsCount)
                this.cache.set("recordsCount", result.affectedRows);
            return result;
        });
    }
    deleteById(id, opt) {
        return this.getById(id)
            .then((bddObject) => {
            if (bddObject == null)
                throw "Object " + id + " does not exists";
            else
                return this.queryTransaction("DELETE from " + this.table + " WHERE " + this.IDField + " = '" + id + "'");
        })
            .then((result) => {
            if (result.affectedRows == 0)
                throw "Object " + id + " does not exists";
            var recordsCount = this.cache.get("recordsCount");
            if (recordsCount)
                this.cache.set("recordsCount", recordsCount - 1);
            return id;
        });
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
            .then((fields) => {
            var sql = this.getInsertSql(obj);
            return this.queryTransaction(sql);
        })
            .then((result) => {
            return this.getById(result[0].insertId);
        })
            .then((result) => {
            if (result == null)
                throw new Error("Object " + result[this.IDField] + " not created");
            result._isNew = true;
            result._changed = true;
            return result;
        });
    }
    _update(obj, opt = {}) {
        this.logger.info("update in table '" + this.table + "' ID=" + this.getIds(obj));
        var isArray = (typeof obj.push == "function");
        var idList = this.getIds(obj);
        return this.getFields("table")
            .then(() => {
            return this.getByIds(idList, { throwIfIncomplete: true });
        })
            .then((bddObjects) => {
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
        })
            .then((sql) => {
            return this.queryTransaction(sql);
        })
            .then((result) => {
            return this.getByIds(idList, { throwIfIncomplete: true });
        })
            .then((bddObjects) => {
            var result = bddObjects;
            if (!isArray) {
                result = bddObjects[0];
                result._isNew = false;
                result._changed = true;
            }
            return result;
        });
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
        return this.query(sql)
            .then((result) => {
            var r = result[0].count;
            if (!whereIsSet)
                this.cache.set("recordsCount", r);
            return r;
        });
    }
    getSearchQuery(opt) {
        var r = {
            resultFields: {},
            where: null,
            groupBy: null,
            limit: null,
            offset: null,
            orderBy: null,
            sqlSelectFields: ""
        };
        return this.getFields("view")
            .then((fields) => {
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
            return r;
        });
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
            offset: null,
            processObjets: true
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
            .then((q) => {
            query = q;
            let sql = "SELECT " + query.sqlSelectFields + " from " + this.viewTable;
            if (query.where)
                sql += " WHERE " + query.where;
            if (query.groupBy)
                sql += " GROUP BY " + query.groupBy;
            if (query.orderBy)
                sql += " ORDER BY " + query.orderBy;
            if (query.limit)
                sql += " LIMIT " + query.limit;
            if (query.offset)
                sql += " OFFSET " + query.offset;
            return this.query(sql);
        })
            .then((result) => {
            if (opt.processObjets)
                return this._processObjects(result, query.resultFields);
            else
                return result;
        })
            .then((result) => {
            r.data = result;
        })
            .then((result) => {
            return this.getSearchTotalRecordCount(opt);
        })
            .then((total) => {
            r.total = total;
            if ((opt.limit != null) || (opt.offset != null) || query.where)
                return this.getRecordsCount(query.where);
            else
                return Promise.resolve(r.data.length);
        })
            .then((resultCount) => {
            r.resultCount = resultCount;
            r.limit = query.limit;
            r.offset = query.offset;
            r.groupBy = query.groupBy;
            r.orderBy = query.orderBy;
            return r;
        });
    }
    getSearchTotalRecordCount(opt) {
        return this.getRecordsCount();
    }
    _processObjects(objects, resultFields) {
        if (objects != null) {
            let fields;
            return this.getFields("view")
                .then((result) => {
                fields = result;
                for (var i = 0; i < objects.length; i++) {
                    var obj = objects[i];
                    for (var k in obj) {
                        if (this.viewfieldsByName[k]) {
                            if (obj[k] != null) {
                                var type = this.viewfieldsByName[k].Type;
                                if ((type == "bit(1)") && (typeof obj[k] == "object")) {
                                    obj[k] = (obj[k][0] === 1);
                                }
                                else if (typeof obj[k] == "string") {
                                    if ((type == "json") || (this.jsonFields && this.jsonFields[k]))
                                        obj[k] = JSON.parse(obj[k]);
                                }
                            }
                        }
                    }
                }
                return this.processObjects(objects, fields);
            });
        }
        else {
            return Promise.resolve(objects);
        }
    }
    processObjects(objects, fields) {
        return Promise.resolve(objects);
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
exports.TdaoMysql = TdaoMysql;
TdaoMysql.pool = {};
//# sourceMappingURL=TdaoMysql.js.map