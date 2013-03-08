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
        ///<summary>Executes this task or function</summary>
        var result = null;
        try {
            result = this.handle();
            for (var i = 0; i < this.onComplete.length; i++) {
                if (this.onComplete[i] instanceof Task) {
                    result = this.onComplete[i].execute(result);
                } else if (this.onComplete[i] instanceof Function) {
                    result = this.onComplete[i](result);
                } else {
                    throw "Exception:onComplete cannot execute a type that is not a function or task. Type was " + typeof(this.onComplete[i]);
                }
            }
        } catch(e) {
            if (e.indexOf("Exception:") == -1) {
                for (var i = 0; i < this.onCatch.length; i++) {
                    if (this.onCatch[i] instanceof Task) {
                        result = this.onCatch[i].execute(result);
                    } else if (this.onCatch[i] instanceof Function) {
                        result = this.onCatch[i](result);
                    } else {
                        throw "Exception:onCatch cannot execute a type that is not a function or task. Type was " + typeof(this.onCatch[i]);
                    }
                }
            } else {
                throw e;
            }
        }
        return result;
    },
    chainOnComplete: function(taskFunction) {
        ///<summary>Chains a task to start once this task has complete</summary>
        var onComplete = this.clone(this.onComplete);
        onComplete.push(taskFunction);
        this.onComplete = onComplete;
        return this;
    },
    chainOnCatch: function(taskFunction) {
        ///<summary>Chains a task to start if this task throws an exception</summary>
        var onCatch = this.clone(this.onCatch);
        onCatch.push(taskFunction);
        this.onCatch = onCatch;
        return this;
    },
};

TaskException.prototype.message = null;
function TaskException(exception) {
    var e = Object.create(TaskException.prototype);
    e.message = exception;
    return e;
}

function TaskHandler() {
    ///<summary>Handles task execution and result aggregation</summary>
}
TaskHandler.prototype.tasks = [];
TaskHandler.prototype.addTask = function (task) {
    ///<summary>Adds a task to this task handle. It can be a task or a function</summary>
    if(task instanceof Function) {
        task = new Task(task);
    }
    var tasks = this.clone(this.tasks);
    tasks.push(task);
    this.tasks = tasks;
};
TaskHandler.prototype.addTasks = function (arrayOfTask) {
    ///<summary>Adds tasks to this task handle. They can be a tasks or functions</summary>
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
    ///<summary>Clones an object, breaking references</summary>
    if (obj == null || typeof(obj) != 'object')
        return obj;
    var temp = obj.constructor();
    for (var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
};

TaskHandler.prototype.execute = function (callback) {
    ///<summary>Executes all associated tasks or functions asynchronously, calling the callback method with aggregated results/exceptions</summary>
    var results = [];
    var returns = 0;
    var tasks = this.tasks;
    function callbackWait(result) {
        try {
            results.push(result);
        } catch (e) {
            results.push(new TaskException(e));
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
            results.push(new TaskException(e));
        }
    }

    for (var i = 0; i < this.tasks.length; i++) {
        setTimeout(invoker, 0, tasks[i]);
    }
    
    return null;
};
