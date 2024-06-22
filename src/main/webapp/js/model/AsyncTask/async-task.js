import { __assign, __extends, __read } from "tslib";
import { Subscribable } from '../Base/base-classes';
import * as React from 'react';
import _cloneDeep from 'lodash/cloneDeep';
import fetch from '../../../react-component/utils/fetch';
import { useParams } from 'react-router-dom';
import CQL from '../../cql';
import { v4 } from 'uuid';
export var convertToBackendCompatibleForm = function (_a) {
    var properties = _a.properties;
    var duplicatedProperties = _cloneDeep(properties);
    Object.keys(duplicatedProperties).forEach(function (key) {
        var _a, _b;
        if (typeof duplicatedProperties[key] !== 'string') {
            if (((_a = duplicatedProperties[key]) === null || _a === void 0 ? void 0 : _a.constructor) === Array) {
                duplicatedProperties[key] = duplicatedProperties[key].map(function (value) {
                    if (typeof value === 'object') {
                        // sorts on queries!
                        return value;
                    }
                    return value.toString();
                });
            }
            else {
                duplicatedProperties[key] = (_b = duplicatedProperties[key]) === null || _b === void 0 ? void 0 : _b.toString();
            }
        }
    });
    return duplicatedProperties;
};
/**
 *  Provides a singleton for tracking async tasks in the UI
 */
var AsyncTasksClass = /** @class */ (function (_super) {
    __extends(AsyncTasksClass, _super);
    function AsyncTasksClass() {
        var _this = _super.call(this) || this;
        _this.list = [];
        return _this;
    }
    AsyncTasksClass.prototype.delete = function (_a) {
        var lazyResult = _a.lazyResult;
        var existingTask = this.list
            .filter(DeleteTask.isInstanceOf)
            .find(function (task) { return task.lazyResult === lazyResult; });
        if (existingTask) {
            return existingTask;
        }
        var newTask = new DeleteTask({ lazyResult: lazyResult });
        this.add(newTask);
        return newTask;
    };
    AsyncTasksClass.prototype.restore = function (_a) {
        var lazyResult = _a.lazyResult;
        var existingTask = this.list
            .filter(RestoreTask.isInstanceOf)
            .find(function (task) { return task.lazyResult === lazyResult; });
        if (existingTask) {
            return existingTask;
        }
        var newTask = new RestoreTask({ lazyResult: lazyResult });
        this.add(newTask);
        return newTask;
    };
    AsyncTasksClass.prototype.create = function (_a) {
        var data = _a.data, metacardType = _a.metacardType;
        var newTask = new CreateTask({ data: data, metacardType: metacardType });
        this.add(newTask);
        return newTask;
    };
    AsyncTasksClass.prototype.save = function (_a) {
        var lazyResult = _a.lazyResult, data = _a.data, metacardType = _a.metacardType;
        var existingTask = this.list
            .filter(SaveTask.isInstanceOf)
            .find(function (task) { return task.lazyResult === lazyResult; });
        if (existingTask) {
            existingTask.update({ data: data });
            return existingTask;
        }
        var newTask = new SaveTask({ lazyResult: lazyResult, data: data, metacardType: metacardType });
        this.add(newTask);
        return newTask;
    };
    AsyncTasksClass.prototype.createSearch = function (_a) {
        var data = _a.data;
        var newTask = new CreateSearchTask({ data: data });
        this.add(newTask);
        return newTask;
    };
    AsyncTasksClass.prototype.saveSearch = function (_a) {
        var lazyResult = _a.lazyResult, data = _a.data;
        var existingTask = this.list
            .filter(SaveSearchTask.isInstanceOf)
            .find(function (task) { return task.lazyResult === lazyResult; });
        if (existingTask) {
            existingTask.update({ data: data });
            return existingTask;
        }
        var newTask = new SaveSearchTask({ lazyResult: lazyResult, data: data });
        this.add(newTask);
        return newTask;
    };
    AsyncTasksClass.prototype.isRestoreTask = function (task) {
        return RestoreTask.isInstanceOf(task);
    };
    AsyncTasksClass.prototype.isDeleteTask = function (task) {
        return DeleteTask.isInstanceOf(task);
    };
    AsyncTasksClass.prototype.isCreateTask = function (task) {
        return CreateTask.isInstanceOf(task);
    };
    AsyncTasksClass.prototype.isSaveTask = function (task) {
        return SaveTask.isInstanceOf(task);
    };
    AsyncTasksClass.prototype.isCreateSearchTask = function (task) {
        return CreateSearchTask.isInstanceOf(task);
    };
    AsyncTasksClass.prototype.isSaveSearchTask = function (task) {
        return SaveSearchTask.isInstanceOf(task);
    };
    AsyncTasksClass.prototype.hasShowableTasks = function () {
        return (this.list.filter(function (task) { return !SaveSearchTask.isInstanceOf(task); }).length > 0);
    };
    AsyncTasksClass.prototype.add = function (asyncTask) {
        if (this.list.indexOf(asyncTask) === -1) {
            this.list.push(asyncTask);
            this._notifySubscribers({ thing: 'add' });
            this._notifySubscribers({ thing: 'update' });
        }
    };
    AsyncTasksClass.prototype.remove = function (asyncTask) {
        var index = this.list.indexOf(asyncTask);
        if (index >= 0) {
            this.list.splice(this.list.indexOf(asyncTask), 1);
            this._notifySubscribers({ thing: 'remove' });
            this._notifySubscribers({ thing: 'update' });
        }
    };
    return AsyncTasksClass;
}(Subscribable));
export var AsyncTasks = new AsyncTasksClass();
/**
 * Goal is to provide a common abstraction to track long running async tasks in the UI, and free up the user to do whatever they want during them.
 * Through subscriptions, we'll allow views to track progress if necessary. (useTaskProgress hooks?)
 */
var AsyncTask = /** @class */ (function (_super) {
    __extends(AsyncTask, _super);
    function AsyncTask() {
        return _super.call(this) || this;
    }
    return AsyncTask;
}(Subscribable));
export var useRenderOnAsyncTasksAddOrRemove = function () {
    var _a = __read(React.useState(Math.random()), 2), setForceRender = _a[1];
    React.useEffect(function () {
        var unsub = AsyncTasks.subscribeTo({
            subscribableThing: 'update',
            callback: function () {
                setForceRender(Math.random());
            },
        });
        return function () {
            unsub();
        };
    }, []);
    return;
};
// allow someone to see if one exists, and sub to updates
export var useRestoreSearchTaskBasedOnParams = function () {
    var id = useParams().id;
    var task = useRestoreSearchTask({ id: id });
    return task;
};
// allow someone to see if one exists, and sub to updates
export var useRestoreSearchTask = function (_a) {
    var id = _a.id;
    var _b = __read(React.useState(null), 2), task = _b[0], setTask = _b[1];
    useRenderOnAsyncTasksAddOrRemove();
    React.useEffect(function () {
        var updateTask = function () {
            /**
             *  Watch out for metacard.deleted.id not existing, hence the guard,
             * and also that either id could match depending on where we are in the restore
             * process
             */
            var relevantTask = id
                ? AsyncTasks.list.filter(RestoreTask.isInstanceOf).find(function (task) {
                    return (task.lazyResult.plain.metacard.properties['metacard.deleted.id'] === id || task.lazyResult.plain.metacard.properties['id'] === id);
                })
                : null;
            setTask(relevantTask || null);
        };
        var unsub = AsyncTasks.subscribeTo({
            subscribableThing: 'update',
            callback: function () {
                updateTask();
            },
        });
        updateTask();
        return function () {
            unsub();
        };
    }, [id]);
    return task;
};
// allow someone to see if one exists, and sub to updates
export var useCreateTaskBasedOnParams = function () {
    var id = useParams().id;
    var task = useCreateTask({ id: id });
    return task;
};
// allow someone to see if one exists, and sub to updates
export var useCreateTask = function (_a) {
    var id = _a.id;
    var _b = __read(React.useState(null), 2), task = _b[0], setTask = _b[1];
    useRenderOnAsyncTasksAddOrRemove();
    React.useEffect(function () {
        var updateTask = function () {
            var relevantTask = AsyncTasks.list
                .filter(CreateTask.isInstanceOf)
                .find(function (task) {
                return task.data.id === id;
            });
            setTask(relevantTask || null);
        };
        var unsub = AsyncTasks.subscribeTo({
            subscribableThing: 'update',
            callback: function () {
                updateTask();
            },
        });
        updateTask();
        return function () {
            unsub();
        };
    }, [id]);
    return task;
};
// allow someone to see if one exists, and sub to updates
export var useSaveTaskBasedOnParams = function () {
    var id = useParams().id;
    var task = useSaveTask({ id: id });
    return task;
};
// allow someone to see if one exists, and sub to updates
export var useSaveTask = function (_a) {
    var id = _a.id;
    var _b = __read(React.useState(null), 2), task = _b[0], setTask = _b[1];
    useRenderOnAsyncTasksAddOrRemove();
    React.useEffect(function () {
        var updateTask = function () {
            var relevantTask = AsyncTasks.list
                .filter(SaveTask.isInstanceOf)
                .find(function (task) {
                return task.data.id === id;
            });
            setTask(relevantTask || null);
        };
        var unsub = AsyncTasks.subscribeTo({
            subscribableThing: 'update',
            callback: function () {
                updateTask();
            },
        });
        updateTask();
        return function () {
            unsub();
        };
    }, [id]);
    return task;
};
// allow someone to see if one exists, and sub to updates
export var useCreateSearchTaskBasedOnParams = function () {
    var id = useParams().id;
    var task = useCreateSearchTask({ id: id });
    return task;
};
// allow someone to see if one exists, and sub to updates
export var useCreateSearchTask = function (_a) {
    var id = _a.id;
    var _b = __read(React.useState(null), 2), task = _b[0], setTask = _b[1];
    useRenderOnAsyncTasksAddOrRemove();
    React.useEffect(function () {
        var updateTask = function () {
            var relevantTask = AsyncTasks.list
                .filter(CreateSearchTask.isInstanceOf)
                .find(function (task) {
                return task.data.id === id;
            });
            setTask(relevantTask || null);
        };
        var unsub = AsyncTasks.subscribeTo({
            subscribableThing: 'update',
            callback: function () {
                updateTask();
            },
        });
        updateTask();
        return function () {
            unsub();
        };
    }, [id]);
    return task;
};
// allow someone to see if one exists, and sub to updates
export var useSaveSearchTaskBasedOnParams = function () {
    var id = useParams().id;
    var task = useSaveSearchTask({ id: id });
    return task;
};
// allow someone to see if one exists, and sub to updates
export var useSaveSearchTask = function (_a) {
    var id = _a.id;
    var _b = __read(React.useState(null), 2), task = _b[0], setTask = _b[1];
    useRenderOnAsyncTasksAddOrRemove();
    React.useEffect(function () {
        var updateTask = function () {
            var relevantTask = AsyncTasks.list
                .filter(SaveSearchTask.isInstanceOf)
                .find(function (task) {
                return task.data.id === id;
            });
            setTask(relevantTask || null);
        };
        var unsub = AsyncTasks.subscribeTo({
            subscribableThing: 'update',
            callback: function () {
                updateTask();
            },
        });
        updateTask();
        return function () {
            unsub();
        };
    }, [id]);
    return task;
};
/**
 * Pass an async task that you want updates for.  Each update will cause your component to rerender,
 * and then you can then check whatever you want to about the task.
 */
export var useRenderOnAsyncTaskUpdate = function (_a) {
    var asyncTask = _a.asyncTask;
    var _b = __read(React.useState(Math.random()), 2), setForceRender = _b[1];
    React.useEffect(function () {
        var unsub = asyncTask.subscribeTo({
            subscribableThing: 'update',
            callback: function () {
                setForceRender(Math.random());
            },
        });
        return function () {
            unsub();
        };
    }, []);
    return;
};
var getCqlForFilterTree = function (filterTree) {
    if (typeof filterTree === 'string') {
        try {
            filterTree = JSON.parse(filterTree);
        }
        catch (err) {
            // Continue using string literal if string is not valid JSON.
        }
    }
    return CQL.write(filterTree);
};
var RestoreTask = /** @class */ (function (_super) {
    __extends(RestoreTask, _super);
    function RestoreTask(_a) {
        var lazyResult = _a.lazyResult;
        var _this = _super.call(this) || this;
        _this.lazyResult = lazyResult;
        _this.attemptRestore();
        return _this;
    }
    RestoreTask.prototype.attemptRestore = function () {
        var _this = this;
        var unsubscibeCallback = this.lazyResult.subscribeTo({
            subscribableThing: 'backboneSync',
            callback: function () {
                var deletedId = _this.lazyResult.plain.metacard.properties['metacard.deleted.id'];
                var deletedVersion = _this.lazyResult.plain.metacard.properties['metacard.deleted.version'];
                var sourceId = _this.lazyResult.plain.metacard.properties['source-id'];
                if (!deletedId) {
                    window.setTimeout(function () {
                        _this.lazyResult.refreshDataOverNetwork();
                    }, 5000);
                }
                else {
                    fetch("./internal/history/revert/".concat(deletedId, "/").concat(deletedVersion, "/").concat(sourceId)).then(function () {
                        _this._notifySubscribers({ thing: 'update' });
                    });
                    unsubscibeCallback();
                }
            },
        });
        window.setTimeout(function () {
            _this.lazyResult.refreshDataOverNetwork();
        }, 5000);
    };
    RestoreTask.isInstanceOf = function (task) {
        return task.constructor === RestoreTask;
    };
    return RestoreTask;
}(AsyncTask));
var DeleteTask = /** @class */ (function (_super) {
    __extends(DeleteTask, _super);
    function DeleteTask(_a) {
        var lazyResult = _a.lazyResult;
        var _this = _super.call(this) || this;
        _this.lazyResult = lazyResult;
        setTimeout(function () {
            _this.attemptDelete();
        }, 1000);
        return _this;
    }
    DeleteTask.prototype.attemptDelete = function () {
        var _this = this;
        var payload = {
            id: '1',
            jsonrpc: '2.0',
            method: 'ddf.catalog/delete',
            params: {
                ids: [this.lazyResult.plain.id],
            },
        };
        fetch('/direct', {
            method: 'POST',
            body: JSON.stringify(payload),
        }).then(function () {
            _this._notifySubscribers({ thing: 'update' });
        });
    };
    DeleteTask.isInstanceOf = function (task) {
        return task.constructor === DeleteTask;
    };
    return DeleteTask;
}(AsyncTask));
var CreateTask = /** @class */ (function (_super) {
    __extends(CreateTask, _super);
    function CreateTask(_a) {
        var data = _a.data, metacardType = _a.metacardType;
        var _this = _super.call(this) || this;
        _this.metacardType = metacardType;
        _this.data = data;
        _this.data.id = _this.data.id || v4();
        setTimeout(function () {
            _this.attemptSave();
        }, 1000);
        return _this;
    }
    CreateTask.prototype.attemptSave = function () {
        var _this = this;
        var payload = {
            id: '1',
            jsonrpc: '2.0',
            method: 'ddf.catalog/create',
            params: {
                metacards: [
                    {
                        attributes: __assign({}, convertToBackendCompatibleForm({ properties: this.data })),
                        metacardType: this.metacardType,
                    },
                ],
            },
        };
        fetch('/direct', {
            method: 'POST',
            body: JSON.stringify(payload),
        }).then(function () {
            _this._notifySubscribers({ thing: 'update' });
        });
    };
    CreateTask.isInstanceOf = function (task) {
        return task.constructor === CreateTask;
    };
    return CreateTask;
}(AsyncTask));
var SaveTask = /** @class */ (function (_super) {
    __extends(SaveTask, _super);
    function SaveTask(_a) {
        var lazyResult = _a.lazyResult, data = _a.data, metacardType = _a.metacardType;
        var _this = _super.call(this) || this;
        _this.metacardType = metacardType;
        _this.lazyResult = lazyResult;
        _this.data = data;
        _this.controller = new AbortController();
        _this.attemptSave();
        return _this;
    }
    SaveTask.prototype.update = function (_a) {
        var data = _a.data;
        clearTimeout(this.timeoutid);
        this.controller.abort();
        this.data = data;
        this.attemptSave();
    };
    SaveTask.prototype.attemptSave = function () {
        var _this = this;
        this.controller = new AbortController();
        this.timeoutid = window.setTimeout(function () {
            var payload = {
                id: '1',
                jsonrpc: '2.0',
                method: 'ddf.catalog/update',
                params: {
                    metacards: [
                        {
                            attributes: __assign({}, convertToBackendCompatibleForm({ properties: _this.data })),
                            metacardType: _this.metacardType,
                        },
                    ],
                },
            };
            fetch('/direct', {
                method: 'POST',
                body: JSON.stringify(payload),
                signal: _this.controller.signal,
            }).then(function () {
                _this.lazyResult.refreshDataOverNetwork();
                var unsub = _this.lazyResult.subscribeTo({
                    subscribableThing: 'backboneSync',
                    callback: function () {
                        _this._notifySubscribers({ thing: 'update' });
                        unsub();
                    },
                });
            });
        }, 500);
    };
    SaveTask.isInstanceOf = function (task) {
        return task.constructor === SaveTask;
    };
    return SaveTask;
}(AsyncTask));
var CreateSearchTask = /** @class */ (function (_super) {
    __extends(CreateSearchTask, _super);
    function CreateSearchTask(_a) {
        var data = _a.data;
        var _this = _super.call(this) || this;
        _this.data = data;
        _this.data.id = v4();
        setTimeout(function () {
            _this.attemptSave();
        }, 1000);
        return _this;
    }
    CreateSearchTask.prototype.attemptSave = function () {
        var _this = this;
        var payload = {
            id: '1',
            jsonrpc: '2.0',
            method: 'ddf.catalog/create',
            params: {
                metacards: [
                    {
                        attributes: __assign(__assign({}, convertToBackendCompatibleForm({ properties: this.data })), { 'metacard-tags': ['query'], cql: getCqlForFilterTree(this.data.filterTree) }),
                        metacardType: 'metacard.query',
                    },
                ],
            },
        };
        fetch('/direct', {
            method: 'POST',
            body: JSON.stringify(payload),
        }).then(function () {
            _this._notifySubscribers({ thing: 'update' });
        });
    };
    CreateSearchTask.isInstanceOf = function (task) {
        return task.constructor === CreateSearchTask;
    };
    return CreateSearchTask;
}(AsyncTask));
var SaveSearchTask = /** @class */ (function (_super) {
    __extends(SaveSearchTask, _super);
    function SaveSearchTask(_a) {
        var lazyResult = _a.lazyResult, data = _a.data;
        var _this = _super.call(this) || this;
        _this.lazyResult = lazyResult;
        _this.data = data;
        _this.controller = new AbortController();
        _this.attemptSave();
        return _this;
    }
    SaveSearchTask.prototype.update = function (_a) {
        var data = _a.data;
        clearTimeout(this.timeoutid);
        this.controller.abort();
        this.data = data;
        this.attemptSave();
    };
    SaveSearchTask.prototype.attemptSave = function () {
        var _this = this;
        this.controller = new AbortController();
        this.timeoutid = window.setTimeout(function () {
            var payload = {
                id: '1',
                jsonrpc: '2.0',
                method: 'ddf.catalog/create',
                params: {
                    metacards: [
                        {
                            attributes: __assign(__assign({}, convertToBackendCompatibleForm({ properties: _this.data })), { 'metacard-tags': ['query'], cql: getCqlForFilterTree(_this.data.filterTree) }),
                            metacardType: 'metacard.query',
                        },
                    ],
                },
            };
            fetch('/direct', {
                method: 'POST',
                body: JSON.stringify(payload),
                signal: _this.controller.signal,
            }).then(function () {
                _this.lazyResult.refreshDataOverNetwork();
                var unsub = _this.lazyResult.subscribeTo({
                    subscribableThing: 'backboneSync',
                    callback: function () {
                        _this._notifySubscribers({ thing: 'update' });
                        unsub();
                    },
                });
            });
        }, 500);
    };
    SaveSearchTask.isInstanceOf = function (task) {
        return task.constructor === SaveSearchTask;
    };
    return SaveSearchTask;
}(AsyncTask));
//# sourceMappingURL=async-task.js.map