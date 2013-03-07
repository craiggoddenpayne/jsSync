Task.prototype.handle = null;
Task.prototype.execute = function () {
    var result = null;
    try {
        result = this.handle();
        for (var i = 0; i < this.onComplete.length; i++) {
            result = this.onComplete[i].execute();
        }
    } catch (e) {
        for (var i = 0; i < this.onCatch.length; i++) {
            result = this.onCatch[i].execute();
        }
    }

    return result;
};
Task.prototype.onComplete = [];
Task.prototype.chainOnComplete = function (taskFunction) {
    this.onComplete.push(taskFunction);
};
Task.prototype.onCatch = [];
Task.prototype.chainOnCatch = function (taskFunction) {
    this.onCatch.push(taskFunction);
};

function Task(taskFunction) {
    ///<summary>A task, representing a function</summary>
    this.handle = taskFunction;
};

function TaskHandler() { }
TaskHandler.prototype.tasks = [];
TaskHandler.prototype.addTask = function (task) {
    this.tasks.push(task);
};


TaskHandler.prototype.executeSync = function () {
    for (var i = 0; i < this.tasks; i++) {
        this.tasks[i]();
    }
};

TaskHandler.prototype.executeAsync = function (callback) {
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
};