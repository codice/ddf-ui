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
        var _a;
        if (typeof duplicatedProperties[key] !== 'string') {
            if (Array.isArray(duplicatedProperties[key])) {
                duplicatedProperties[key] = duplicatedProperties[key].map(function (value) {
                    if (typeof value === 'object') {
                        // sorts on queries!
                        return value;
                    }
                    return value.toString();
                });
            }
            else {
                duplicatedProperties[key] = (_a = duplicatedProperties[key]) === null || _a === void 0 ? void 0 : _a.toString();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmMtdGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9Bc3luY1Rhc2svYXN5bmMtdGFzay50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUNuRCxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLFVBQVUsTUFBTSxrQkFBa0IsQ0FBQTtBQUV6QyxPQUFPLEtBQUssTUFBTSxzQ0FBc0MsQ0FBQTtBQUN4RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDNUMsT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFBO0FBQzNCLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFTekIsTUFBTSxDQUFDLElBQU0sOEJBQThCLEdBQUcsVUFBQyxFQUk5QztRQUhDLFVBQVUsZ0JBQUE7SUFJVixJQUFNLG9CQUFvQixHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNuRCxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRzs7UUFDNUMsSUFBSSxPQUFPLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxLQUFLLFFBQVEsRUFBRTtZQUNqRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDNUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEdBQUksb0JBQW9CLENBQUMsR0FBRyxDQUFXLENBQUMsR0FBRyxDQUNsRSxVQUFDLEtBQUs7b0JBQ0osSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7d0JBQzdCLG9CQUFvQjt3QkFDcEIsT0FBTyxLQUFLLENBQUE7cUJBQ2I7b0JBQ0QsT0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENB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QUFRLEVBQUU7d0JBQ1IsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUE7d0JBQzVDLEtBQUssRUFBRSxDQUFBO29CQUNULENBQUM7aUJBQ0YsQ0FBQyxDQUFBO1lBQ0osQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDVCxDQUFDO0lBQ00sMkJBQVksR0FBbkIsVUFBb0IsSUFBUztRQUMzQixPQUFPLElBQUksQ0FBQyxXQUFXLEtBQUssY0FBYyxDQUFBO0lBQzVDLENBQUM7SUFDSCxxQkFBQztBQUFELENBQUMsQUFoRUQsQ0FBNkIsU0FBUyxHQWdFckMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdWJzY3JpYmFibGUgfSBmcm9tICcuLi9CYXNlL2Jhc2UtY2xhc3NlcydcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IF9jbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCdcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgZmV0Y2ggZnJvbSAnLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL2ZldGNoJ1xuaW1wb3J0IHsgdXNlUGFyYW1zIH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSdcbmltcG9ydCBDUUwgZnJvbSAnLi4vLi4vY3FsJ1xuaW1wb3J0IHsgdjQgfSBmcm9tICd1dWlkJ1xuXG50eXBlIFBsYWluTWV0YWNhcmRQcm9wZXJ0aWVzVHlwZSA9XG4gIExhenlRdWVyeVJlc3VsdFsncGxhaW4nXVsnbWV0YWNhcmQnXVsncHJvcGVydGllcyddXG5cbnR5cGUgTWluaW1hbFByb3BlcnR5U2V0ID0gUGFydGlhbDxQbGFpbk1ldGFjYXJkUHJvcGVydGllc1R5cGU+ICYge1xuICB0aXRsZTogUGxhaW5NZXRhY2FyZFByb3BlcnRpZXNUeXBlWyd0aXRsZSddXG59XG5cbmV4cG9ydCBjb25zdCBjb252ZXJ0VG9CYWNrZW5kQ29tcGF0aWJsZUZvcm0gPSAoe1xuICBwcm9wZXJ0aWVzLFxufToge1xuICBwcm9wZXJ0aWVzOiBNaW5pbWFsUHJvcGVydHlTZXRcbn0pID0+IHtcbiAgY29uc3QgZHVwbGljYXRlZFByb3BlcnRpZXMgPSBfY2xvbmVEZWVwKHByb3BlcnRpZXMpXG4gIE9iamVjdC5rZXlzKGR1cGxpY2F0ZWRQcm9wZXJ0aWVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAodHlwZW9mIGR1cGxpY2F0ZWRQcm9wZXJ0aWVzW2tleV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShkdXBsaWNhdGVkUHJvcGVydGllc1trZXldKSkge1xuICAgICAgICBkdXBsaWNhdGVkUHJvcGVydGllc1trZXldID0gKGR1cGxpY2F0ZWRQcm9wZXJ0aWVzW2tleV0gYXMgYW55W10pLm1hcChcbiAgICAgICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgIC8vIHNvcnRzIG9uIHF1ZXJpZXMhXG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKClcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGR1cGxpY2F0ZWRQcm9wZXJ0aWVzW2tleV0gPSBkdXBsaWNhdGVkUHJvcGVydGllc1trZXldPy50b1N0cmluZygpXG4gICAgICB9XG4gICAgfVxuICB9KVxuICByZXR1cm4gZHVwbGljYXRlZFByb3BlcnRpZXNcbn1cblxudHlwZSBBc3luY1N1YnNjcmlwdGlvbnNUeXBlID0geyB0aGluZzogJ3VwZGF0ZScgfVxuLyoqXG4gKiAgUHJvdmlkZXMgYSBzaW5nbGV0b24gZm9yIHRyYWNraW5nIGFzeW5jIHRhc2tzIGluIHRoZSBVSVxuICovXG5jbGFzcyBBc3luY1Rhc2tzQ2xhc3MgZXh0ZW5kcyBTdWJzY3JpYmFibGU8e1xuICB0aGluZzogJ2FkZCcgfCAncmVtb3ZlJyB8ICd1cGRhdGUnXG59PiB7XG4gIGxpc3Q6IEFycmF5PEFzeW5jVGFzaz5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMubGlzdCA9IFtdXG4gIH1cbiAgZGVsZXRlKHsgbGF6eVJlc3VsdCB9OiB7IGxhenlSZXN1bHQ6IExhenlRdWVyeVJlc3VsdCB9KSB7XG4gICAgY29uc3QgZXhpc3RpbmdUYXNrID0gdGhpcy5saXN0XG4gICAgICAuZmlsdGVyKERlbGV0ZVRhc2suaXNJbnN0YW5jZU9mKVxuICAgICAgLmZpbmQoKHRhc2spID0+IHRhc2subGF6eVJlc3VsdCA9PT0gbGF6eVJlc3VsdClcbiAgICBpZiAoZXhpc3RpbmdUYXNrKSB7XG4gICAgICByZXR1cm4gZXhpc3RpbmdUYXNrXG4gICAgfVxuICAgIGNvbnN0IG5ld1Rhc2sgPSBuZXcgRGVsZXRlVGFzayh7IGxhenlSZXN1bHQgfSlcbiAgICB0aGlzLmFkZChuZXdUYXNrKVxuICAgIHJldHVybiBuZXdUYXNrXG4gIH1cbiAgcmVzdG9yZSh7IGxhenlSZXN1bHQgfTogeyBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHQgfSkge1xuICAgIGNvbnN0IGV4aXN0aW5nVGFzayA9IHRoaXMubGlzdFxuICAgICAgLmZpbHRlcihSZXN0b3JlVGFzay5pc0luc3RhbmNlT2YpXG4gICAgICAuZmluZCgodGFzaykgPT4gdGFzay5sYXp5UmVzdWx0ID09PSBsYXp5UmVzdWx0KVxuICAgIGlmIChleGlzdGluZ1Rhc2spIHtcbiAgICAgIHJldHVybiBleGlzdGluZ1Rhc2tcbiAgICB9XG4gICAgY29uc3QgbmV3VGFzayA9IG5ldyBSZXN0b3JlVGFzayh7IGxhenlSZXN1bHQgfSlcbiAgICB0aGlzLmFkZChuZXdUYXNrKVxuICAgIHJldHVybiBuZXdUYXNrXG4gIH1cbiAgY3JlYXRlKHtcbiAgICBkYXRhLFxuICAgIG1ldGFjYXJkVHlwZSxcbiAgfToge1xuICAgIGRhdGE6IE1pbmltYWxQcm9wZXJ0eVNldFxuICAgIG1ldGFjYXJkVHlwZTogc3RyaW5nXG4gIH0pIHtcbiAgICBjb25zdCBuZXdUYXNrID0gbmV3IENyZWF0ZVRhc2soeyBkYXRhLCBtZXRhY2FyZFR5cGUgfSlcbiAgICB0aGlzLmFkZChuZXdUYXNrKVxuICAgIHJldHVybiBuZXdUYXNrXG4gIH1cbiAgc2F2ZSh7XG4gICAgbGF6eVJlc3VsdCxcbiAgICBkYXRhLFxuICAgIG1ldGFjYXJkVHlwZSxcbiAgfToge1xuICAgIGRhdGE6IFBsYWluTWV0YWNhcmRQcm9wZXJ0aWVzVHlwZVxuICAgIGxhenlSZXN1bHQ6IExhenlRdWVyeVJlc3VsdFxuICAgIG1ldGFjYXJkVHlwZTogc3RyaW5nXG4gIH0pIHtcbiAgICBjb25zdCBleGlzdGluZ1Rhc2sgPSB0aGlzLmxpc3RcbiAgICAgIC5maWx0ZXIoU2F2ZVRhc2suaXNJbnN0YW5jZU9mKVxuICAgICAgLmZpbmQoKHRhc2spID0+IHRhc2subGF6eVJlc3VsdCA9PT0gbGF6eVJlc3VsdClcbiAgICBpZiAoZXhpc3RpbmdUYXNrKSB7XG4gICAgICBleGlzdGluZ1Rhc2sudXBkYXRlKHsgZGF0YSB9KVxuICAgICAgcmV0dXJuIGV4aXN0aW5nVGFza1xuICAgIH1cbiAgICBjb25zdCBuZXdUYXNrID0gbmV3IFNhdmVUYXNrKHsgbGF6eVJlc3VsdCwgZGF0YSwgbWV0YWNhcmRUeXBlIH0pXG4gICAgdGhpcy5hZGQobmV3VGFzaylcbiAgICByZXR1cm4gbmV3VGFza1xuICB9XG4gIGNyZWF0ZVNlYXJjaCh7IGRhdGEgfTogeyBkYXRhOiBQbGFpbk1ldGFjYXJkUHJvcGVydGllc1R5cGUgfSkge1xuICAgIGNvbnN0IG5ld1Rhc2sgPSBuZXcgQ3JlYXRlU2VhcmNoVGFzayh7IGRhdGEgfSlcbiAgICB0aGlzLmFkZChuZXdUYXNrKVxuICAgIHJldHVybiBuZXdUYXNrXG4gIH1cbiAgc2F2ZVNlYXJjaCh7XG4gICAgbGF6eVJlc3VsdCxcbiAgICBkYXRhLFxuICB9OiB7XG4gICAgZGF0YTogUGxhaW5NZXRhY2FyZFByb3BlcnRpZXNUeXBlXG4gICAgbGF6eVJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0XG4gIH0pIHtcbiAgICBjb25zdCBleGlzdGluZ1Rhc2sgPSB0aGlzLmxpc3RcbiAgICAgIC5maWx0ZXIoU2F2ZVNlYXJjaFRhc2suaXNJbnN0YW5jZU9mKVxuICAgICAgLmZpbmQoKHRhc2spID0+IHRhc2subGF6eVJlc3VsdCA9PT0gbGF6eVJlc3VsdClcbiAgICBpZiAoZXhpc3RpbmdUYXNrKSB7XG4gICAgICBleGlzdGluZ1Rhc2sudXBkYXRlKHsgZGF0YSB9KVxuICAgICAgcmV0dXJuIGV4aXN0aW5nVGFza1xuICAgIH1cbiAgICBjb25zdCBuZXdUYXNrID0gbmV3IFNhdmVTZWFyY2hUYXNrKHsgbGF6eVJlc3VsdCwgZGF0YSB9KVxuICAgIHRoaXMuYWRkKG5ld1Rhc2spXG4gICAgcmV0dXJuIG5ld1Rhc2tcbiAgfVxuICBpc1Jlc3RvcmVUYXNrKHRhc2s6IEFzeW5jVGFzayk6IHRhc2sgaXMgUmVzdG9yZVRhc2sge1xuICAgIHJldHVybiBSZXN0b3JlVGFzay5pc0luc3RhbmNlT2YodGFzaylcbiAgfVxuICBpc0RlbGV0ZVRhc2sodGFzazogQXN5bmNUYXNrKTogdGFzayBpcyBEZWxldGVUYXNrIHtcbiAgICByZXR1cm4gRGVsZXRlVGFzay5pc0luc3RhbmNlT2YodGFzaylcbiAgfVxuICBpc0NyZWF0ZVRhc2sodGFzazogQXN5bmNUYXNrKTogdGFzayBpcyBDcmVhdGVUYXNrIHtcbiAgICByZXR1cm4gQ3JlYXRlVGFzay5pc0luc3RhbmNlT2YodGFzaylcbiAgfVxuICBpc1NhdmVUYXNrKHRhc2s6IEFzeW5jVGFzayk6IHRhc2sgaXMgU2F2ZVRhc2sge1xuICAgIHJldHVybiBTYXZlVGFzay5pc0luc3RhbmNlT2YodGFzaylcbiAgfVxuICBpc0NyZWF0ZVNlYXJjaFRhc2sodGFzazogQXN5bmNUYXNrKTogdGFzayBpcyBDcmVhdGVTZWFyY2hUYXNrIHtcbiAgICByZXR1cm4gQ3JlYXRlU2VhcmNoVGFzay5pc0luc3RhbmNlT2YodGFzaylcbiAgfVxuICBpc1NhdmVTZWFyY2hUYXNrKHRhc2s6IEFzeW5jVGFzayk6IHRhc2sgaXMgU2F2ZVNlYXJjaFRhc2sge1xuICAgIHJldHVybiBTYXZlU2VhcmNoVGFzay5pc0luc3RhbmNlT2YodGFzaylcbiAgfVxuICBoYXNTaG93YWJsZVRhc2tzKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmxpc3QuZmlsdGVyKCh0YXNrKSA9PiAhU2F2ZVNlYXJjaFRhc2suaXNJbnN0YW5jZU9mKHRhc2spKS5sZW5ndGggPiAwXG4gICAgKVxuICB9XG4gIHByaXZhdGUgYWRkKGFzeW5jVGFzazogQXN5bmNUYXNrKSB7XG4gICAgaWYgKHRoaXMubGlzdC5pbmRleE9mKGFzeW5jVGFzaykgPT09IC0xKSB7XG4gICAgICB0aGlzLmxpc3QucHVzaChhc3luY1Rhc2spXG4gICAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyh7IHRoaW5nOiAnYWRkJyB9KVxuICAgICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoeyB0aGluZzogJ3VwZGF0ZScgfSlcbiAgICB9XG4gIH1cbiAgcmVtb3ZlKGFzeW5jVGFzazogQXN5bmNUYXNrKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmxpc3QuaW5kZXhPZihhc3luY1Rhc2spXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIHRoaXMubGlzdC5zcGxpY2UodGhpcy5saXN0LmluZGV4T2YoYXN5bmNUYXNrKSwgMSlcbiAgICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKHsgdGhpbmc6ICdyZW1vdmUnIH0pXG4gICAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyh7IHRoaW5nOiAndXBkYXRlJyB9KVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQXN5bmNUYXNrcyA9IG5ldyBBc3luY1Rhc2tzQ2xhc3MoKVxuXG4vKipcbiAqIEdvYWwgaXMgdG8gcHJvdmlkZSBhIGNvbW1vbiBhYnN0cmFjdGlvbiB0byB0cmFjayBsb25nIHJ1bm5pbmcgYXN5bmMgdGFza3MgaW4gdGhlIFVJLCBhbmQgZnJlZSB1cCB0aGUgdXNlciB0byBkbyB3aGF0ZXZlciB0aGV5IHdhbnQgZHVyaW5nIHRoZW0uXG4gKiBUaHJvdWdoIHN1YnNjcmlwdGlvbnMsIHdlJ2xsIGFsbG93IHZpZXdzIHRvIHRyYWNrIHByb2dyZXNzIGlmIG5lY2Vzc2FyeS4gKHVzZVRhc2tQcm9ncmVzcyBob29rcz8pXG4gKi9cbmFic3RyYWN0IGNsYXNzIEFzeW5jVGFzayBleHRlbmRzIFN1YnNjcmliYWJsZTxBc3luY1N1YnNjcmlwdGlvbnNUeXBlPiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKClcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgdXNlUmVuZGVyT25Bc3luY1Rhc2tzQWRkT3JSZW1vdmUgPSAoKSA9PiB7XG4gIGNvbnN0IFssIHNldEZvcmNlUmVuZGVyXSA9IFJlYWN0LnVzZVN0YXRlKE1hdGgucmFuZG9tKCkpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdW5zdWIgPSBBc3luY1Rhc2tzLnN1YnNjcmliZVRvKHtcbiAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAndXBkYXRlJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIHNldEZvcmNlUmVuZGVyKE1hdGgucmFuZG9tKCkpXG4gICAgICB9LFxuICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHVuc3ViKClcbiAgICB9XG4gIH0sIFtdKVxuICByZXR1cm5cbn1cblxuLy8gYWxsb3cgc29tZW9uZSB0byBzZWUgaWYgb25lIGV4aXN0cywgYW5kIHN1YiB0byB1cGRhdGVzXG5leHBvcnQgY29uc3QgdXNlUmVzdG9yZVNlYXJjaFRhc2tCYXNlZE9uUGFyYW1zID0gKCkgPT4ge1xuICBjb25zdCB7IGlkIH0gPSB1c2VQYXJhbXM8eyBpZD86IHN0cmluZyB9PigpXG4gIGNvbnN0IHRhc2sgPSB1c2VSZXN0b3JlU2VhcmNoVGFzayh7IGlkIH0pXG4gIHJldHVybiB0YXNrXG59XG5cbi8vIGFsbG93IHNvbWVvbmUgdG8gc2VlIGlmIG9uZSBleGlzdHMsIGFuZCBzdWIgdG8gdXBkYXRlc1xuZXhwb3J0IGNvbnN0IHVzZVJlc3RvcmVTZWFyY2hUYXNrID0gKHsgaWQgfTogeyBpZD86IHN0cmluZyB9KSA9PiB7XG4gIGNvbnN0IFt0YXNrLCBzZXRUYXNrXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwgYXMgbnVsbCB8IFJlc3RvcmVUYXNrKVxuICB1c2VSZW5kZXJPbkFzeW5jVGFza3NBZGRPclJlbW92ZSgpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdXBkYXRlVGFzayA9ICgpID0+IHtcbiAgICAgIC8qKlxuICAgICAgICogIFdhdGNoIG91dCBmb3IgbWV0YWNhcmQuZGVsZXRlZC5pZCBub3QgZXhpc3RpbmcsIGhlbmNlIHRoZSBndWFyZCxcbiAgICAgICAqIGFuZCBhbHNvIHRoYXQgZWl0aGVyIGlkIGNvdWxkIG1hdGNoIGRlcGVuZGluZyBvbiB3aGVyZSB3ZSBhcmUgaW4gdGhlIHJlc3RvcmVcbiAgICAgICAqIHByb2Nlc3NcbiAgICAgICAqL1xuICAgICAgY29uc3QgcmVsZXZhbnRUYXNrID0gaWRcbiAgICAgICAgPyBBc3luY1Rhc2tzLmxpc3QuZmlsdGVyKFJlc3RvcmVUYXNrLmlzSW5zdGFuY2VPZikuZmluZCgodGFzaykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgdGFzay5sYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbXG4gICAgICAgICAgICAgICAgJ21ldGFjYXJkLmRlbGV0ZWQuaWQnXG4gICAgICAgICAgICAgIF0gPT09IGlkIHx8IHRhc2subGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydpZCddID09PSBpZFxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0pXG4gICAgICAgIDogbnVsbFxuICAgICAgc2V0VGFzayhyZWxldmFudFRhc2sgfHwgbnVsbClcbiAgICB9XG4gICAgY29uc3QgdW5zdWIgPSBBc3luY1Rhc2tzLnN1YnNjcmliZVRvKHtcbiAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAndXBkYXRlJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVRhc2soKVxuICAgICAgfSxcbiAgICB9KVxuICAgIHVwZGF0ZVRhc2soKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB1bnN1YigpXG4gICAgfVxuICB9LCBbaWRdKVxuXG4gIHJldHVybiB0YXNrXG59XG5cbi8vIGFsbG93IHNvbWVvbmUgdG8gc2VlIGlmIG9uZSBleGlzdHMsIGFuZCBzdWIgdG8gdXBkYXRlc1xuZXhwb3J0IGNvbnN0IHVzZUNyZWF0ZVRhc2tCYXNlZE9uUGFyYW1zID0gKCkgPT4ge1xuICBjb25zdCB7IGlkIH0gPSB1c2VQYXJhbXM8eyBpZD86IHN0cmluZyB9PigpXG4gIGNvbnN0IHRhc2sgPSB1c2VDcmVhdGVUYXNrKHsgaWQgfSlcbiAgcmV0dXJuIHRhc2tcbn1cblxuLy8gYWxsb3cgc29tZW9uZSB0byBzZWUgaWYgb25lIGV4aXN0cywgYW5kIHN1YiB0byB1cGRhdGVzXG5leHBvcnQgY29uc3QgdXNlQ3JlYXRlVGFzayA9ICh7IGlkIH06IHsgaWQ/OiBzdHJpbmcgfSkgPT4ge1xuICBjb25zdCBbdGFzaywgc2V0VGFza10gPSBSZWFjdC51c2VTdGF0ZShudWxsIGFzIG51bGwgfCBDcmVhdGVUYXNrKVxuICB1c2VSZW5kZXJPbkFzeW5jVGFza3NBZGRPclJlbW92ZSgpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdXBkYXRlVGFzayA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHJlbGV2YW50VGFzayA9IEFzeW5jVGFza3MubGlzdFxuICAgICAgICAuZmlsdGVyKENyZWF0ZVRhc2suaXNJbnN0YW5jZU9mKVxuICAgICAgICAuZmluZCgodGFzaykgPT4ge1xuICAgICAgICAgIHJldHVybiB0YXNrLmRhdGEuaWQgPT09IGlkXG4gICAgICAgIH0pXG4gICAgICBzZXRUYXNrKHJlbGV2YW50VGFzayB8fCBudWxsKVxuICAgIH1cbiAgICBjb25zdCB1bnN1YiA9IEFzeW5jVGFza3Muc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICd1cGRhdGUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgdXBkYXRlVGFzaygpXG4gICAgICB9LFxuICAgIH0pXG4gICAgdXBkYXRlVGFzaygpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHVuc3ViKClcbiAgICB9XG4gIH0sIFtpZF0pXG5cbiAgcmV0dXJuIHRhc2tcbn1cblxuLy8gYWxsb3cgc29tZW9uZSB0byBzZWUgaWYgb25lIGV4aXN0cywgYW5kIHN1YiB0byB1cGRhdGVzXG5leHBvcnQgY29uc3QgdXNlU2F2ZVRhc2tCYXNlZE9uUGFyYW1zID0gKCkgPT4ge1xuICBjb25zdCB7IGlkIH0gPSB1c2VQYXJhbXM8eyBpZD86IHN0cmluZyB9PigpXG4gIGNvbnN0IHRhc2sgPSB1c2VTYXZlVGFzayh7IGlkIH0pXG4gIHJldHVybiB0YXNrXG59XG5cbi8vIGFsbG93IHNvbWVvbmUgdG8gc2VlIGlmIG9uZSBleGlzdHMsIGFuZCBzdWIgdG8gdXBkYXRlc1xuZXhwb3J0IGNvbnN0IHVzZVNhdmVUYXNrID0gKHsgaWQgfTogeyBpZD86IHN0cmluZyB9KSA9PiB7XG4gIGNvbnN0IFt0YXNrLCBzZXRUYXNrXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwgYXMgbnVsbCB8IFNhdmVUYXNrKVxuICB1c2VSZW5kZXJPbkFzeW5jVGFza3NBZGRPclJlbW92ZSgpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdXBkYXRlVGFzayA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHJlbGV2YW50VGFzayA9IEFzeW5jVGFza3MubGlzdFxuICAgICAgICAuZmlsdGVyKFNhdmVUYXNrLmlzSW5zdGFuY2VPZilcbiAgICAgICAgLmZpbmQoKHRhc2spID0+IHtcbiAgICAgICAgICByZXR1cm4gdGFzay5kYXRhLmlkID09PSBpZFxuICAgICAgICB9KVxuICAgICAgc2V0VGFzayhyZWxldmFudFRhc2sgfHwgbnVsbClcbiAgICB9XG4gICAgY29uc3QgdW5zdWIgPSBBc3luY1Rhc2tzLnN1YnNjcmliZVRvKHtcbiAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAndXBkYXRlJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVRhc2soKVxuICAgICAgfSxcbiAgICB9KVxuICAgIHVwZGF0ZVRhc2soKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB1bnN1YigpXG4gICAgfVxuICB9LCBbaWRdKVxuXG4gIHJldHVybiB0YXNrXG59XG5cbi8vIGFsbG93IHNvbWVvbmUgdG8gc2VlIGlmIG9uZSBleGlzdHMsIGFuZCBzdWIgdG8gdXBkYXRlc1xuZXhwb3J0IGNvbnN0IHVzZUNyZWF0ZVNlYXJjaFRhc2tCYXNlZE9uUGFyYW1zID0gKCkgPT4ge1xuICBjb25zdCB7IGlkIH0gPSB1c2VQYXJhbXM8eyBpZD86IHN0cmluZyB9PigpXG4gIGNvbnN0IHRhc2sgPSB1c2VDcmVhdGVTZWFyY2hUYXNrKHsgaWQgfSlcbiAgcmV0dXJuIHRhc2tcbn1cblxuLy8gYWxsb3cgc29tZW9uZSB0byBzZWUgaWYgb25lIGV4aXN0cywgYW5kIHN1YiB0byB1cGRhdGVzXG5leHBvcnQgY29uc3QgdXNlQ3JlYXRlU2VhcmNoVGFzayA9ICh7IGlkIH06IHsgaWQ/OiBzdHJpbmcgfSkgPT4ge1xuICBjb25zdCBbdGFzaywgc2V0VGFza10gPSBSZWFjdC51c2VTdGF0ZShudWxsIGFzIG51bGwgfCBDcmVhdGVTZWFyY2hUYXNrKVxuICB1c2VSZW5kZXJPbkFzeW5jVGFza3NBZGRPclJlbW92ZSgpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdXBkYXRlVGFzayA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHJlbGV2YW50VGFzayA9IEFzeW5jVGFza3MubGlzdFxuICAgICAgICAuZmlsdGVyKENyZWF0ZVNlYXJjaFRhc2suaXNJbnN0YW5jZU9mKVxuICAgICAgICAuZmluZCgodGFzaykgPT4ge1xuICAgICAgICAgIHJldHVybiB0YXNrLmRhdGEuaWQgPT09IGlkXG4gICAgICAgIH0pXG4gICAgICBzZXRUYXNrKHJlbGV2YW50VGFzayB8fCBudWxsKVxuICAgIH1cbiAgICBjb25zdCB1bnN1YiA9IEFzeW5jVGFza3Muc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICd1cGRhdGUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgdXBkYXRlVGFzaygpXG4gICAgICB9LFxuICAgIH0pXG4gICAgdXBkYXRlVGFzaygpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHVuc3ViKClcbiAgICB9XG4gIH0sIFtpZF0pXG5cbiAgcmV0dXJuIHRhc2tcbn1cblxuLy8gYWxsb3cgc29tZW9uZSB0byBzZWUgaWYgb25lIGV4aXN0cywgYW5kIHN1YiB0byB1cGRhdGVzXG5leHBvcnQgY29uc3QgdXNlU2F2ZVNlYXJjaFRhc2tCYXNlZE9uUGFyYW1zID0gKCkgPT4ge1xuICBjb25zdCB7IGlkIH0gPSB1c2VQYXJhbXM8eyBpZD86IHN0cmluZyB9PigpXG4gIGNvbnN0IHRhc2sgPSB1c2VTYXZlU2VhcmNoVGFzayh7IGlkIH0pXG4gIHJldHVybiB0YXNrXG59XG5cbi8vIGFsbG93IHNvbWVvbmUgdG8gc2VlIGlmIG9uZSBleGlzdHMsIGFuZCBzdWIgdG8gdXBkYXRlc1xuZXhwb3J0IGNvbnN0IHVzZVNhdmVTZWFyY2hUYXNrID0gKHsgaWQgfTogeyBpZD86IHN0cmluZyB9KSA9PiB7XG4gIGNvbnN0IFt0YXNrLCBzZXRUYXNrXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwgYXMgbnVsbCB8IENyZWF0ZVNlYXJjaFRhc2spXG4gIHVzZVJlbmRlck9uQXN5bmNUYXNrc0FkZE9yUmVtb3ZlKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB1cGRhdGVUYXNrID0gKCkgPT4ge1xuICAgICAgY29uc3QgcmVsZXZhbnRUYXNrID0gQXN5bmNUYXNrcy5saXN0XG4gICAgICAgIC5maWx0ZXIoU2F2ZVNlYXJjaFRhc2suaXNJbnN0YW5jZU9mKVxuICAgICAgICAuZmluZCgodGFzaykgPT4ge1xuICAgICAgICAgIHJldHVybiB0YXNrLmRhdGEuaWQgPT09IGlkXG4gICAgICAgIH0pXG4gICAgICBzZXRUYXNrKHJlbGV2YW50VGFzayB8fCBudWxsKVxuICAgIH1cbiAgICBjb25zdCB1bnN1YiA9IEFzeW5jVGFza3Muc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICd1cGRhdGUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgdXBkYXRlVGFzaygpXG4gICAgICB9LFxuICAgIH0pXG4gICAgdXBkYXRlVGFzaygpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHVuc3ViKClcbiAgICB9XG4gIH0sIFtpZF0pXG5cbiAgcmV0dXJuIHRhc2tcbn1cblxuLyoqXG4gKiBQYXNzIGFuIGFzeW5jIHRhc2sgdGhhdCB5b3Ugd2FudCB1cGRhdGVzIGZvci4gIEVhY2ggdXBkYXRlIHdpbGwgY2F1c2UgeW91ciBjb21wb25lbnQgdG8gcmVyZW5kZXIsXG4gKiBhbmQgdGhlbiB5b3UgY2FuIHRoZW4gY2hlY2sgd2hhdGV2ZXIgeW91IHdhbnQgdG8gYWJvdXQgdGhlIHRhc2suXG4gKi9cbmV4cG9ydCBjb25zdCB1c2VSZW5kZXJPbkFzeW5jVGFza1VwZGF0ZSA9ICh7XG4gIGFzeW5jVGFzayxcbn06IHtcbiAgYXN5bmNUYXNrOiBBc3luY1Rhc2tcbn0pID0+IHtcbiAgY29uc3QgWywgc2V0Rm9yY2VSZW5kZXJdID0gUmVhY3QudXNlU3RhdGUoTWF0aC5yYW5kb20oKSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB1bnN1YiA9IGFzeW5jVGFzay5zdWJzY3JpYmVUbyh7XG4gICAgICBzdWJzY3JpYmFibGVUaGluZzogJ3VwZGF0ZScsXG4gICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICBzZXRGb3JjZVJlbmRlcihNYXRoLnJhbmRvbSgpKVxuICAgICAgfSxcbiAgICB9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB1bnN1YigpXG4gICAgfVxuICB9LCBbXSlcbiAgcmV0dXJuXG59XG5cbmNvbnN0IGdldENxbEZvckZpbHRlclRyZWUgPSAoZmlsdGVyVHJlZTogYW55KTogc3RyaW5nID0+IHtcbiAgaWYgKHR5cGVvZiBmaWx0ZXJUcmVlID09PSAnc3RyaW5nJykge1xuICAgIHRyeSB7XG4gICAgICBmaWx0ZXJUcmVlID0gSlNPTi5wYXJzZShmaWx0ZXJUcmVlKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gQ29udGludWUgdXNpbmcgc3RyaW5nIGxpdGVyYWwgaWYgc3RyaW5nIGlzIG5vdCB2YWxpZCBKU09OLlxuICAgIH1cbiAgfVxuICByZXR1cm4gQ1FMLndyaXRlKGZpbHRlclRyZWUpXG59XG5cbmNsYXNzIFJlc3RvcmVUYXNrIGV4dGVuZHMgQXN5bmNUYXNrIHtcbiAgbGF6eVJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0XG4gIGNvbnN0cnVjdG9yKHsgbGF6eVJlc3VsdCB9OiB7IGxhenlSZXN1bHQ6IExhenlRdWVyeVJlc3VsdCB9KSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMubGF6eVJlc3VsdCA9IGxhenlSZXN1bHRcbiAgICB0aGlzLmF0dGVtcHRSZXN0b3JlKClcbiAgfVxuICBhdHRlbXB0UmVzdG9yZSgpIHtcbiAgICBjb25zdCB1bnN1YnNjaWJlQ2FsbGJhY2sgPSB0aGlzLmxhenlSZXN1bHQuc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdiYWNrYm9uZVN5bmMnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgY29uc3QgZGVsZXRlZElkID1cbiAgICAgICAgICB0aGlzLmxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snbWV0YWNhcmQuZGVsZXRlZC5pZCddXG4gICAgICAgIGNvbnN0IGRlbGV0ZWRWZXJzaW9uID1cbiAgICAgICAgICB0aGlzLmxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snbWV0YWNhcmQuZGVsZXRlZC52ZXJzaW9uJ11cbiAgICAgICAgY29uc3Qgc291cmNlSWQgPSB0aGlzLmxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snc291cmNlLWlkJ11cbiAgICAgICAgaWYgKCFkZWxldGVkSWQpIHtcbiAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhenlSZXN1bHQucmVmcmVzaERhdGFPdmVyTmV0d29yaygpXG4gICAgICAgICAgfSwgNTAwMClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmZXRjaChcbiAgICAgICAgICAgIGAuL2ludGVybmFsL2hpc3RvcnkvcmV2ZXJ0LyR7ZGVsZXRlZElkfS8ke2RlbGV0ZWRWZXJzaW9ufS8ke3NvdXJjZUlkfWBcbiAgICAgICAgICApLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoeyB0aGluZzogJ3VwZGF0ZScgfSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIHVuc3Vic2NpYmVDYWxsYmFjaygpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSlcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmxhenlSZXN1bHQucmVmcmVzaERhdGFPdmVyTmV0d29yaygpXG4gICAgfSwgNTAwMClcbiAgfVxuICBzdGF0aWMgaXNJbnN0YW5jZU9mKHRhc2s6IGFueSk6IHRhc2sgaXMgUmVzdG9yZVRhc2sge1xuICAgIHJldHVybiB0YXNrLmNvbnN0cnVjdG9yID09PSBSZXN0b3JlVGFza1xuICB9XG59XG5cbmNsYXNzIERlbGV0ZVRhc2sgZXh0ZW5kcyBBc3luY1Rhc2sge1xuICBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbiAgY29uc3RydWN0b3IoeyBsYXp5UmVzdWx0IH06IHsgbGF6eVJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0IH0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5sYXp5UmVzdWx0ID0gbGF6eVJlc3VsdFxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5hdHRlbXB0RGVsZXRlKClcbiAgICB9LCAxMDAwKVxuICB9XG4gIGF0dGVtcHREZWxldGUoKSB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgIGlkOiAnMScsXG4gICAgICBqc29ucnBjOiAnMi4wJyxcbiAgICAgIG1ldGhvZDogJ2RkZi5jYXRhbG9nL2RlbGV0ZScsXG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgaWRzOiBbdGhpcy5sYXp5UmVzdWx0LnBsYWluLmlkXSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGZldGNoKCcvZGlyZWN0Jywge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKSxcbiAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKHsgdGhpbmc6ICd1cGRhdGUnIH0pXG4gICAgfSlcbiAgfVxuICBzdGF0aWMgaXNJbnN0YW5jZU9mKHRhc2s6IGFueSk6IHRhc2sgaXMgRGVsZXRlVGFzayB7XG4gICAgcmV0dXJuIHRhc2suY29uc3RydWN0b3IgPT09IERlbGV0ZVRhc2tcbiAgfVxufVxuXG5jbGFzcyBDcmVhdGVUYXNrIGV4dGVuZHMgQXN5bmNUYXNrIHtcbiAgbWV0YWNhcmRUeXBlOiBzdHJpbmdcbiAgZGF0YTogTWluaW1hbFByb3BlcnR5U2V0XG4gIGNvbnN0cnVjdG9yKHtcbiAgICBkYXRhLFxuICAgIG1ldGFjYXJkVHlwZSxcbiAgfToge1xuICAgIGRhdGE6IE1pbmltYWxQcm9wZXJ0eVNldFxuICAgIG1ldGFjYXJkVHlwZTogc3RyaW5nXG4gIH0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5tZXRhY2FyZFR5cGUgPSBtZXRhY2FyZFR5cGVcbiAgICB0aGlzLmRhdGEgPSBkYXRhXG4gICAgdGhpcy5kYXRhLmlkID0gdGhpcy5kYXRhLmlkIHx8IHY0KClcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuYXR0ZW1wdFNhdmUoKVxuICAgIH0sIDEwMDApXG4gIH1cbiAgYXR0ZW1wdFNhdmUoKSB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgIGlkOiAnMScsXG4gICAgICBqc29ucnBjOiAnMi4wJyxcbiAgICAgIG1ldGhvZDogJ2RkZi5jYXRhbG9nL2NyZWF0ZScsXG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgbWV0YWNhcmRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAuLi5jb252ZXJ0VG9CYWNrZW5kQ29tcGF0aWJsZUZvcm0oeyBwcm9wZXJ0aWVzOiB0aGlzLmRhdGEgfSksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWV0YWNhcmRUeXBlOiB0aGlzLm1ldGFjYXJkVHlwZSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9XG5cbiAgICBmZXRjaCgnL2RpcmVjdCcsIHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgfSkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyh7IHRoaW5nOiAndXBkYXRlJyB9KVxuICAgIH0pXG4gIH1cbiAgc3RhdGljIGlzSW5zdGFuY2VPZih0YXNrOiBhbnkpOiB0YXNrIGlzIENyZWF0ZVRhc2sge1xuICAgIHJldHVybiB0YXNrLmNvbnN0cnVjdG9yID09PSBDcmVhdGVUYXNrXG4gIH1cbn1cblxuY2xhc3MgU2F2ZVRhc2sgZXh0ZW5kcyBBc3luY1Rhc2sge1xuICBtZXRhY2FyZFR5cGU6IHN0cmluZ1xuICBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbiAgZGF0YTogUGxhaW5NZXRhY2FyZFByb3BlcnRpZXNUeXBlXG4gIGNvbnRyb2xsZXI6IEFib3J0Q29udHJvbGxlclxuICB0aW1lb3V0aWQ6IG51bWJlciB8IHVuZGVmaW5lZFxuICBjb25zdHJ1Y3Rvcih7XG4gICAgbGF6eVJlc3VsdCxcbiAgICBkYXRhLFxuICAgIG1ldGFjYXJkVHlwZSxcbiAgfToge1xuICAgIGxhenlSZXN1bHQ6IExhenlRdWVyeVJlc3VsdFxuICAgIGRhdGE6IFBsYWluTWV0YWNhcmRQcm9wZXJ0aWVzVHlwZVxuICAgIG1ldGFjYXJkVHlwZTogc3RyaW5nXG4gIH0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5tZXRhY2FyZFR5cGUgPSBtZXRhY2FyZFR5cGVcbiAgICB0aGlzLmxhenlSZXN1bHQgPSBsYXp5UmVzdWx0XG4gICAgdGhpcy5kYXRhID0gZGF0YVxuICAgIHRoaXMuY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKVxuICAgIHRoaXMuYXR0ZW1wdFNhdmUoKVxuICB9XG4gIHVwZGF0ZSh7IGRhdGEgfTogeyBkYXRhOiBQbGFpbk1ldGFjYXJkUHJvcGVydGllc1R5cGUgfSkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRpZClcbiAgICB0aGlzLmNvbnRyb2xsZXIuYWJvcnQoKVxuICAgIHRoaXMuZGF0YSA9IGRhdGFcbiAgICB0aGlzLmF0dGVtcHRTYXZlKClcbiAgfVxuICBhdHRlbXB0U2F2ZSgpIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKClcbiAgICB0aGlzLnRpbWVvdXRpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICAgIGlkOiAnMScsXG4gICAgICAgIGpzb25ycGM6ICcyLjAnLFxuICAgICAgICBtZXRob2Q6ICdkZGYuY2F0YWxvZy91cGRhdGUnLFxuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBtZXRhY2FyZHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgIC4uLmNvbnZlcnRUb0JhY2tlbmRDb21wYXRpYmxlRm9ybSh7IHByb3BlcnRpZXM6IHRoaXMuZGF0YSB9KSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgbWV0YWNhcmRUeXBlOiB0aGlzLm1ldGFjYXJkVHlwZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH1cblxuICAgICAgZmV0Y2goJy9kaXJlY3QnLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKSxcbiAgICAgICAgc2lnbmFsOiB0aGlzLmNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMubGF6eVJlc3VsdC5yZWZyZXNoRGF0YU92ZXJOZXR3b3JrKClcbiAgICAgICAgY29uc3QgdW5zdWIgPSB0aGlzLmxhenlSZXN1bHQuc3Vic2NyaWJlVG8oe1xuICAgICAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAnYmFja2JvbmVTeW5jJyxcbiAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoeyB0aGluZzogJ3VwZGF0ZScgfSlcbiAgICAgICAgICAgIHVuc3ViKClcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LCA1MDApXG4gIH1cbiAgc3RhdGljIGlzSW5zdGFuY2VPZih0YXNrOiBhbnkpOiB0YXNrIGlzIFNhdmVUYXNrIHtcbiAgICByZXR1cm4gdGFzay5jb25zdHJ1Y3RvciA9PT0gU2F2ZVRhc2tcbiAgfVxufVxuXG5jbGFzcyBDcmVhdGVTZWFyY2hUYXNrIGV4dGVuZHMgQXN5bmNUYXNrIHtcbiAgbGF6eVJlc3VsdD86IExhenlRdWVyeVJlc3VsdFxuICBkYXRhOiBMYXp5UXVlcnlSZXN1bHRbJ3BsYWluJ11bJ21ldGFjYXJkJ11bJ3Byb3BlcnRpZXMnXVxuICBjb25zdHJ1Y3Rvcih7XG4gICAgZGF0YSxcbiAgfToge1xuICAgIGRhdGE6IExhenlRdWVyeVJlc3VsdFsncGxhaW4nXVsnbWV0YWNhcmQnXVsncHJvcGVydGllcyddXG4gIH0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5kYXRhID0gZGF0YVxuICAgIHRoaXMuZGF0YS5pZCA9IHY0KClcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuYXR0ZW1wdFNhdmUoKVxuICAgIH0sIDEwMDApXG4gIH1cbiAgYXR0ZW1wdFNhdmUoKSB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgIGlkOiAnMScsXG4gICAgICBqc29ucnBjOiAnMi4wJyxcbiAgICAgIG1ldGhvZDogJ2RkZi5jYXRhbG9nL2NyZWF0ZScsXG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgbWV0YWNhcmRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAuLi5jb252ZXJ0VG9CYWNrZW5kQ29tcGF0aWJsZUZvcm0oeyBwcm9wZXJ0aWVzOiB0aGlzLmRhdGEgfSksXG4gICAgICAgICAgICAgICdtZXRhY2FyZC10YWdzJzogWydxdWVyeSddLFxuICAgICAgICAgICAgICBjcWw6IGdldENxbEZvckZpbHRlclRyZWUodGhpcy5kYXRhLmZpbHRlclRyZWUpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1ldGFjYXJkVHlwZTogJ21ldGFjYXJkLnF1ZXJ5JyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9XG5cbiAgICBmZXRjaCgnL2RpcmVjdCcsIHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgfSkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyh7IHRoaW5nOiAndXBkYXRlJyB9KVxuICAgIH0pXG4gIH1cbiAgc3RhdGljIGlzSW5zdGFuY2VPZih0YXNrOiBhbnkpOiB0YXNrIGlzIENyZWF0ZVNlYXJjaFRhc2sge1xuICAgIHJldHVybiB0YXNrLmNvbnN0cnVjdG9yID09PSBDcmVhdGVTZWFyY2hUYXNrXG4gIH1cbn1cblxuY2xhc3MgU2F2ZVNlYXJjaFRhc2sgZXh0ZW5kcyBBc3luY1Rhc2sge1xuICBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbiAgZGF0YTogUGxhaW5NZXRhY2FyZFByb3BlcnRpZXNUeXBlXG4gIGNvbnRyb2xsZXI6IEFib3J0Q29udHJvbGxlclxuICB0aW1lb3V0aWQ6IG51bWJlciB8IHVuZGVmaW5lZFxuICBjb25zdHJ1Y3Rvcih7XG4gICAgbGF6eVJlc3VsdCxcbiAgICBkYXRhLFxuICB9OiB7XG4gICAgbGF6eVJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0XG4gICAgZGF0YTogUGxhaW5NZXRhY2FyZFByb3BlcnRpZXNUeXBlXG4gIH0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5sYXp5UmVzdWx0ID0gbGF6eVJlc3VsdFxuICAgIHRoaXMuZGF0YSA9IGRhdGFcbiAgICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKClcbiAgICB0aGlzLmF0dGVtcHRTYXZlKClcbiAgfVxuICB1cGRhdGUoeyBkYXRhIH06IHsgZGF0YTogUGxhaW5NZXRhY2FyZFByb3BlcnRpZXNUeXBlIH0pIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0aWQpXG4gICAgdGhpcy5jb250cm9sbGVyLmFib3J0KClcbiAgICB0aGlzLmRhdGEgPSBkYXRhXG4gICAgdGhpcy5hdHRlbXB0U2F2ZSgpXG4gIH1cbiAgYXR0ZW1wdFNhdmUoKSB7XG4gICAgdGhpcy5jb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpXG4gICAgdGhpcy50aW1lb3V0aWQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICBpZDogJzEnLFxuICAgICAgICBqc29ucnBjOiAnMi4wJyxcbiAgICAgICAgbWV0aG9kOiAnZGRmLmNhdGFsb2cvY3JlYXRlJyxcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgbWV0YWNhcmRzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICAuLi5jb252ZXJ0VG9CYWNrZW5kQ29tcGF0aWJsZUZvcm0oeyBwcm9wZXJ0aWVzOiB0aGlzLmRhdGEgfSksXG4gICAgICAgICAgICAgICAgJ21ldGFjYXJkLXRhZ3MnOiBbJ3F1ZXJ5J10sXG4gICAgICAgICAgICAgICAgY3FsOiBnZXRDcWxGb3JGaWx0ZXJUcmVlKHRoaXMuZGF0YS5maWx0ZXJUcmVlKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgbWV0YWNhcmRUeXBlOiAnbWV0YWNhcmQucXVlcnknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgfVxuXG4gICAgICBmZXRjaCgnL2RpcmVjdCcsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxuICAgICAgICBzaWduYWw6IHRoaXMuY29udHJvbGxlci5zaWduYWwsXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5sYXp5UmVzdWx0LnJlZnJlc2hEYXRhT3Zlck5ldHdvcmsoKVxuICAgICAgICBjb25zdCB1bnN1YiA9IHRoaXMubGF6eVJlc3VsdC5zdWJzY3JpYmVUbyh7XG4gICAgICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdiYWNrYm9uZVN5bmMnLFxuICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyh7IHRoaW5nOiAndXBkYXRlJyB9KVxuICAgICAgICAgICAgdW5zdWIoKVxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sIDUwMClcbiAgfVxuICBzdGF0aWMgaXNJbnN0YW5jZU9mKHRhc2s6IGFueSk6IHRhc2sgaXMgU2F2ZVNlYXJjaFRhc2sge1xuICAgIHJldHVybiB0YXNrLmNvbnN0cnVjdG9yID09PSBTYXZlU2VhcmNoVGFza1xuICB9XG59XG4iXX0=