"strict mode";

function Task(taskFunction, id) {
    ///<summary>A task, representing a function</summary>
    var task = Object.create(Task.prototype);
    task.handle = taskFunction;
    task.id = id;
    if (task.id == null) {
        task.id = "id" + Math.floor(Math.random() * 99999999);
    }
    return task;
};

Task.prototype = {
    handle: null,
    id: null,
    onComplete: [],
    onCatch: [],
    clone: function(obj){
        if(obj == null || typeof(obj) != 'object')
            return obj;
        var temp = obj.constructor();
        for(var key in obj)
            temp[key] = clone(obj[key]);
        return temp;
    },
    execute: function() {
        var result = null;
        try {
            result = this.handle();
            for (var i = 0; i < this.onComplete.length; i++) {
                if (this.onComplete[i] instanceof Task) {
                    result = this.onComplete[i].execute(result);
                } else if (this.onComplete[i] instanceof Function) {
                    result = this.onComplete[i](result);
                } else {
                    throw "jsSyncException:onComplete cannot execute a type that is not a function or task. Type was " + typeof(this.onComplete[i]);
                }
            }
        } catch(e) {
            if (e.indexOf("jsSyncException:") == -1) {
                for (var i = 0; i < this.onCatch.length; i++) {
                    if (this.onCatch[i] instanceof Task) {
                        result = this.onCatch[i].execute(result);
                    } else if (this.onCatch[i] instanceof Function) {
                        result = this.onCatch[i](result);
                    } else {
                        throw "jsSyncException:onCatch cannot execute a type that is not a function or task. Type was " + typeof(this.onCatch[i]);
                    }
                }
            } else {
                throw e;
            }
        }
        return result;
    },
    chainOnComplete: function(taskFunction) {
        var onComplete = this.clone(this.onComplete);
        onComplete.push(taskFunction);
        this.onComplete = onComplete;
        return this;
    },
    chainOnCatch: function(taskFunction) {
        var onCatch = this.clone(this.onCatch);
        onCatch.push(taskFunction);
        this.onCatch = onCatch;
        return this;
    },
};













function TaskHandler() { }
TaskHandler.prototype.tasks = [];
TaskHandler.prototype.addTask = function (task) {
    if(task instanceof Function) {
        task = new Task(task);
    }
    var tasks = this.clone(this.tasks);
    tasks.push(task);
    this.tasks = tasks;
};
TaskHandler.prototype.addTasks = function (arrayOfTask) {
    var tasks = this.clone(this.tasks);
    for(var i=0; i < arrayOfTask.length; i++) {    
        if(arrayOfTask[i] instanceof Function) {
            arrayOfTask[i] = new Task(arrayOfTask[i]);
        }
        tasks.push(arrayOfTask[i]);
    }
    this.tasks = tasks;
};

TaskHandler.prototype.clone = function(obj) {
    if (obj == null || typeof(obj) != 'object')
        return obj;
    var temp = obj.constructor();
    for (var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
};

TaskHandler.prototype.execute = function (callback) {
    ///<summary>Executes all functions asynchronously, calling the callback method with aggregated results/execptions</summary>
    var results = [];
    var returns = 0;
    var tasks = this.tasks;
    function callbackWait(result) {
        try {
            results.push(result);
        } catch (e) {
            results.push(e);
        }
        finally {
            returns += 1;
        }
        if (returns == tasks.length) {
            callback(results);
        }
    }

    function invoker(task) {
        try {
            var result = task.execute();
            callbackWait(result);
        }
        catch (e) {
            results.push(e);
        }
    }

    for (var i = 0; i < this.tasks.length; i++) {
        setTimeout(invoker, 0, tasks[i]);
    }
    
    return null;
};