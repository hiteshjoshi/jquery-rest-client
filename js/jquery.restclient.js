;
(function($) {

    $.RestClient = function(options) {

        if (typeof options == 'string') {
            var options = {
                api: options
            }
        }

        var myName = 'jQuery-Rest-Client',
            settings = $.extend({
                waitingTime: 300,
                waitLoopLimit: 25,
                logger: 0,
                fnError: function(msg) {
                    //...
                },
                setup: {
                    // cache: false,
                    dataType: 'json',
                    headers: {}
                }
            }, options || {}),
            logInfo = function(msg) {
                if (settings.logger <= 2) {
                    console.log(myName + ': ' + msg)
                }
            },
            logError = function(msg) {
                if (settings.logger <= 1) {
                    console.error(myName + ': ' + msg)
                }
            },
            fnError = function(msg) {
                logError(msg)
                settings.fnError(msg);
            },
            semaphore = {},
            waiting = null,
            waitingCount = 0,
            then = function(obj, callback){
                if (waiting && !semaphore[waiting]) {
                    if (waitingCount < settings.waitLoopLimit) {
                        console.log(obj.current)
                        var fnTest = function() {
                            ++waitingCount;
                            console.log(obj.current)
                            then(obj, callback);
                        }

                        var t = setTimeout(fnTest, settings.waitingTime)
                    } else {
                        return fnError("Wait too long, canceled operation.");
                    }
                } else {
                    waitingTime = settings.waitingTime;

                    var ajaxOptions = $.extend({
                        method: obj.current.method,
                        url: settings.api + '/' + obj.url + obj.current.path,
                        success: callback,
                        cache: settings.cache,
                        headers: obj.current.headers
                    }, settings.setup || {});

                    if (obj.current.method == "POST") {
                        ajaxOptions.data = obj.current.data;
                    } else if (obj.current.method == "GET") {
                        ajaxOptions.data = $.extend(obj.current.query || {}, obj.current.data || {});
                    }

                    return $.ajax(ajaxOptions);
                }
            },
            restControl = function(section, url) {
                this.section = section
                this.url = url
                this.current = this.currentClean = {
                        method: null,
                        query: null,
                        data: null,
                        path: '',
                        headers: {}
                    }

                this.childrens = [];

                this.wait = function(name) {
                    semaphore[name] = false;
                    waiting = name;
                    return this;
                }

                this.release = function(name) {
                    semaphore[name] = true;
                    return this;
                }

                this.setApi = function(value) {
                    settings.api = url = value;
                    return this;
                }

                this.add = function(newSection, newUrl) {
                    this.childrens.push(newSection);
                    this[newSection] = new restControl(newSection, newUrl || newSection);
                }

                this.read = function(value) {
                    this.clear()
                    if (typeof value == "object") {
                        this.current.query = value;
                        this.current.path = '';
                    } else {
                        this.current.path = '/' + value;
                    }

                    this.current.method = "GET";

                    return this;
                }

                this.post = function(value) {
                    this.clear()
                    this.current.data = value;
                    this.current.method = "POST";
                    return this;
                }

                this.query = function(values) {
                    this.current.query = values;
                    return this;
                }

                this.data = function(values) {
                    this.current.data = values;
                    return this;
                }

                this.defaultHeaders = function(values) {
                    settings.setup.headers = $.extend(settings.setup.headers, values || {});
                    return this;
                }

                this.headers = function(values) {
                    this.current.headers = $.extend(this.current.headers, values || {});
                    return this;
                }

                this.token = function(xToken, xKey) {
                    this.defaultHeaders({
                        'x-access-token': xToken,
                        'x-key': xKey
                    })
                }

                this.clear = function(all) {
                    if (all) {
                        current = currentClean;
                    } else {
                        this.current.query = null;
                        this.current.data = null;
                        this.current.method = null;
                        this.current.path = '';
                    }
                }

                this.error = function(callback) {
                    settings.fnError = callback;
                }



                this.then  = function(callback) {
                    return then(this, callback)
                }

                return this;
            }

        return restControl(settings.api);
    }
})(jQuery);
