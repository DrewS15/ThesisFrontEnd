!(function (global, factory) {
  "object" == typeof exports && "undefined" != typeof module
    ? factory(exports)
    : "function" == typeof define && define.amd
    ? define(["exports"], factory)
    : factory(
        ((global =
          "undefined" != typeof globalThis
            ? globalThis
            : global || self).loadPyodide = {})
      );
})(this, function (exports) {
  "use strict";
  "undefined" != typeof globalThis
    ? globalThis
    : "undefined" != typeof window
    ? window
    : "undefined" != typeof global
    ? global
    : "undefined" != typeof self && self;
  var errorStackParser = { exports: {} },
    stackframe = { exports: {} };
  !(function (module, exports) {
    module.exports = (function () {
      function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }
      function _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
      }
      function _getter(p) {
        return function () {
          return this[p];
        };
      }
      var booleanProps = ["isConstructor", "isEval", "isNative", "isToplevel"],
        numericProps = ["columnNumber", "lineNumber"],
        stringProps = ["fileName", "functionName", "source"],
        arrayProps = ["args"],
        objectProps = ["evalOrigin"],
        props = booleanProps.concat(
          numericProps,
          stringProps,
          arrayProps,
          objectProps
        );
      function StackFrame(obj) {
        if (obj)
          for (var i = 0; i < props.length; i++)
            void 0 !== obj[props[i]] &&
              this["set" + _capitalize(props[i])](obj[props[i]]);
      }
      (StackFrame.prototype = {
        getArgs: function () {
          return this.args;
        },
        setArgs: function (v) {
          if ("[object Array]" !== Object.prototype.toString.call(v))
            throw new TypeError("Args must be an Array");
          this.args = v;
        },
        getEvalOrigin: function () {
          return this.evalOrigin;
        },
        setEvalOrigin: function (v) {
          if (v instanceof StackFrame) this.evalOrigin = v;
          else {
            if (!(v instanceof Object))
              throw new TypeError(
                "Eval Origin must be an Object or StackFrame"
              );
            this.evalOrigin = new StackFrame(v);
          }
        },
        toString: function () {
          var fileName = this.getFileName() || "",
            lineNumber = this.getLineNumber() || "",
            columnNumber = this.getColumnNumber() || "",
            functionName = this.getFunctionName() || "";
          return this.getIsEval()
            ? fileName
              ? "[eval] (" +
                fileName +
                ":" +
                lineNumber +
                ":" +
                columnNumber +
                ")"
              : "[eval]:" + lineNumber + ":" + columnNumber
            : functionName
            ? functionName +
              " (" +
              fileName +
              ":" +
              lineNumber +
              ":" +
              columnNumber +
              ")"
            : fileName + ":" + lineNumber + ":" + columnNumber;
        },
      }),
        (StackFrame.fromString = function (str) {
          var argsStartIndex = str.indexOf("("),
            argsEndIndex = str.lastIndexOf(")"),
            functionName = str.substring(0, argsStartIndex),
            args = str.substring(argsStartIndex + 1, argsEndIndex).split(","),
            locationString = str.substring(argsEndIndex + 1);
          if (0 === locationString.indexOf("@"))
            var parts = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(
                locationString,
                ""
              ),
              fileName = parts[1],
              lineNumber = parts[2],
              columnNumber = parts[3];
          return new StackFrame({
            functionName: functionName,
            args: args || void 0,
            fileName: fileName,
            lineNumber: lineNumber || void 0,
            columnNumber: columnNumber || void 0,
          });
        });
      for (var i = 0; i < booleanProps.length; i++)
        (StackFrame.prototype["get" + _capitalize(booleanProps[i])] = _getter(
          booleanProps[i]
        )),
          (StackFrame.prototype["set" + _capitalize(booleanProps[i])] =
            (function (p) {
              return function (v) {
                this[p] = Boolean(v);
              };
            })(booleanProps[i]));
      for (var j = 0; j < numericProps.length; j++)
        (StackFrame.prototype["get" + _capitalize(numericProps[j])] = _getter(
          numericProps[j]
        )),
          (StackFrame.prototype["set" + _capitalize(numericProps[j])] =
            (function (p) {
              return function (v) {
                if (!_isNumber(v)) throw new TypeError(p + " must be a Number");
                this[p] = Number(v);
              };
            })(numericProps[j]));
      for (var k = 0; k < stringProps.length; k++)
        (StackFrame.prototype["get" + _capitalize(stringProps[k])] = _getter(
          stringProps[k]
        )),
          (StackFrame.prototype["set" + _capitalize(stringProps[k])] =
            (function (p) {
              return function (v) {
                this[p] = String(v);
              };
            })(stringProps[k]));
      return StackFrame;
    })();
  })(stackframe),
    (function (module, exports) {
      var StackFrame,
        FIREFOX_SAFARI_STACK_REGEXP,
        CHROME_IE_STACK_REGEXP,
        SAFARI_NATIVE_CODE_REGEXP;
      module.exports =
        ((StackFrame = stackframe.exports),
        (FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/),
        (CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m),
        (SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/),
        {
          parse: function (error) {
            if (
              void 0 !== error.stacktrace ||
              void 0 !== error["opera#sourceloc"]
            )
              return this.parseOpera(error);
            if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP))
              return this.parseV8OrIE(error);
            if (error.stack) return this.parseFFOrSafari(error);
            throw new Error("Cannot parse given Error object");
          },
          extractLocation: function (urlLike) {
            if (-1 === urlLike.indexOf(":")) return [urlLike];
            var parts = /(.+?)(?::(\d+))?(?::(\d+))?$/.exec(
              urlLike.replace(/[()]/g, "")
            );
            return [parts[1], parts[2] || void 0, parts[3] || void 0];
          },
          parseV8OrIE: function (error) {
            return error.stack
              .split("\n")
              .filter(function (line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
              }, this)
              .map(function (line) {
                line.indexOf("(eval ") > -1 &&
                  (line = line
                    .replace(/eval code/g, "eval")
                    .replace(/(\(eval at [^()]*)|(,.*$)/g, ""));
                var sanitizedLine = line
                    .replace(/^\s+/, "")
                    .replace(/\(eval code/g, "(")
                    .replace(/^.*?\s+/, ""),
                  location = sanitizedLine.match(/ (\(.+\)$)/);
                sanitizedLine = location
                  ? sanitizedLine.replace(location[0], "")
                  : sanitizedLine;
                var locationParts = this.extractLocation(
                    location ? location[1] : sanitizedLine
                  ),
                  functionName = (location && sanitizedLine) || void 0,
                  fileName =
                    ["eval", "<anonymous>"].indexOf(locationParts[0]) > -1
                      ? void 0
                      : locationParts[0];
                return new StackFrame({
                  functionName: functionName,
                  fileName: fileName,
                  lineNumber: locationParts[1],
                  columnNumber: locationParts[2],
                  source: line,
                });
              }, this);
          },
          parseFFOrSafari: function (error) {
            return error.stack
              .split("\n")
              .filter(function (line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
              }, this)
              .map(function (line) {
                if (
                  (line.indexOf(" > eval") > -1 &&
                    (line = line.replace(
                      / line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g,
                      ":$1"
                    )),
                  -1 === line.indexOf("@") && -1 === line.indexOf(":"))
                )
                  return new StackFrame({ functionName: line });
                var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/,
                  matches = line.match(functionNameRegex),
                  functionName = matches && matches[1] ? matches[1] : void 0,
                  locationParts = this.extractLocation(
                    line.replace(functionNameRegex, "")
                  );
                return new StackFrame({
                  functionName: functionName,
                  fileName: locationParts[0],
                  lineNumber: locationParts[1],
                  columnNumber: locationParts[2],
                  source: line,
                });
              }, this);
          },
          parseOpera: function (e) {
            return !e.stacktrace ||
              (e.message.indexOf("\n") > -1 &&
                e.message.split("\n").length > e.stacktrace.split("\n").length)
              ? this.parseOpera9(e)
              : e.stack
              ? this.parseOpera11(e)
              : this.parseOpera10(e);
          },
          parseOpera9: function (e) {
            for (
              var lineRE = /Line (\d+).*script (?:in )?(\S+)/i,
                lines = e.message.split("\n"),
                result = [],
                i = 2,
                len = lines.length;
              i < len;
              i += 2
            ) {
              var match = lineRE.exec(lines[i]);
              match &&
                result.push(
                  new StackFrame({
                    fileName: match[2],
                    lineNumber: match[1],
                    source: lines[i],
                  })
                );
            }
            return result;
          },
          parseOpera10: function (e) {
            for (
              var lineRE =
                  /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i,
                lines = e.stacktrace.split("\n"),
                result = [],
                i = 0,
                len = lines.length;
              i < len;
              i += 2
            ) {
              var match = lineRE.exec(lines[i]);
              match &&
                result.push(
                  new StackFrame({
                    functionName: match[3] || void 0,
                    fileName: match[2],
                    lineNumber: match[1],
                    source: lines[i],
                  })
                );
            }
            return result;
          },
          parseOpera11: function (error) {
            return error.stack
              .split("\n")
              .filter(function (line) {
                return (
                  !!line.match(FIREFOX_SAFARI_STACK_REGEXP) &&
                  !line.match(/^Error created at/)
                );
              }, this)
              .map(function (line) {
                var argsRaw,
                  tokens = line.split("@"),
                  locationParts = this.extractLocation(tokens.pop()),
                  functionCall = tokens.shift() || "",
                  functionName =
                    functionCall
                      .replace(/<anonymous function(: (\w+))?>/, "$2")
                      .replace(/\([^)]*\)/g, "") || void 0;
                functionCall.match(/\(([^)]*)\)/) &&
                  (argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, "$1"));
                var args =
                  void 0 === argsRaw || "[arguments not available]" === argsRaw
                    ? void 0
                    : argsRaw.split(",");
                return new StackFrame({
                  functionName: functionName,
                  args: args,
                  fileName: locationParts[0],
                  lineNumber: locationParts[1],
                  columnNumber: locationParts[2],
                  source: line,
                });
              }, this);
          },
        });
    })(errorStackParser);
  var ErrorStackParser = errorStackParser.exports;
  const IN_NODE =
    "undefined" != typeof process &&
    process.release &&
    "node" === process.release.name &&
    void 0 === process.browser;
  let nodeUrlMod,
    nodeFetch,
    nodePath,
    nodeVmMod,
    nodeFsPromisesMod,
    resolvePath,
    pathSep,
    loadBinaryFile,
    loadScript;
  if (
    ((resolvePath = IN_NODE
      ? function (path, base) {
          return nodePath.resolve(base || ".", path);
        }
      : function (path, base) {
          return (
            void 0 === base && (base = location), new URL(path, base).toString()
          );
        }),
    IN_NODE || (pathSep = "/"),
    (loadBinaryFile = IN_NODE
      ? async function (path, _file_sub_resource_hash) {
          if (
            (path.startsWith("file://") &&
              (path = path.slice("file://".length)),
            path.includes("://"))
          ) {
            let response = await nodeFetch(path);
            if (!response.ok)
              throw new Error(`Failed to load '${path}': request failed.`);
            return new Uint8Array(await response.arrayBuffer());
          }
          {
            const data = await nodeFsPromisesMod.readFile(path);
            return new Uint8Array(
              data.buffer,
              data.byteOffset,
              data.byteLength
            );
          }
        }
      : async function (path, subResourceHash) {
          const url = new URL(path, location);
          let options = subResourceHash ? { integrity: subResourceHash } : {},
            response = await fetch(url, options);
          if (!response.ok)
            throw new Error(`Failed to load '${url}': request failed.`);
          return new Uint8Array(await response.arrayBuffer());
        }),
    globalThis.document)
  )
    loadScript = async (url) => await import(/* webpackIgnore: true */ url);
  else if (globalThis.importScripts)
    loadScript = async (url) => {
      try {
        globalThis.importScripts(url);
      } catch (e) {
        if (!(e instanceof TypeError)) throw e;
        await import(/* webpackIgnore: true */ url);
      }
    };
  else {
    if (!IN_NODE) throw new Error("Cannot determine runtime environment");
    loadScript = async function (url) {
      url.startsWith("file://") && (url = url.slice("file://".length));
      url.includes("://")
        ? nodeVmMod.runInThisContext(await (await nodeFetch(url)).text())
        : await import(
            /* webpackIgnore: true */ nodeUrlMod.pathToFileURL(url).href
          );
    };
  }
  function __values(o) {
    var s = "function" == typeof Symbol && Symbol.iterator,
      m = s && o[s],
      i = 0;
    if (m) return m.call(o);
    if (o && "number" == typeof o.length)
      return {
        next: function () {
          return (
            o && i >= o.length && (o = void 0), { value: o && o[i++], done: !o }
          );
        },
      };
    throw new TypeError(
      s ? "Object is not iterable." : "Symbol.iterator is not defined."
    );
  }
  function __asyncValues(o) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var i,
      m = o[Symbol.asyncIterator];
    return m
      ? m.call(o)
      : ((o = __values(o)),
        (i = {}),
        verb("next"),
        verb("throw"),
        verb("return"),
        (i[Symbol.asyncIterator] = function () {
          return this;
        }),
        i);
    function verb(n) {
      i[n] =
        o[n] &&
        function (v) {
          return new Promise(function (resolve, reject) {
            (function (resolve, reject, d, v) {
              Promise.resolve(v).then(function (v) {
                resolve({ value: v, done: d });
              }, reject);
            })(resolve, reject, (v = o[n](v)).done, v.value);
          });
        };
    }
  }
  const getFsHandles = async (dirHandle) => {
    const handles = [];
    await (async function collect(curDirHandle) {
      var e_1, _a;
      try {
        for (
          var _c, _b = __asyncValues(curDirHandle.values());
          !(_c = await _b.next()).done;

        ) {
          const entry = _c.value;
          handles.push(entry),
            "directory" === entry.kind && (await collect(entry));
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          _c && !_c.done && (_a = _b.return) && (await _a.call(_b));
        } finally {
          if (e_1) throw e_1.error;
        }
      }
    })(dirHandle);
    const result = new Map();
    result.set(".", dirHandle);
    for (const handle of handles) {
      const relativePath = (await dirHandle.resolve(handle)).join("/");
      result.set(relativePath, handle);
    }
    return result;
  };
  function finalizeBootstrap(API, config) {
    (API.runPythonInternal_dict = API._pyodide._base.eval_code("{}")),
      (API.importlib = API.runPythonInternal("import importlib; importlib"));
    let import_module = API.importlib.import_module;
    (API.sys = import_module("sys")),
      API.sys.path.insert(0, config.homedir),
      (API.os = import_module("os"));
    let globals = API.runPythonInternal("import __main__; __main__.__dict__"),
      builtins = API.runPythonInternal("import builtins; builtins.__dict__");
    var builtins_dict;
    API.globals =
      ((builtins_dict = builtins),
      new Proxy(globals, {
        get: (target, symbol) =>
          "get" === symbol
            ? (key) => {
                let result = target.get(key);
                return (
                  void 0 === result && (result = builtins_dict.get(key)), result
                );
              }
            : "has" === symbol
            ? (key) => target.has(key) || builtins_dict.has(key)
            : Reflect.get(target, symbol),
      }));
    let importhook = API._pyodide._importhook;
    importhook.register_js_finder(),
      importhook.register_js_module("js", config.jsglobals);
    let pyodide = API.makePublicAPI();
    return (
      importhook.register_js_module("pyodide_js", pyodide),
      (API.pyodide_py = import_module("pyodide")),
      (API.pyodide_code = import_module("pyodide.code")),
      (API.pyodide_ffi = import_module("pyodide.ffi")),
      (API.package_loader = import_module("pyodide._package_loader")),
      (API.sitepackages = API.package_loader.SITE_PACKAGES.__str__()),
      (API.dsodir = API.package_loader.DSO_DIR.__str__()),
      (API.defaultLdLibraryPath = [API.dsodir, API.sitepackages]),
      API.os.environ.__setitem__(
        "LD_LIBRARY_PATH",
        API.defaultLdLibraryPath.join(":")
      ),
      (pyodide.pyodide_py = API.pyodide_py),
      (pyodide.globals = API.globals),
      pyodide
    );
  }
  async function loadPyodide(options = {}) {
    await (async function () {
      if (!IN_NODE) return;
      if (
        ((nodeUrlMod = (await import("url")).default),
        (nodeFsPromisesMod = await import("fs/promises")),
        (nodeFetch = globalThis.fetch
          ? fetch
          : (await import("node-fetch")).default),
        (nodeVmMod = (await import("vm")).default),
        (nodePath = await import("path")),
        (pathSep = nodePath.sep),
        "undefined" != typeof require)
      )
        return;
      const node_modules = {
        fs: await import("fs"),
        crypto: await import("crypto"),
        ws: await import("ws"),
        child_process: await import("child_process"),
      };
      globalThis.require = function (mod) {
        return node_modules[mod];
      };
    })();
    let indexURL =
      options.indexURL ||
      (function () {
        if ("string" == typeof __dirname) return __dirname;
        let err;
        try {
          throw new Error();
        } catch (e) {
          err = e;
        }
        let fileName = ErrorStackParser.parse(err)[0].fileName;
        const indexOfLastSlash = fileName.lastIndexOf(pathSep);
        if (-1 === indexOfLastSlash)
          throw new Error(
            "Could not extract indexURL path from pyodide module location"
          );
        return fileName.slice(0, indexOfLastSlash);
      })();
    (indexURL = resolvePath(indexURL)),
      indexURL.endsWith("/") || (indexURL += "/"),
      (options.indexURL = indexURL);
    const default_config = {
        fullStdLib: !1,
        jsglobals: globalThis,
        stdin: globalThis.prompt ? globalThis.prompt : void 0,
        homedir: "/home/pyodide",
        lockFileURL: indexURL + "repodata.json",
        args: [],
        _node_mounts: [],
      },
      config = Object.assign(default_config, options),
      pyodide_py_tar_promise = loadBinaryFile(
        config.indexURL + "pyodide_py.tar"
      ),
      Module = (function () {
        let Module = {
          noImageDecoding: !0,
          noAudioDecoding: !0,
          noWasmDecoding: !1,
          preRun: [],
          quit: (status, toThrow) => {
            throw (
              ((Module.exited = { status: status, toThrow: toThrow }), toThrow)
            );
          },
        };
        return Module;
      })();
    (Module.print = config.stdout),
      (Module.printErr = config.stderr),
      Module.preRun.push(() => {
        for (const mount of config._node_mounts)
          Module.FS.mkdirTree(mount),
            Module.FS.mount(Module.NODEFS, { root: mount }, mount);
      }),
      (Module.arguments = config.args);
    const API = { config: config };
    (Module.API = API),
      (function (Module, path) {
        Module.preRun.push(function () {
          try {
            Module.FS.mkdirTree(path);
          } catch (e) {
            console.error(
              `Error occurred while making a home directory '${path}':`
            ),
              console.error(e),
              console.error("Using '/' for a home directory instead"),
              (path = "/");
          }
          (Module.ENV.HOME = path), Module.FS.chdir(path);
        });
      })(Module, config.homedir);
    const moduleLoaded = new Promise((r) => (Module.postRun = r));
    if (
      ((Module.locateFile = (path) => config.indexURL + path),
      "function" != typeof _createPyodideModule)
    ) {
      const scriptSrc = `${config.indexURL}pyodide.asm.js`;
      await loadScript(scriptSrc);
    }
    if ((await _createPyodideModule(Module), await moduleLoaded, Module.exited))
      throw Module.exited.toThrow;
    if ("0.22.1" !== API.version)
      throw new Error(
        `Pyodide version does not match: '0.22.1' <==> '${API.version}'. If you updated the Pyodide version, make sure you also updated the 'indexURL' parameter passed to loadPyodide.`
      );
    (Module.locateFile = (path) => {
      throw new Error("Didn't expect to load any more file_packager files!");
    }),
      (function (module) {
        const FS = module.FS,
          MEMFS = module.FS.filesystems.MEMFS,
          PATH = module.PATH,
          nativeFSAsync = {
            DIR_MODE: 16895,
            FILE_MODE: 33279,
            mount: function (mount) {
              if (!mount.opts.fileSystemHandle)
                throw new Error("opts.fileSystemHandle is required");
              return MEMFS.mount.apply(null, arguments);
            },
            syncfs: async (mount, populate, callback) => {
              try {
                const local = nativeFSAsync.getLocalSet(mount),
                  remote = await nativeFSAsync.getRemoteSet(mount),
                  src = populate ? remote : local,
                  dst = populate ? local : remote;
                await nativeFSAsync.reconcile(mount, src, dst), callback(null);
              } catch (e) {
                callback(e);
              }
            },
            getLocalSet: (mount) => {
              let entries = Object.create(null);
              function isRealDir(p) {
                return "." !== p && ".." !== p;
              }
              function toAbsolute(root) {
                return (p) => PATH.join2(root, p);
              }
              let check = FS.readdir(mount.mountpoint)
                .filter(isRealDir)
                .map(toAbsolute(mount.mountpoint));
              for (; check.length; ) {
                let path = check.pop(),
                  stat = FS.stat(path);
                FS.isDir(stat.mode) &&
                  check.push.apply(
                    check,
                    FS.readdir(path).filter(isRealDir).map(toAbsolute(path))
                  ),
                  (entries[path] = { timestamp: stat.mtime, mode: stat.mode });
              }
              return { type: "local", entries: entries };
            },
            getRemoteSet: async (mount) => {
              const entries = Object.create(null),
                handles = await getFsHandles(mount.opts.fileSystemHandle);
              for (const [path, handle] of handles)
                "." !== path &&
                  (entries[PATH.join2(mount.mountpoint, path)] = {
                    timestamp:
                      "file" === handle.kind
                        ? (await handle.getFile()).lastModifiedDate
                        : new Date(),
                    mode:
                      "file" === handle.kind
                        ? nativeFSAsync.FILE_MODE
                        : nativeFSAsync.DIR_MODE,
                  });
              return { type: "remote", entries: entries, handles: handles };
            },
            loadLocalEntry: (path) => {
              const node = FS.lookupPath(path).node,
                stat = FS.stat(path);
              if (FS.isDir(stat.mode))
                return { timestamp: stat.mtime, mode: stat.mode };
              if (FS.isFile(stat.mode))
                return (
                  (node.contents = MEMFS.getFileDataAsTypedArray(node)),
                  {
                    timestamp: stat.mtime,
                    mode: stat.mode,
                    contents: node.contents,
                  }
                );
              throw new Error("node type not supported");
            },
            storeLocalEntry: (path, entry) => {
              if (FS.isDir(entry.mode)) FS.mkdirTree(path, entry.mode);
              else {
                if (!FS.isFile(entry.mode))
                  throw new Error("node type not supported");
                FS.writeFile(path, entry.contents, { canOwn: !0 });
              }
              FS.chmod(path, entry.mode),
                FS.utime(path, entry.timestamp, entry.timestamp);
            },
            removeLocalEntry: (path) => {
              var stat = FS.stat(path);
              FS.isDir(stat.mode)
                ? FS.rmdir(path)
                : FS.isFile(stat.mode) && FS.unlink(path);
            },
            loadRemoteEntry: async (handle) => {
              if ("file" === handle.kind) {
                const file = await handle.getFile();
                return {
                  contents: new Uint8Array(await file.arrayBuffer()),
                  mode: nativeFSAsync.FILE_MODE,
                  timestamp: file.lastModifiedDate,
                };
              }
              if ("directory" === handle.kind)
                return { mode: nativeFSAsync.DIR_MODE, timestamp: new Date() };
              throw new Error("unknown kind: " + handle.kind);
            },
            storeRemoteEntry: async (handles, path, entry) => {
              const parentDirHandle = handles.get(PATH.dirname(path)),
                handle = FS.isFile(entry.mode)
                  ? await parentDirHandle.getFileHandle(PATH.basename(path), {
                      create: !0,
                    })
                  : await parentDirHandle.getDirectoryHandle(
                      PATH.basename(path),
                      { create: !0 }
                    );
              if ("file" === handle.kind) {
                const writable = await handle.createWritable();
                await writable.write(entry.contents), await writable.close();
              }
              handles.set(path, handle);
            },
            removeRemoteEntry: async (handles, path) => {
              const parentDirHandle = handles.get(PATH.dirname(path));
              await parentDirHandle.removeEntry(PATH.basename(path)),
                handles.delete(path);
            },
            reconcile: async (mount, src, dst) => {
              let total = 0;
              const create = [];
              Object.keys(src.entries).forEach(function (key) {
                const e = src.entries[key],
                  e2 = dst.entries[key];
                (!e2 ||
                  (FS.isFile(e.mode) &&
                    e.timestamp.getTime() > e2.timestamp.getTime())) &&
                  (create.push(key), total++);
              }),
                create.sort();
              const remove = [];
              if (
                (Object.keys(dst.entries).forEach(function (key) {
                  src.entries[key] || (remove.push(key), total++);
                }),
                remove.sort().reverse(),
                !total)
              )
                return;
              const handles = "remote" === src.type ? src.handles : dst.handles;
              for (const path of create) {
                const relPath = PATH.normalize(
                  path.replace(mount.mountpoint, "/")
                ).substring(1);
                if ("local" === dst.type) {
                  const handle = handles.get(relPath),
                    entry = await nativeFSAsync.loadRemoteEntry(handle);
                  nativeFSAsync.storeLocalEntry(path, entry);
                } else {
                  const entry = nativeFSAsync.loadLocalEntry(path);
                  await nativeFSAsync.storeRemoteEntry(handles, relPath, entry);
                }
              }
              for (const path of remove)
                if ("local" === dst.type) nativeFSAsync.removeLocalEntry(path);
                else {
                  const relPath = PATH.normalize(
                    path.replace(mount.mountpoint, "/")
                  ).substring(1);
                  await nativeFSAsync.removeRemoteEntry(handles, relPath);
                }
            },
          };
        module.FS.filesystems.NATIVEFS_ASYNC = nativeFSAsync;
      })(Module);
    const pyodide_py_tar = await pyodide_py_tar_promise;
    !(function (Module, pyodide_py_tar) {
      let stream = Module.FS.open("/pyodide_py.tar", "w");
      Module.FS.write(
        stream,
        pyodide_py_tar,
        0,
        pyodide_py_tar.byteLength,
        void 0,
        !0
      ),
        Module.FS.close(stream);
      let [errcode, captured_stderr] = Module.API.rawRun(
        '\nfrom sys import version_info\npyversion = f"python{version_info.major}.{version_info.minor}"\nimport shutil\nshutil.unpack_archive("/pyodide_py.tar", f"/lib/{pyversion}/")\ndel shutil\nimport importlib\nimportlib.invalidate_caches()\ndel importlib\n'
      );
      errcode &&
        Module.API.fatal_loading_error(
          "Failed to unpack standard library.\n",
          captured_stderr
        ),
        Module.FS.unlink("/pyodide_py.tar");
    })(Module, pyodide_py_tar);
    let [err, captured_stderr] = API.rawRun("import _pyodide_core");
    err &&
      Module.API.fatal_loading_error(
        "Failed to import _pyodide_core\n",
        captured_stderr
      );
    const pyodide = finalizeBootstrap(API, config);
    if (
      (pyodide.version.includes("dev") ||
        API.setCdnUrl(
          `https://cdn.jsdelivr.net/pyodide/v${pyodide.version}/full/`
        ),
      await API.packageIndexReady,
      API._pyodide._importhook.register_module_not_found_hook(
        API._import_name_to_package_name
      ),
      "0.22.1" !== API.repodata_info.version)
    )
      throw new Error("Lock file version doesn't match Pyodide version");
    return (
      API.package_loader.init_loaded_packages(),
      config.fullStdLib &&
        (await pyodide.loadPackage(
          API._pyodide._importhook.UNVENDORED_STDLIBS
        )),
      API.initializeStreams(config.stdin, config.stdout, config.stderr),
      pyodide
    );
  }
  (globalThis.loadPyodide = loadPyodide),
    (exports.loadPyodide = loadPyodide),
    (exports.version = "0.22.1"),
    Object.defineProperty(exports, "__esModule", { value: !0 });
});
//# sourceMappingURL=pyodide.js.map
