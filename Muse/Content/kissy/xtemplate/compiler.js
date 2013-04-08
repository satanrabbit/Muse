﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 3 12:30
*/
/**
 * Ast node class for xtemplate
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add("xtemplate/compiler/ast", function (S) {

    var ast = {};

    /**
     * @ignore
     * @param lineNumber
     * @param statements
     * @param [inverse]
     * @constructor
     */
    ast.ProgramNode = function (lineNumber, statements, inverse) {
        var self = this;
        self.lineNumber = lineNumber;
        self.statements = statements;
        self.inverse = inverse;
    };

    ast.ProgramNode.prototype.type = 'program';

    ast.BlockNode = function (lineNumber, tpl, program, close) {
        var closeParts = close['parts'], self = this, e;
        // no close tag
        if (!S.equals(tpl.path['parts'], closeParts)) {
            e = ("Syntax error at line " +
                lineNumber +
                ":\n" + "expect {{/" +
                tpl.path['parts'] +
                "}} not {{/" +
                closeParts + "}}");
            S.error(e);
        }
        self.lineNumber = lineNumber;
        self.tpl = tpl;
        self.program = program;
    };

    ast.BlockNode.prototype.type = 'block';

    /**
     * @ignore
     * @param lineNumber
     * @param path
     * @param [params]
     * @param [hash]
     * @constructor
     */
    ast.TplNode = function (lineNumber, path, params, hash) {
        var self = this;
        self.lineNumber = lineNumber;
        self.path = path;
        self.params = params;
        self.hash = hash;
        self.escaped = true;
        // inside {{^}}
        // default: inside {{#}}
        self.isInversed = false;
    };

    ast.TplNode.prototype.type = 'tpl';


    ast.TplExpressionNode = function (lineNumber, expression) {
        var self = this;
        self.lineNumber = lineNumber;
        self.expression = expression;
        self.escaped = true;
    };

    ast.TplExpressionNode.prototype.type = 'tplExpression';

    ast.ContentNode = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };

    ast.ContentNode.prototype.type = 'content';

    ast.UnaryExpression = function (v) {
        this.value = v;
    };

    ast.UnaryExpression.prototype.type = 'unaryExpression';

    ast.MultiplicativeExpression = function (op1, opType, op2) {
        var self = this;
        self.op1 = op1;
        self.opType = opType;
        self.op2 = op2;
    };

    ast.MultiplicativeExpression.prototype.type = 'multiplicativeExpression';

    ast.AdditiveExpression = function (op1, opType, op2) {
        var self = this;
        self.op1 = op1;
        self.opType = opType;
        self.op2 = op2;
    };

    ast.AdditiveExpression.prototype.type = 'additiveExpression';

    ast.RelationalExpression = function (op1, opType, op2) {
        var self = this;
        self.op1 = op1;
        self.opType = opType;
        self.op2 = op2;
    };

    ast.RelationalExpression.prototype.type = 'relationalExpression';

    ast.EqualityExpression = function (op1, opType, op2) {
        var self = this;
        self.op1 = op1;
        self.opType = opType;
        self.op2 = op2;
    };

    ast.EqualityExpression.prototype.type = 'equalityExpression';

    ast.ConditionalAndExpression = function (op1, op2) {
        var self = this;
        self.op1 = op1;
        self.op2 = op2;
    };

    ast.ConditionalAndExpression.prototype.type = 'conditionalAndExpression';

    ast.ConditionalOrExpression = function (op1, op2) {
        var self = this;
        self.op1 = op1;
        self.op2 = op2;
    };

    ast.ConditionalOrExpression.prototype.type = 'conditionalOrExpression';

    ast.StringNode = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };

    ast.StringNode.prototype.type = 'string';

    ast.NumberNode = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };

    ast.NumberNode.prototype.type = 'number';

    ast.BooleanNode = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };

    ast.BooleanNode.prototype.type = 'boolean';

    ast.HashNode = function (lineNumber, raw) {
        var self = this, value = {};
        self.lineNumber = lineNumber;
        S.each(raw, function (r) {
            value[r[0]] = r[1];
        });
        self.value = value;
    };

    ast.HashNode.prototype.type = 'hash';

    ast.IdNode = function (lineNumber, raw) {
        var self = this, parts = [], depth = 0;
        self.lineNumber = lineNumber;
        S.each(raw, function (p) {
            if (p == "..") {
                depth++;
            } else {
                parts.push(p);
            }
        });
        self.parts = parts;
        self.string = parts.join('.');
        self.depth = depth;
    };

    ast.IdNode.prototype.type = 'id';

    return ast;
});/**
 * translate ast to js function code
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add("xtemplate/compiler", function (S, parser, ast, XTemplateRuntime) {

    parser.yy = ast;

    var utils = {
            'getProperty': 1
        },
        doubleReg = /\\*"/g,
        singleReg = /\\*'/g,
        arrayPush = [].push,
        variableId = 0,
        xtemplateId = 0;

    function guid(str) {
        return str + (variableId++);
    }

    // consider str compiler
    XTemplateRuntime.includeCommand.invokeEngine = function (tpl, scopes, option) {
        if (typeof tpl == 'string') {
            tpl = compiler.compileToFn(/**
             @type String
             @ignore
             */tpl, option);
        }
        return new XTemplateRuntime(tpl, S.merge(option)).render(scopes);
    };

    /**
     * @ignore
     */
    function escapeString(str, isDouble) {
        return escapeSingleQuoteInCodeString(str//.replace(/\\/g, '\\\\')
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t'), isDouble);
    }

    function escapeSingleQuoteInCodeString(str, isDouble) {
        return str.replace(isDouble ? doubleReg : singleReg, function (m) {
            // \ 's number ，用户显式转过 "\'" , "\\\'" 就不处理了，否则手动对 ` 加 \ 转义
            if (m.length % 2) {
                m = '\\' + m;
            }
            return m;
        });
    }

    function pushToArray(to, from) {
        arrayPush.apply(to, from);
    }

    function lastOfArray(arr) {
        return arr[arr.length - 1];
    }

    var gen = {

        // ------------ helper generation function start

        genFunction: function (statements, global) {
            var source = [];
            if (!global) {
                source.push('function(scopes) {');
            }
            source.push('var buffer = ""' + (global ? ',' : ';'));
            if (global) {
                source.push('S = KISSY,' +
                    'escapeHTML = S.escapeHTML,' +
                    'isArray = S.isArray,' +
                    'isObject = S.isObject,' +
                    'log = S.log,' +
                    'commands = option.commands,' +
                    'utils = option.utils,' +
                    'error = S.error;');

                var natives = '',
                    c,
                // shortcut for global commands
                    commands = XTemplateRuntime.commands;

                for (c in commands) {
                    natives += c + 'Command = commands["' + c + '"],';
                }

                for (c in utils) {
                    natives += c + ' = utils["' + c + '"],';
                }

                if (natives) {
                    source.push('var ' + natives.slice(0, natives.length - 1));
                }
            }
            if (statements) {
                for (var i = 0, len = statements.length; i < len; i++) {
                    pushToArray(source, this[statements[i].type](statements[i]));
                }
            }
            source.push('return buffer;');
            if (!global) {
                source.push('}');
                return source;
            } else {
                return {
                    params: ['scopes', 'option', 'undefined'],
                    source: source
                };
            }
        },

        genId: function (idNode, tplNode) {
            var source = [],
                depth = idNode.depth,
                idString = idNode.string,
                idName = guid('id'),
                self = this,
                foundNativeRuntimeCommand = 0,
                tmpNameCommand,
                commands = XTemplateRuntime.commands;

            source.push('var ' + idName + ';');

            // {{#each variable}} {{variable}}
            if (tplNode && depth == 0) {
                var optionNameCode = self.genOption(tplNode);
                pushToArray(source, optionNameCode[1]);
                // skip if for global commands before current template's render
                if (foundNativeRuntimeCommand = commands[idString]) {
                    tmpNameCommand = idString + 'Command';
                } else {
                    tmpNameCommand = guid('command');
                    source.push('var ' + tmpNameCommand + ';');
                    source.push(tmpNameCommand + ' = commands["' + idString + '"];');
                    source.push('if( ' + tmpNameCommand + ' ){');
                }
                source.push('try{');
                source.push(idName + ' = ' + tmpNameCommand +
                    '(scopes,' + optionNameCode[0] + ');');
                source.push('}catch(e){');
                source.push('error(e.message+": \'' +
                    idString + '\' at line ' + idNode.lineNumber + '");');
                source.push('}');

                if (!foundNativeRuntimeCommand) {
                    source.push('}');
                    source.push('else {');
                }
            }

            // variable {{variable.subVariable}}
            if (!foundNativeRuntimeCommand) {

                var tmp = guid('tmp');

                source.push('var ' + tmp + '=getProperty("' + idString + '",scopes);');

                source.push('if(' + tmp + '===false){');
                source.push('S[option.silent?"log":"error"]("can not find property: \'' +
                    idString + '\' at line ' + idNode.lineNumber + '", "warn");');
                // only normalize when render
                // source.push(idName + ' = "";');
                source.push('} else {');
                source.push(idName + ' = ' + tmp + '[0];');
                source.push('}');

                if (tplNode && depth == 0) {
                    source.push('}');
                }
            }

            return [idName, source];
        },

        genOpExpression: function (e, type) {
            var source = [],
                name1,
                name2,
                code1 = this[e.op1.type](e.op1),
                code2 = this[e.op2.type](e.op2);

            name1 = code1[0];
            name2 = code2[0];

            if (name1 && name2) {
                pushToArray(source, code1[1]);
                pushToArray(source, code2[1]);
                source.push(name1 + type + name2);
                return ['', source];
            }

            if (!name1 && !name2) {
                pushToArray(source, code1[1].slice(0, -1));
                pushToArray(source, code2[1].slice(0, -1));
                source.push('(' +
                    lastOfArray(code1[1]) +
                    ')' +
                    type +
                    '(' + lastOfArray(code2[1]) + ')');
                return ['', source];
            }

            if (name1 && !name2) {
                pushToArray(source, code1[1]);
                pushToArray(source, code2[1].slice(0, -1));
                source.push(name1 + type +
                    '(' +
                    lastOfArray(code2[1]) +
                    ')');
                return ['', source];
            }

            if (!name1 && name2) {
                pushToArray(source, code1[1].slice(0, -1));
                pushToArray(source, code2[1]);
                source.push('(' +
                    lastOfArray(code1[1]) +
                    ')' +
                    type + name2);
                return ['', source];
            }

            return undefined;
        },

        genOption: function (tplNode) {
            var source = [],
                optionName = guid('option'),
                params, hash,
                self = this;

            source.push('var ' + optionName + ' = S.merge(option);');

            if (tplNode) {
                if (params = tplNode.params) {
                    var paramsName = guid('params');
                    source.push('var ' + paramsName + ' = [];');

                    S.each(params, function (param) {
                        var nextIdNameCode = self[param.type](param);
                        if (nextIdNameCode[0]) {
                            pushToArray(source, nextIdNameCode[1]);
                            source.push(paramsName + '.push(' + nextIdNameCode[0] + ');')
                        } else {
                            pushToArray(source, nextIdNameCode[1].slice(0, -1));
                            source.push(paramsName + '.push(' + lastOfArray(nextIdNameCode[1]) + ');')
                        }
                    });
                    source.push(optionName + '.params=' + paramsName + ';');
                }

                if (hash = tplNode.hash) {
                    var hashName = guid('hash');
                    source.push('var ' + hashName + ' = {};');
                    S.each(hash.value, function (v, key) {
                        var nextIdNameCode = self[v.type](v);
                        if (nextIdNameCode[0]) {
                            pushToArray(source, nextIdNameCode[1]);
                            source.push(hashName + '["' + key + '"] = ' + nextIdNameCode[0] + ';')
                        } else {
                            pushToArray(source, nextIdNameCode[1].slice(0, -1));
                            source.push(hashName + '["' + key + '"] = ' + lastOfArray(nextIdNameCode[1]) + ';')
                        }
                    });
                    source.push(optionName + '.hash=' + hashName + ';');
                }
            }

            return [optionName, source];
        },

        // ------------ helper generation function end

        conditionalOrExpression: function (e) {
            return this.genOpExpression(e, '||');
        },

        conditionalAndExpression: function (e) {
            return this.genOpExpression(e, '&&');
        },

        relationalExpression: function (e) {
            return this.genOpExpression(e, e.opType);
        },

        equalityExpression: function (e) {
            return this.genOpExpression(e, e.opType);
        },

        additiveExpression: function (e) {
            return this.genOpExpression(e, e.opType);
        },

        multiplicativeExpression: function (e) {
            return this.genOpExpression(e, e.opType);
        },

        unaryExpression: function (e) {
            var source = [],
                name,
                code = this[e.value.type](e.value);
            arrayPush.apply(source, code[1]);
            if (name = code[0]) {
                source.push(name + '=!' + name + ';');
            } else {
                source[source.length - 1] = '!' + lastOfArray(source);
            }
            return [name, source];
        },

        'string': function (e) {
            // same as contentNode.value
            return ['', ["'" + escapeString(e.value) + "'"]];
        },

        'number': function (e) {
            return ['', [e.value]];
        },

        'boolean': function (e) {
            return ['', [e.value]];
        },

        'id': function (e) {
            return this.genId(e);
        },

        'block': function (block) {
            var programNode = block.program,
                source = [],
                self = this,
                tmpNameCommand,
                tplNode = block.tpl,
                optionNameCode = self.genOption(tplNode),
                optionName = optionNameCode[0],
                commands = XTemplateRuntime.commands,
                string = tplNode.path.string,
                inverseFn,
                existsNativeCommand,
                variableName;

            pushToArray(source, optionNameCode[1]);

            source.push(optionName + '.fn=' +
                self.genFunction(programNode.statements).join('\n') + ';');

            if (programNode.inverse) {
                inverseFn = self.genFunction(programNode.inverse).join('\n');
                source.push(optionName + '.inverse=' + inverseFn + ';');
            }

            // support {{^
            // exchange fn with inverse
            if (tplNode.isInversed) {
                var tmp = guid('inverse');
                source.push('var ' + tmp + '=' + optionName + '.fn;');
                source.push(optionName + '.fn = ' + optionName + '.inverse;');
                source.push(optionName + '.inverse = ' + tmp + ';');
            }

            // reduce generated code size
            if (existsNativeCommand = commands[string]) {
                tmpNameCommand = string + 'Command';
            } else {
                tmpNameCommand = guid('command');
                source.push('var ' + tmpNameCommand +
                    ' = commands["' + string + '"];');
                // {{#xx}}1{#xx} => xx is not command =>
                // if xx => array => {{#each xx}}1{/each}}
                // if xx => object => {{#with xx}}1{/with}}
                // else => {{#if xx}}1{/if}}
                if (!tplNode.hash && !tplNode.params) {
                    source.push('if(!' + tmpNameCommand + '){');
                    var propertyValueHolder = guid('propertyValueHolder');
                    source.push('var ' + propertyValueHolder + ' = getProperty("' + string + '",scopes);');
                    variableName = guid('variableName');
                    source.push('var ' + variableName + '=' + propertyValueHolder + '&&' + propertyValueHolder + '[0];');
                    source.push(optionName + '.params=[' + variableName + '];');
                    source.push('if(isArray(' + variableName + ')){');
                    source.push(tmpNameCommand + '=commands["each"];');
                    source.push('}');
                    source.push('else if(isObject(' + variableName + ')){');
                    source.push(tmpNameCommand + '=commands["with"];');
                    source.push('}');
                    source.push('else {');
                    source.push(tmpNameCommand + '=commands["if"];');
                    source.push('}');
                    source.push('}');
                }
                source.push('if( ' + tmpNameCommand + ' ){');
            }

            source.push('try{');
            source.push('buffer += ' + tmpNameCommand + '(scopes,' + optionName + ');');
            source.push('}catch(e){');
            source.push('error(e.message+": \'' + string +
                '\' at line ' + tplNode.path.lineNumber + '");');
            source.push('}');

            if (!existsNativeCommand) {
                source.push('}');
                source.push('if('+propertyValueHolder+'===false) {');
                source.push('S[option.silent?"log":"error"]("can not find command: \'' +
                    string + '\' at line ' + tplNode.path.lineNumber + '","warn");');
                source.push('}');
            }
            return source;
        },

        'content': function (contentNode) {
            return ['buffer += \'' + escapeString(contentNode.value) + '\';'];
        },

        'tpl': function (tplNode) {
            var source = [],
                escaped = tplNode.escaped,
                genIdCode = this.genId(tplNode.path, tplNode);
            pushToArray(source, genIdCode[1]);
            outputVariable(genIdCode[0], escaped, source);
            return source;
        },

        tplExpression: function (e) {
            var source = [],
                escaped = e.escaped,
                expressionOrVariable,
                code = this[e.expression.type](e.expression);
            if (code[0]) {
                pushToArray(source, code[1]);
                expressionOrVariable = code[0];
            } else {
                pushToArray(source, code[1].slice(0, -1));
                expressionOrVariable = lastOfArray(code[1]);
            }
            outputVariable(expressionOrVariable, escaped, source);
            return source;
        }

    };

    function outputVariable(expressionOrVariable, escaped, source) {
        var tmp = guid('tmp');
        // in case it is expression, avoid duplicate computation
        source.push('var ' + tmp + ' = ' + expressionOrVariable + ';');
        source.push('buffer+=' + (escaped ? 'escapeHTML(' : '') +
            // when render undefined => ''
            '(' + tmp + '===undefined?"":' + tmp + ')' + '+""' +
            (escaped ? ')' : '') +
            ';');
    }

    var compiler;

    /**
     * compiler for xtemplate
     * @class KISSY.XTemplate.compiler
     * @singleton
     */
    return compiler = {
        /**
         * get ast of template
         * @param {String} tpl
         * @return {Object}
         */
        parse: function (tpl) {
            return parser.parse(tpl);
        },
        /**
         * get template function string
         * @param {String} tpl
         * @return {String}
         */
        compileToStr: function (tpl) {
            var func = this.compile(tpl);
            return 'function(' + func.params.join(',') + '){\n' +
                func.source.join('\n') +
                '}';
        },
        /**
         * get template function json format
         * @param {String} tpl
         * @return {Object}
         */
        compile: function (tpl) {
            var root = this.parse(tpl);
            variableId = 0;
            return gen.genFunction(root.statements, true);
        },
        /**
         * get template function
         * @param {String} tpl
         * @param {Object} option
         * @param {String} option.name template file name
         * @return {Function}
         */
        compileToFn: function (tpl, option) {
            var code = compiler.compile(tpl);
            option = option || {};
            // eval is not ok for eval("(function(){})") ie
            return (Function.apply(null, []
                .concat(code.params)
                .concat(code.source.join('\n') + '//@ sourceURL=' +
                    (option.name ? option.name : ('xtemplate' + (xtemplateId++))) + '.js')));
        }
    };

}, {
    requires: ['./compiler/parser', './compiler/ast', 'xtemplate/runtime']
});/*
  Generated by kissy-kison.*/
KISSY.add("xtemplate/compiler/parser", function () {
    /* Generated by kison from KISSY */
    var parser = {}, S = KISSY,
        GrammarConst = {
            'SHIFT_TYPE': 1,
            'REDUCE_TYPE': 2,
            'ACCEPT_TYPE': 0,
            'TYPE_INDEX': 0,
            'PRODUCTION_INDEX': 1,
            'TO_INDEX': 2
        };
    var Lexer = function (cfg) {

        var self = this;

        /*
             lex rules.
             @type {Object[]}
             @example
             [
             {
             regexp:'\\w+',
             state:['xx'],
             token:'c',
             // this => lex
             action:function(){}
             }
             ]
             */
        self.rules = [];

        S.mix(self, cfg);

        /*
             Input languages
             @type {String}
             */

        self.resetInput(self.input);

    };
    Lexer.prototype = {
        'constructor': function (cfg) {

            var self = this;

            /*
             lex rules.
             @type {Object[]}
             @example
             [
             {
             regexp:'\\w+',
             state:['xx'],
             token:'c',
             // this => lex
             action:function(){}
             }
             ]
             */
            self.rules = [];

            S.mix(self, cfg);

            /*
             Input languages
             @type {String}
             */

            self.resetInput(self.input);

        },
        'resetInput': function (input) {
            S.mix(this, {
                input: input,
                matched: "",
                stateStack: [Lexer.STATIC.INITIAL],
                match: "",
                text: "",
                firstLine: 1,
                lineNumber: 1,
                lastLine: 1,
                firstColumn: 1,
                lastColumn: 1
            });
        },
        'getCurrentRules': function () {
            var self = this,
                currentState = self.stateStack[self.stateStack.length - 1],
                rules = [];
            currentState = self.mapState(currentState);
            S.each(self.rules, function (r) {
                var state = r.state || r[3];
                if (!state) {
                    if (currentState == Lexer.STATIC.INITIAL) {
                        rules.push(r);
                    }
                } else if (S.inArray(currentState, state)) {
                    rules.push(r);
                }
            });
            return rules;
        },
        'pushState': function (state) {
            this.stateStack.push(state);
        },
        'popState': function () {
            return this.stateStack.pop();
        },
        'getStateStack': function () {
            return this.stateStack;
        },
        'showDebugInfo': function () {
            var self = this,
                DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT,
                matched = self.matched,
                match = self.match,
                input = self.input;
            matched = matched.slice(0, matched.length - match.length);
            var past = (matched.length > DEBUG_CONTEXT_LIMIT ? "..." : "") + matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, " "),
                next = match + input;
            next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (next.length > DEBUG_CONTEXT_LIMIT ? "..." : "");
            return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
        },
        'mapSymbol': function (t) {
            var self = this,
                symbolMap = self.symbolMap;
            if (!symbolMap) {
                return t;
            }
            return symbolMap[t] || (symbolMap[t] = (++self.symbolId));
        },
        'mapReverseSymbol': function (rs) {
            var self = this,
                symbolMap = self.symbolMap,
                i,
                reverseSymbolMap = self.reverseSymbolMap;
            if (!reverseSymbolMap && symbolMap) {
                reverseSymbolMap = self.reverseSymbolMap = {};
                for (i in symbolMap) {
                    reverseSymbolMap[symbolMap[i]] = i;
                }
            }
            if (reverseSymbolMap) {
                return reverseSymbolMap[rs];
            } else {
                return rs;
            }
        },
        'mapState': function (s) {
            var self = this,
                stateMap = self.stateMap;
            if (!stateMap) {
                return s;
            }
            return stateMap[s] || (stateMap[s] = (++self.stateId));
        },
        'lex': function () {
            var self = this,
                input = self.input,
                i,
                rule,
                m,
                ret,
                lines,
                rules = self.getCurrentRules();

            self.match = self.text = "";

            if (!input) {
                return self.mapSymbol(Lexer.STATIC.END_TAG);
            }

            for (i = 0; i < rules.length; i++) {
                rule = rules[i];
                var regexp = rule.regexp || rule[1],
                    token = rule.token || rule[0],
                    action = rule.action || rule[2] || undefined;
                if (m = input.match(regexp)) {
                    lines = m[0].match(/\n.*/g);
                    if (lines) {
                        self.lineNumber += lines.length;
                    }
                    S.mix(self, {
                        firstLine: self.lastLine,
                        lastLine: self.lineNumber + 1,
                        firstColumn: self.lastColumn,
                        lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length
                    });
                    var match;
                    // for error report
                    match = self.match = m[0];

                    // all matches
                    self.matches = m;
                    // may change by user
                    self.text = match;
                    // matched content utils now
                    self.matched += match;
                    ret = action && action.call(self);
                    if (ret == undefined) {
                        ret = token;
                    } else {
                        ret = self.mapSymbol(ret);
                    }
                    input = input.slice(match.length);
                    self.input = input;

                    if (ret) {
                        return ret;
                    } else {
                        // ignore
                        return self.lex();
                    }
                }
            }

            S.error("lex error at line " + self.lineNumber + ":\n" + self.showDebugInfo());
            return undefined;
        }
    };
    Lexer.STATIC = {
        'INITIAL': 'I',
        'DEBUG_CONTEXT_LIMIT': 20,
        'END_TAG': '$EOF'
    };
    var lexer = new Lexer({
        'rules': [
            [0, /^(\\[\s\S]|[\s\S])*?(?={{)/, function () {
                var self = this,
                    text = self.text,
                    m,
                    n = 0;
                if (m = text.match(/\\+$/)) {
                    n = m[0].length;
                }
                if (n % 2) {
                    text = text.slice(0, - 1);
                    self.pushState('et');
                } else {
                    self.pushState('t');
                }
                // https://github.com/kissyteam/kissy/issues/330
                // return even empty
                self.text = text;
                return 'CONTENT';
            }],
            [2, /^[\s\S]+/, 0],
            [2, /^[\s\S]{2,}?(?:(?={{)|$)/, function () {
                this.popState();
            }, ['et']],
            [3, /^{{(?:#|@|\^)/, 0, ['t']],
            [4, /^{{\//, 0, ['t']],
            [5, /^{{\s*else/, 0, ['t']],
            [6, /^{{{/, 0, ['t']],
            [0, /^{{![\s\S]*?}}/, function () {
                // return to content mode
                this.popState();
            }, ['t']],
            [7, /^{{/, 0, ['t']],
            [0, /^\s+/, 0, ['t']],
            [8, /^}}}/, function () {
                this.popState();
            }, ['t']],
            [8, /^}}/, function () {
                this.popState();
            }, ['t']],
            [9, /^\(/, 0, ['t']],
            [10, /^\)/, 0, ['t']],
            [11, /^\|\|/, 0, ['t']],
            [12, /^&&/, 0, ['t']],
            [13, /^===/, 0, ['t']],
            [14, /^!==/, 0, ['t']],
            [15, /^>/, 0, ['t']],
            [16, /^>=/, 0, ['t']],
            [17, /^</, 0, ['t']],
            [18, /^<=/, 0, ['t']],
            [19, /^\+/, 0, ['t']],
            [20, /^-/, 0, ['t']],
            [21, /^\*/, 0, ['t']],
            [22, /^\//, 0, ['t']],
            [23, /^%/, 0, ['t']],
            [24, /^!/, 0, ['t']],
            [25, /^"(\\"|[^"])*"/, function () {
                this.text = this.text.slice(1, - 1).replace(/\\"/g, '"');
            }, ['t']],
            [25, /^'(\\'|[^'])*'/, function () {
                this.text = this.text.slice(1, - 1).replace(/\\'/g, "'");
            }, ['t']],
            [26, /^true/, 0, ['t']],
            [26, /^false/, 0, ['t']],
            [27, /^\d+(?:\.\d+)?(?:e-?\d+)?/i, 0, ['t']],
            [28, /^=/, 0, ['t']],
            [29, /^\.(?=})/, 0, ['t']],
            [29, /^\.\./, function () {
                // wait for '/'
                this.pushState('ws');
            }, ['t']],
            [30, /^\./, 0, ['t']],
            [30, /^\//, function () {
                this.popState();
            }, ['ws']],
            [29, /^[a-zA-Z0-9_$-]+/, 0, ['t']],
            [31, /^./, 0, ['t']]
        ]
    });
    parser.lexer = lexer;
    lexer.symbolMap = {
        '$EOF': 1,
        'CONTENT': 2,
        'OPEN_BLOCK': 3,
        'OPEN_END_BLOCK': 4,
        'OPEN_INVERSE': 5,
        'OPEN_UN_ESCAPED': 6,
        'OPEN': 7,
        'CLOSE': 8,
        'LPAREN': 9,
        'RPAREN': 10,
        'OR': 11,
        'AND': 12,
        'LOGIC_EQUALS': 13,
        'LOGIC_NOT_EQUALS': 14,
        'GT': 15,
        'GE': 16,
        'LT': 17,
        'LE': 18,
        'PLUS': 19,
        'MINUS': 20,
        'MULTIPLY': 21,
        'DIVIDE': 22,
        'MODULUS': 23,
        'NOT': 24,
        'STRING': 25,
        'BOOLEAN': 26,
        'NUMBER': 27,
        'EQUALS': 28,
        'ID': 29,
        'SEP': 30,
        'INVALID': 31,
        '$START': 32,
        'program': 33,
        'statements': 34,
        'inverse': 35,
        'statement': 36,
        'openBlock': 37,
        'closeBlock': 38,
        'tpl': 39,
        'inTpl': 40,
        'path': 41,
        'Expression': 42,
        'params': 43,
        'hash': 44,
        'param': 45,
        'ConditionalOrExpression': 46,
        'ConditionalAndExpression': 47,
        'EqualityExpression': 48,
        'RelationalExpression': 49,
        'AdditiveExpression': 50,
        'MultiplicativeExpression': 51,
        'UnaryExpression': 52,
        'PrimaryExpression': 53,
        'hashSegments': 54,
        'hashSegment': 55,
        'pathSegments': 56
    };
    parser.productions = [
        [32, [33]],
        [33, [34, 35, 34], function () {
            return new this.yy.ProgramNode(this.lexer.lineNumber, this.$1, this.$3);
        }],
        [33, [34], function () {
            return new this.yy.ProgramNode(this.lexer.lineNumber, this.$1);
        }],
        [34, [36], function () {
            return [this.$1];
        }],
        [34, [34, 36], function () {
            this.$1.push(this.$2);
        }],
        [36, [37, 33, 38], function () {
            return new this.yy.BlockNode(this.lexer.lineNumber, this.$1, this.$2, this.$3);
        }],
        [36, [39]],
        [36, [2], function () {
            return new this.yy.ContentNode(this.lexer.lineNumber, this.$1);
        }],
        [37, [3, 40, 8], function () {
            if (this.$1.charAt(this.$1.length - 1) == '^') {
                this.$2.isInversed = 1;
            }
            return this.$2;
        }],
        [38, [4, 41, 8], function () {
            return this.$2;
        }],
        [39, [7, 40, 8], function () {
            return this.$2;
        }],
        [39, [6, 40, 8], function () {
            this.$2.escaped = false;
            return this.$2;
        }],
        [39, [7, 42, 8], function () {
            return new this.yy.TplExpressionNode(this.lexer.lineNumber,
            this.$2);
        }],
        [39, [6, 42, 8], function () {
            var tpl = new this.yy.TplExpressionNode(this.lexer.lineNumber,
            this.$2);
            tpl.escaped = false;
            return tpl;
        }],
        [35, [5, 8]],
        [40, [41, 43, 44], function () {
            return new this.yy.TplNode(this.lexer.lineNumber, this.$1, this.$2, this.$3);
        }],
        [40, [41, 43], function () {
            return new this.yy.TplNode(this.lexer.lineNumber, this.$1, this.$2);
        }],
        [40, [41, 44], function () {
            return new this.yy.TplNode(this.lexer.lineNumber, this.$1, null, this.$2);
        }],
        [40, [41], function () {
            return new this.yy.TplNode(this.lexer.lineNumber, this.$1);
        }],
        [43, [43, 45], function () {
            this.$1.push(this.$2);
        }],
        [43, [45], function () {
            return [this.$1];
        }],
        [45, [42]],
        [42, [46]],
        [46, [47]],
        [46, [46, 11, 47], function () {
            return new this.yy.ConditionalOrExpression(this.$1, this.$3);
        }],
        [47, [48]],
        [47, [47, 12, 48], function () {
            return new this.yy.ConditionalAndExpression(this.$1, this.$3);
        }],
        [48, [49]],
        [48, [48, 13, 49], function () {
            return new this.yy.EqualityExpression(this.$1, '===', this.$3);
        }],
        [48, [48, 14, 49], function () {
            return new this.yy.EqualityExpression(this.$1, '!==', this.$3);
        }],
        [49, [50]],
        [49, [49, 17, 50], function () {
            return new this.yy.RelationalExpression(this.$1, '<', this.$3);
        }],
        [49, [49, 15, 50], function () {
            return new this.yy.RelationalExpression(this.$1, '>', this.$3);
        }],
        [49, [49, 18, 50], function () {
            return new this.yy.RelationalExpression(this.$1, '<=', this.$3);
        }],
        [49, [49, 16, 50], function () {
            return new this.yy.RelationalExpression(this.$1, '>=', this.$3);
        }],
        [50, [51]],
        [50, [50, 19, 51], function () {
            return new this.yy.AdditiveExpression(this.$1, '+', this.$3);
        }],
        [50, [50, 20, 51], function () {
            return new this.yy.AdditiveExpression(this.$1, '-', this.$3);
        }],
        [51, [52]],
        [51, [51, 21, 52], function () {
            return new this.yy.MultiplicativeExpression(this.$1, '*', this.$3);
        }],
        [51, [51, 22, 52], function () {
            return new this.yy.MultiplicativeExpression(this.$1, '/', this.$3);
        }],
        [51, [51, 23, 52], function () {
            return new this.yy.MultiplicativeExpression(this.$1, '%', this.$3);
        }],
        [52, [24, 52], function () {
            return new this.yy.UnaryExpression(this.$1);
        }],
        [52, [53]],
        [53, [25], function () {
            return new this.yy.StringNode(this.lexer.lineNumber, this.$1);
        }],
        [53, [27], function () {
            return new this.yy.NumberNode(this.lexer.lineNumber, this.$1);
        }],
        [53, [20, 27], function () {
            return new this.yy.NumberNode(this.lexer.lineNumber, 0 - this.$2);
        }],
        [53, [26], function () {
            return new this.yy.BooleanNode(this.lexer.lineNumber, this.$1);
        }],
        [53, [41]],
        [53, [9, 42, 10], function () {
            return this.$2;
        }],
        [44, [54], function () {
            return new this.yy.HashNode(this.lexer.lineNumber, this.$1);
        }],
        [54, [54, 55], function () {
            this.$1.push(this.$2);
        }],
        [54, [55], function () {
            return [this.$1];
        }],
        [55, [29, 28, 42], function () {
            return [this.$1, this.$3];
        }],
        [41, [56], function () {
            return new this.yy.IdNode(this.lexer.lineNumber, this.$1);
        }],
        [56, [56, 30, 29], function () {
            this.$1.push(this.$3);
        }],
        [56, [56, 30, 27], function () {
            this.$1.push(this.$3);
        }],
        [56, [29], function () {
            return [this.$1];
        }]
    ];
    parser.table = {
        'gotos': {
            '0': {
                '33': 5,
                '34': 6,
                '36': 7,
                '37': 8,
                '39': 9
            },
            '2': {
                '40': 11,
                '41': 12,
                '56': 13
            },
            '3': {
                '40': 20,
                '41': 21,
                '42': 22,
                '46': 23,
                '47': 24,
                '48': 25,
                '49': 26,
                '50': 27,
                '51': 28,
                '52': 29,
                '53': 30,
                '56': 13
            },
            '4': {
                '40': 31,
                '41': 21,
                '42': 32,
                '46': 23,
                '47': 24,
                '48': 25,
                '49': 26,
                '50': 27,
                '51': 28,
                '52': 29,
                '53': 30,
                '56': 13
            },
            '6': {
                '35': 34,
                '36': 35,
                '37': 8,
                '39': 9
            },
            '8': {
                '33': 36,
                '34': 6,
                '36': 7,
                '37': 8,
                '39': 9
            },
            '12': {
                '41': 39,
                '42': 40,
                '43': 41,
                '44': 42,
                '45': 43,
                '46': 23,
                '47': 24,
                '48': 25,
                '49': 26,
                '50': 27,
                '51': 28,
                '52': 29,
                '53': 30,
                '54': 44,
                '55': 45,
                '56': 13
            },
            '14': {
                '41': 39,
                '42': 47,
                '46': 23,
                '47': 24,
                '48': 25,
                '49': 26,
                '50': 27,
                '51': 28,
                '52': 29,
                '53': 30,
                '56': 13
            },
            '16': {
                '41': 39,
                '52': 49,
                '53': 30,
                '56': 13
            },
            '21': {
                '41': 39,
                '42': 40,
                '43': 41,
                '44': 42,
                '45': 43,
                '46': 23,
                '47': 24,
                '48': 25,
                '49': 26,
                '50': 27,
                '51': 28,
                '52': 29,
                '53': 30,
                '54': 44,
                '55': 45,
                '56': 13
            },
            '34': {
                '34': 68,
                '36': 7,
                '37': 8,
                '39': 9
            },
            '36': {
                '38': 70
            },
            '41': {
                '41': 39,
                '42': 40,
                '44': 72,
                '45': 73,
                '46': 23,
                '47': 24,
                '48': 25,
                '49': 26,
                '50': 27,
                '51': 28,
                '52': 29,
                '53': 30,
                '54': 44,
                '55': 45,
                '56': 13
            },
            '44': {
                '55': 75
            },
            '52': {
                '41': 39,
                '47': 79,
                '48': 25,
                '49': 26,
                '50': 27,
                '51': 28,
                '52': 29,
                '53': 30,
                '56': 13
            },
            '53': {
                '41': 39,
                '48': 80,
                '49': 26,
                '50': 27,
                '51': 28,
                '52': 29,
                '53': 30,
                '56': 13
            },
            '54': {
                '41': 39,
                '49': 81,
                '50': 27,
                '51': 28,
                '52': 29,
                '53': 30,
                '56': 13
            },
            '55': {
                '41': 39,
                '49': 82,
                '50': 27,
                '51': 28,
                '52': 29,
                '53': 30,
                '56': 13
            },
            '56': {
                '41': 39,
                '50': 83,
                '51': 28,
                '52': 29,
                '53': 30,
                '56': 13
            },
            '57': {
                '41': 39,
                '50': 84,
                '51': 28,
                '52': 29,
                '53': 30,
                '56': 13
            },
            '58': {
                '41': 39,
                '50': 85,
                '51': 28,
                '52': 29,
                '53': 30,
                '56': 13
            },
            '59': {
                '41': 39,
                '50': 86,
                '51': 28,
                '52': 29,
                '53': 30,
                '56': 13
            },
            '60': {
                '41': 39,
                '51': 87,
                '52': 29,
                '53': 30,
                '56': 13
            },
            '61': {
                '41': 39,
                '51': 88,
                '52': 29,
                '53': 30,
                '56': 13
            },
            '62': {
                '41': 39,
                '52': 89,
                '53': 30,
                '56': 13
            },
            '63': {
                '41': 39,
                '52': 90,
                '53': 30,
                '56': 13
            },
            '64': {
                '41': 39,
                '52': 91,
                '53': 30,
                '56': 13
            },
            '68': {
                '36': 35,
                '37': 8,
                '39': 9
            },
            '69': {
                '41': 92,
                '56': 13
            },
            '71': {
                '41': 39,
                '42': 93,
                '46': 23,
                '47': 24,
                '48': 25,
                '49': 26,
                '50': 27,
                '51': 28,
                '52': 29,
                '53': 30,
                '56': 13
            }
        },
        'action': {
            '0': {
                '2': [1, 0, 1],
                '3': [1, 0, 2],
                '6': [1, 0, 3],
                '7': [1, 0, 4]
            },
            '1': {
                '1': [2, 7, 0],
                '2': [2, 7, 0],
                '3': [2, 7, 0],
                '4': [2, 7, 0],
                '5': [2, 7, 0],
                '6': [2, 7, 0],
                '7': [2, 7, 0]
            },
            '2': {
                '29': [1, 0, 10]
            },
            '3': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '4': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '5': {
                '1': [0, 0, 0]
            },
            '6': {
                '1': [2, 2, 0],
                '2': [1, 0, 1],
                '3': [1, 0, 2],
                '4': [2, 2, 0],
                '5': [1, 0, 33],
                '6': [1, 0, 3],
                '7': [1, 0, 4]
            },
            '7': {
                '1': [2, 3, 0],
                '2': [2, 3, 0],
                '3': [2, 3, 0],
                '4': [2, 3, 0],
                '5': [2, 3, 0],
                '6': [2, 3, 0],
                '7': [2, 3, 0]
            },
            '8': {
                '2': [1, 0, 1],
                '3': [1, 0, 2],
                '6': [1, 0, 3],
                '7': [1, 0, 4]
            },
            '9': {
                '1': [2, 6, 0],
                '2': [2, 6, 0],
                '3': [2, 6, 0],
                '4': [2, 6, 0],
                '5': [2, 6, 0],
                '6': [2, 6, 0],
                '7': [2, 6, 0]
            },
            '10': {
                '8': [2, 57, 0],
                '9': [2, 57, 0],
                '10': [2, 57, 0],
                '11': [2, 57, 0],
                '12': [2, 57, 0],
                '13': [2, 57, 0],
                '14': [2, 57, 0],
                '15': [2, 57, 0],
                '16': [2, 57, 0],
                '17': [2, 57, 0],
                '18': [2, 57, 0],
                '19': [2, 57, 0],
                '20': [2, 57, 0],
                '21': [2, 57, 0],
                '22': [2, 57, 0],
                '23': [2, 57, 0],
                '24': [2, 57, 0],
                '25': [2, 57, 0],
                '26': [2, 57, 0],
                '27': [2, 57, 0],
                '29': [2, 57, 0],
                '30': [2, 57, 0]
            },
            '11': {
                '8': [1, 0, 37]
            },
            '12': {
                '8': [2, 18, 0],
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 38]
            },
            '13': {
                '8': [2, 54, 0],
                '9': [2, 54, 0],
                '10': [2, 54, 0],
                '11': [2, 54, 0],
                '12': [2, 54, 0],
                '13': [2, 54, 0],
                '14': [2, 54, 0],
                '15': [2, 54, 0],
                '16': [2, 54, 0],
                '17': [2, 54, 0],
                '18': [2, 54, 0],
                '19': [2, 54, 0],
                '20': [2, 54, 0],
                '21': [2, 54, 0],
                '22': [2, 54, 0],
                '23': [2, 54, 0],
                '24': [2, 54, 0],
                '25': [2, 54, 0],
                '26': [2, 54, 0],
                '27': [2, 54, 0],
                '29': [2, 54, 0],
                '30': [1, 0, 46]
            },
            '14': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '15': {
                '27': [1, 0, 48]
            },
            '16': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '17': {
                '8': [2, 44, 0],
                '9': [2, 44, 0],
                '10': [2, 44, 0],
                '11': [2, 44, 0],
                '12': [2, 44, 0],
                '13': [2, 44, 0],
                '14': [2, 44, 0],
                '15': [2, 44, 0],
                '16': [2, 44, 0],
                '17': [2, 44, 0],
                '18': [2, 44, 0],
                '19': [2, 44, 0],
                '20': [2, 44, 0],
                '21': [2, 44, 0],
                '22': [2, 44, 0],
                '23': [2, 44, 0],
                '24': [2, 44, 0],
                '25': [2, 44, 0],
                '26': [2, 44, 0],
                '27': [2, 44, 0],
                '29': [2, 44, 0]
            },
            '18': {
                '8': [2, 47, 0],
                '9': [2, 47, 0],
                '10': [2, 47, 0],
                '11': [2, 47, 0],
                '12': [2, 47, 0],
                '13': [2, 47, 0],
                '14': [2, 47, 0],
                '15': [2, 47, 0],
                '16': [2, 47, 0],
                '17': [2, 47, 0],
                '18': [2, 47, 0],
                '19': [2, 47, 0],
                '20': [2, 47, 0],
                '21': [2, 47, 0],
                '22': [2, 47, 0],
                '23': [2, 47, 0],
                '24': [2, 47, 0],
                '25': [2, 47, 0],
                '26': [2, 47, 0],
                '27': [2, 47, 0],
                '29': [2, 47, 0]
            },
            '19': {
                '8': [2, 45, 0],
                '9': [2, 45, 0],
                '10': [2, 45, 0],
                '11': [2, 45, 0],
                '12': [2, 45, 0],
                '13': [2, 45, 0],
                '14': [2, 45, 0],
                '15': [2, 45, 0],
                '16': [2, 45, 0],
                '17': [2, 45, 0],
                '18': [2, 45, 0],
                '19': [2, 45, 0],
                '20': [2, 45, 0],
                '21': [2, 45, 0],
                '22': [2, 45, 0],
                '23': [2, 45, 0],
                '24': [2, 45, 0],
                '25': [2, 45, 0],
                '26': [2, 45, 0],
                '27': [2, 45, 0],
                '29': [2, 45, 0]
            },
            '20': {
                '8': [1, 0, 50]
            },
            '21': {
                '8': [2, 48, 0],
                '9': [1, 0, 14],
                '11': [2, 48, 0],
                '12': [2, 48, 0],
                '13': [2, 48, 0],
                '14': [2, 48, 0],
                '15': [2, 48, 0],
                '16': [2, 48, 0],
                '17': [2, 48, 0],
                '18': [2, 48, 0],
                '19': [2, 48, 0],
                '20': [2, 48, 0],
                '21': [2, 48, 0],
                '22': [2, 48, 0],
                '23': [2, 48, 0],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 38]
            },
            '22': {
                '8': [1, 0, 51]
            },
            '23': {
                '8': [2, 22, 0],
                '9': [2, 22, 0],
                '10': [2, 22, 0],
                '11': [1, 0, 52],
                '20': [2, 22, 0],
                '24': [2, 22, 0],
                '25': [2, 22, 0],
                '26': [2, 22, 0],
                '27': [2, 22, 0],
                '29': [2, 22, 0]
            },
            '24': {
                '8': [2, 23, 0],
                '9': [2, 23, 0],
                '10': [2, 23, 0],
                '11': [2, 23, 0],
                '12': [1, 0, 53],
                '20': [2, 23, 0],
                '24': [2, 23, 0],
                '25': [2, 23, 0],
                '26': [2, 23, 0],
                '27': [2, 23, 0],
                '29': [2, 23, 0]
            },
            '25': {
                '8': [2, 25, 0],
                '9': [2, 25, 0],
                '10': [2, 25, 0],
                '11': [2, 25, 0],
                '12': [2, 25, 0],
                '13': [1, 0, 54],
                '14': [1, 0, 55],
                '20': [2, 25, 0],
                '24': [2, 25, 0],
                '25': [2, 25, 0],
                '26': [2, 25, 0],
                '27': [2, 25, 0],
                '29': [2, 25, 0]
            },
            '26': {
                '8': [2, 27, 0],
                '9': [2, 27, 0],
                '10': [2, 27, 0],
                '11': [2, 27, 0],
                '12': [2, 27, 0],
                '13': [2, 27, 0],
                '14': [2, 27, 0],
                '15': [1, 0, 56],
                '16': [1, 0, 57],
                '17': [1, 0, 58],
                '18': [1, 0, 59],
                '20': [2, 27, 0],
                '24': [2, 27, 0],
                '25': [2, 27, 0],
                '26': [2, 27, 0],
                '27': [2, 27, 0],
                '29': [2, 27, 0]
            },
            '27': {
                '8': [2, 30, 0],
                '9': [2, 30, 0],
                '10': [2, 30, 0],
                '11': [2, 30, 0],
                '12': [2, 30, 0],
                '13': [2, 30, 0],
                '14': [2, 30, 0],
                '15': [2, 30, 0],
                '16': [2, 30, 0],
                '17': [2, 30, 0],
                '18': [2, 30, 0],
                '19': [1, 0, 60],
                '20': [2, 30, 0],
                '24': [2, 30, 0],
                '25': [2, 30, 0],
                '26': [2, 30, 0],
                '27': [2, 30, 0],
                '29': [2, 30, 0]
            },
            '28': {
                '8': [2, 35, 0],
                '9': [2, 35, 0],
                '10': [2, 35, 0],
                '11': [2, 35, 0],
                '12': [2, 35, 0],
                '13': [2, 35, 0],
                '14': [2, 35, 0],
                '15': [2, 35, 0],
                '16': [2, 35, 0],
                '17': [2, 35, 0],
                '18': [2, 35, 0],
                '19': [2, 35, 0],
                '20': [2, 35, 0],
                '21': [1, 0, 62],
                '22': [1, 0, 63],
                '23': [1, 0, 64],
                '24': [2, 35, 0],
                '25': [2, 35, 0],
                '26': [2, 35, 0],
                '27': [2, 35, 0],
                '29': [2, 35, 0]
            },
            '29': {
                '8': [2, 38, 0],
                '9': [2, 38, 0],
                '10': [2, 38, 0],
                '11': [2, 38, 0],
                '12': [2, 38, 0],
                '13': [2, 38, 0],
                '14': [2, 38, 0],
                '15': [2, 38, 0],
                '16': [2, 38, 0],
                '17': [2, 38, 0],
                '18': [2, 38, 0],
                '19': [2, 38, 0],
                '20': [2, 38, 0],
                '21': [2, 38, 0],
                '22': [2, 38, 0],
                '23': [2, 38, 0],
                '24': [2, 38, 0],
                '25': [2, 38, 0],
                '26': [2, 38, 0],
                '27': [2, 38, 0],
                '29': [2, 38, 0]
            },
            '30': {
                '8': [2, 43, 0],
                '9': [2, 43, 0],
                '10': [2, 43, 0],
                '11': [2, 43, 0],
                '12': [2, 43, 0],
                '13': [2, 43, 0],
                '14': [2, 43, 0],
                '15': [2, 43, 0],
                '16': [2, 43, 0],
                '17': [2, 43, 0],
                '18': [2, 43, 0],
                '19': [2, 43, 0],
                '20': [2, 43, 0],
                '21': [2, 43, 0],
                '22': [2, 43, 0],
                '23': [2, 43, 0],
                '24': [2, 43, 0],
                '25': [2, 43, 0],
                '26': [2, 43, 0],
                '27': [2, 43, 0],
                '29': [2, 43, 0]
            },
            '31': {
                '8': [1, 0, 65]
            },
            '32': {
                '8': [1, 0, 66]
            },
            '33': {
                '8': [1, 0, 67]
            },
            '34': {
                '2': [1, 0, 1],
                '3': [1, 0, 2],
                '6': [1, 0, 3],
                '7': [1, 0, 4]
            },
            '35': {
                '1': [2, 4, 0],
                '2': [2, 4, 0],
                '3': [2, 4, 0],
                '4': [2, 4, 0],
                '5': [2, 4, 0],
                '6': [2, 4, 0],
                '7': [2, 4, 0]
            },
            '36': {
                '4': [1, 0, 69]
            },
            '37': {
                '2': [2, 8, 0],
                '3': [2, 8, 0],
                '6': [2, 8, 0],
                '7': [2, 8, 0]
            },
            '38': {
                '8': [2, 57, 0],
                '9': [2, 57, 0],
                '11': [2, 57, 0],
                '12': [2, 57, 0],
                '13': [2, 57, 0],
                '14': [2, 57, 0],
                '15': [2, 57, 0],
                '16': [2, 57, 0],
                '17': [2, 57, 0],
                '18': [2, 57, 0],
                '19': [2, 57, 0],
                '20': [2, 57, 0],
                '21': [2, 57, 0],
                '22': [2, 57, 0],
                '23': [2, 57, 0],
                '24': [2, 57, 0],
                '25': [2, 57, 0],
                '26': [2, 57, 0],
                '27': [2, 57, 0],
                '28': [1, 0, 71],
                '29': [2, 57, 0],
                '30': [2, 57, 0]
            },
            '39': {
                '8': [2, 48, 0],
                '9': [2, 48, 0],
                '10': [2, 48, 0],
                '11': [2, 48, 0],
                '12': [2, 48, 0],
                '13': [2, 48, 0],
                '14': [2, 48, 0],
                '15': [2, 48, 0],
                '16': [2, 48, 0],
                '17': [2, 48, 0],
                '18': [2, 48, 0],
                '19': [2, 48, 0],
                '20': [2, 48, 0],
                '21': [2, 48, 0],
                '22': [2, 48, 0],
                '23': [2, 48, 0],
                '24': [2, 48, 0],
                '25': [2, 48, 0],
                '26': [2, 48, 0],
                '27': [2, 48, 0],
                '29': [2, 48, 0]
            },
            '40': {
                '8': [2, 21, 0],
                '9': [2, 21, 0],
                '20': [2, 21, 0],
                '24': [2, 21, 0],
                '25': [2, 21, 0],
                '26': [2, 21, 0],
                '27': [2, 21, 0],
                '29': [2, 21, 0]
            },
            '41': {
                '8': [2, 16, 0],
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 38]
            },
            '42': {
                '8': [2, 17, 0]
            },
            '43': {
                '8': [2, 20, 0],
                '9': [2, 20, 0],
                '20': [2, 20, 0],
                '24': [2, 20, 0],
                '25': [2, 20, 0],
                '26': [2, 20, 0],
                '27': [2, 20, 0],
                '29': [2, 20, 0]
            },
            '44': {
                '8': [2, 50, 0],
                '29': [1, 0, 74]
            },
            '45': {
                '8': [2, 52, 0],
                '29': [2, 52, 0]
            },
            '46': {
                '27': [1, 0, 76],
                '29': [1, 0, 77]
            },
            '47': {
                '10': [1, 0, 78]
            },
            '48': {
                '8': [2, 46, 0],
                '9': [2, 46, 0],
                '10': [2, 46, 0],
                '11': [2, 46, 0],
                '12': [2, 46, 0],
                '13': [2, 46, 0],
                '14': [2, 46, 0],
                '15': [2, 46, 0],
                '16': [2, 46, 0],
                '17': [2, 46, 0],
                '18': [2, 46, 0],
                '19': [2, 46, 0],
                '20': [2, 46, 0],
                '21': [2, 46, 0],
                '22': [2, 46, 0],
                '23': [2, 46, 0],
                '24': [2, 46, 0],
                '25': [2, 46, 0],
                '26': [2, 46, 0],
                '27': [2, 46, 0],
                '29': [2, 46, 0]
            },
            '49': {
                '8': [2, 42, 0],
                '9': [2, 42, 0],
                '10': [2, 42, 0],
                '11': [2, 42, 0],
                '12': [2, 42, 0],
                '13': [2, 42, 0],
                '14': [2, 42, 0],
                '15': [2, 42, 0],
                '16': [2, 42, 0],
                '17': [2, 42, 0],
                '18': [2, 42, 0],
                '19': [2, 42, 0],
                '20': [2, 42, 0],
                '21': [2, 42, 0],
                '22': [2, 42, 0],
                '23': [2, 42, 0],
                '24': [2, 42, 0],
                '25': [2, 42, 0],
                '26': [2, 42, 0],
                '27': [2, 42, 0],
                '29': [2, 42, 0]
            },
            '50': {
                '1': [2, 11, 0],
                '2': [2, 11, 0],
                '3': [2, 11, 0],
                '4': [2, 11, 0],
                '5': [2, 11, 0],
                '6': [2, 11, 0],
                '7': [2, 11, 0]
            },
            '51': {
                '1': [2, 13, 0],
                '2': [2, 13, 0],
                '3': [2, 13, 0],
                '4': [2, 13, 0],
                '5': [2, 13, 0],
                '6': [2, 13, 0],
                '7': [2, 13, 0]
            },
            '52': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '53': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '54': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '55': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '56': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '57': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '58': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '59': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '60': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '61': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '62': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '63': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '64': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '65': {
                '1': [2, 10, 0],
                '2': [2, 10, 0],
                '3': [2, 10, 0],
                '4': [2, 10, 0],
                '5': [2, 10, 0],
                '6': [2, 10, 0],
                '7': [2, 10, 0]
            },
            '66': {
                '1': [2, 12, 0],
                '2': [2, 12, 0],
                '3': [2, 12, 0],
                '4': [2, 12, 0],
                '5': [2, 12, 0],
                '6': [2, 12, 0],
                '7': [2, 12, 0]
            },
            '67': {
                '2': [2, 14, 0],
                '3': [2, 14, 0],
                '6': [2, 14, 0],
                '7': [2, 14, 0]
            },
            '68': {
                '1': [2, 1, 0],
                '2': [1, 0, 1],
                '3': [1, 0, 2],
                '4': [2, 1, 0],
                '6': [1, 0, 3],
                '7': [1, 0, 4]
            },
            '69': {
                '29': [1, 0, 10]
            },
            '70': {
                '1': [2, 5, 0],
                '2': [2, 5, 0],
                '3': [2, 5, 0],
                '4': [2, 5, 0],
                '5': [2, 5, 0],
                '6': [2, 5, 0],
                '7': [2, 5, 0]
            },
            '71': {
                '9': [1, 0, 14],
                '20': [1, 0, 15],
                '24': [1, 0, 16],
                '25': [1, 0, 17],
                '26': [1, 0, 18],
                '27': [1, 0, 19],
                '29': [1, 0, 10]
            },
            '72': {
                '8': [2, 15, 0]
            },
            '73': {
                '8': [2, 19, 0],
                '9': [2, 19, 0],
                '20': [2, 19, 0],
                '24': [2, 19, 0],
                '25': [2, 19, 0],
                '26': [2, 19, 0],
                '27': [2, 19, 0],
                '29': [2, 19, 0]
            },
            '74': {
                '28': [1, 0, 71]
            },
            '75': {
                '8': [2, 51, 0],
                '29': [2, 51, 0]
            },
            '76': {
                '8': [2, 56, 0],
                '9': [2, 56, 0],
                '10': [2, 56, 0],
                '11': [2, 56, 0],
                '12': [2, 56, 0],
                '13': [2, 56, 0],
                '14': [2, 56, 0],
                '15': [2, 56, 0],
                '16': [2, 56, 0],
                '17': [2, 56, 0],
                '18': [2, 56, 0],
                '19': [2, 56, 0],
                '20': [2, 56, 0],
                '21': [2, 56, 0],
                '22': [2, 56, 0],
                '23': [2, 56, 0],
                '24': [2, 56, 0],
                '25': [2, 56, 0],
                '26': [2, 56, 0],
                '27': [2, 56, 0],
                '29': [2, 56, 0],
                '30': [2, 56, 0]
            },
            '77': {
                '8': [2, 55, 0],
                '9': [2, 55, 0],
                '10': [2, 55, 0],
                '11': [2, 55, 0],
                '12': [2, 55, 0],
                '13': [2, 55, 0],
                '14': [2, 55, 0],
                '15': [2, 55, 0],
                '16': [2, 55, 0],
                '17': [2, 55, 0],
                '18': [2, 55, 0],
                '19': [2, 55, 0],
                '20': [2, 55, 0],
                '21': [2, 55, 0],
                '22': [2, 55, 0],
                '23': [2, 55, 0],
                '24': [2, 55, 0],
                '25': [2, 55, 0],
                '26': [2, 55, 0],
                '27': [2, 55, 0],
                '29': [2, 55, 0],
                '30': [2, 55, 0]
            },
            '78': {
                '8': [2, 49, 0],
                '9': [2, 49, 0],
                '10': [2, 49, 0],
                '11': [2, 49, 0],
                '12': [2, 49, 0],
                '13': [2, 49, 0],
                '14': [2, 49, 0],
                '15': [2, 49, 0],
                '16': [2, 49, 0],
                '17': [2, 49, 0],
                '18': [2, 49, 0],
                '19': [2, 49, 0],
                '20': [2, 49, 0],
                '21': [2, 49, 0],
                '22': [2, 49, 0],
                '23': [2, 49, 0],
                '24': [2, 49, 0],
                '25': [2, 49, 0],
                '26': [2, 49, 0],
                '27': [2, 49, 0],
                '29': [2, 49, 0]
            },
            '79': {
                '8': [2, 24, 0],
                '9': [2, 24, 0],
                '10': [2, 24, 0],
                '11': [2, 24, 0],
                '12': [1, 0, 53],
                '20': [2, 24, 0],
                '24': [2, 24, 0],
                '25': [2, 24, 0],
                '26': [2, 24, 0],
                '27': [2, 24, 0],
                '29': [2, 24, 0]
            },
            '80': {
                '8': [2, 26, 0],
                '9': [2, 26, 0],
                '10': [2, 26, 0],
                '11': [2, 26, 0],
                '12': [2, 26, 0],
                '13': [1, 0, 54],
                '14': [1, 0, 55],
                '20': [2, 26, 0],
                '24': [2, 26, 0],
                '25': [2, 26, 0],
                '26': [2, 26, 0],
                '27': [2, 26, 0],
                '29': [2, 26, 0]
            },
            '81': {
                '8': [2, 28, 0],
                '9': [2, 28, 0],
                '10': [2, 28, 0],
                '11': [2, 28, 0],
                '12': [2, 28, 0],
                '13': [2, 28, 0],
                '14': [2, 28, 0],
                '15': [1, 0, 56],
                '16': [1, 0, 57],
                '17': [1, 0, 58],
                '18': [1, 0, 59],
                '20': [2, 28, 0],
                '24': [2, 28, 0],
                '25': [2, 28, 0],
                '26': [2, 28, 0],
                '27': [2, 28, 0],
                '29': [2, 28, 0]
            },
            '82': {
                '8': [2, 29, 0],
                '9': [2, 29, 0],
                '10': [2, 29, 0],
                '11': [2, 29, 0],
                '12': [2, 29, 0],
                '13': [2, 29, 0],
                '14': [2, 29, 0],
                '15': [1, 0, 56],
                '16': [1, 0, 57],
                '17': [1, 0, 58],
                '18': [1, 0, 59],
                '20': [2, 29, 0],
                '24': [2, 29, 0],
                '25': [2, 29, 0],
                '26': [2, 29, 0],
                '27': [2, 29, 0],
                '29': [2, 29, 0]
            },
            '83': {
                '8': [2, 32, 0],
                '9': [2, 32, 0],
                '10': [2, 32, 0],
                '11': [2, 32, 0],
                '12': [2, 32, 0],
                '13': [2, 32, 0],
                '14': [2, 32, 0],
                '15': [2, 32, 0],
                '16': [2, 32, 0],
                '17': [2, 32, 0],
                '18': [2, 32, 0],
                '19': [1, 0, 60],
                '20': [2, 32, 0],
                '24': [2, 32, 0],
                '25': [2, 32, 0],
                '26': [2, 32, 0],
                '27': [2, 32, 0],
                '29': [2, 32, 0]
            },
            '84': {
                '8': [2, 34, 0],
                '9': [2, 34, 0],
                '10': [2, 34, 0],
                '11': [2, 34, 0],
                '12': [2, 34, 0],
                '13': [2, 34, 0],
                '14': [2, 34, 0],
                '15': [2, 34, 0],
                '16': [2, 34, 0],
                '17': [2, 34, 0],
                '18': [2, 34, 0],
                '19': [1, 0, 60],
                '20': [2, 34, 0],
                '24': [2, 34, 0],
                '25': [2, 34, 0],
                '26': [2, 34, 0],
                '27': [2, 34, 0],
                '29': [2, 34, 0]
            },
            '85': {
                '8': [2, 31, 0],
                '9': [2, 31, 0],
                '10': [2, 31, 0],
                '11': [2, 31, 0],
                '12': [2, 31, 0],
                '13': [2, 31, 0],
                '14': [2, 31, 0],
                '15': [2, 31, 0],
                '16': [2, 31, 0],
                '17': [2, 31, 0],
                '18': [2, 31, 0],
                '19': [1, 0, 60],
                '20': [2, 31, 0],
                '24': [2, 31, 0],
                '25': [2, 31, 0],
                '26': [2, 31, 0],
                '27': [2, 31, 0],
                '29': [2, 31, 0]
            },
            '86': {
                '8': [2, 33, 0],
                '9': [2, 33, 0],
                '10': [2, 33, 0],
                '11': [2, 33, 0],
                '12': [2, 33, 0],
                '13': [2, 33, 0],
                '14': [2, 33, 0],
                '15': [2, 33, 0],
                '16': [2, 33, 0],
                '17': [2, 33, 0],
                '18': [2, 33, 0],
                '19': [1, 0, 60],
                '20': [2, 33, 0],
                '24': [2, 33, 0],
                '25': [2, 33, 0],
                '26': [2, 33, 0],
                '27': [2, 33, 0],
                '29': [2, 33, 0]
            },
            '87': {
                '8': [2, 36, 0],
                '9': [2, 36, 0],
                '10': [2, 36, 0],
                '11': [2, 36, 0],
                '12': [2, 36, 0],
                '13': [2, 36, 0],
                '14': [2, 36, 0],
                '15': [2, 36, 0],
                '16': [2, 36, 0],
                '17': [2, 36, 0],
                '18': [2, 36, 0],
                '19': [2, 36, 0],
                '20': [2, 36, 0],
                '21': [1, 0, 62],
                '22': [1, 0, 63],
                '23': [1, 0, 64],
                '24': [2, 36, 0],
                '25': [2, 36, 0],
                '26': [2, 36, 0],
                '27': [2, 36, 0],
                '29': [2, 36, 0]
            },
            '88': {
                '8': [2, 37, 0],
                '9': [2, 37, 0],
                '10': [2, 37, 0],
                '11': [2, 37, 0],
                '12': [2, 37, 0],
                '13': [2, 37, 0],
                '14': [2, 37, 0],
                '15': [2, 37, 0],
                '16': [2, 37, 0],
                '17': [2, 37, 0],
                '18': [2, 37, 0],
                '19': [2, 37, 0],
                '20': [2, 37, 0],
                '21': [1, 0, 62],
                '22': [1, 0, 63],
                '23': [1, 0, 64],
                '24': [2, 37, 0],
                '25': [2, 37, 0],
                '26': [2, 37, 0],
                '27': [2, 37, 0],
                '29': [2, 37, 0]
            },
            '89': {
                '8': [2, 39, 0],
                '9': [2, 39, 0],
                '10': [2, 39, 0],
                '11': [2, 39, 0],
                '12': [2, 39, 0],
                '13': [2, 39, 0],
                '14': [2, 39, 0],
                '15': [2, 39, 0],
                '16': [2, 39, 0],
                '17': [2, 39, 0],
                '18': [2, 39, 0],
                '19': [2, 39, 0],
                '20': [2, 39, 0],
                '21': [2, 39, 0],
                '22': [2, 39, 0],
                '23': [2, 39, 0],
                '24': [2, 39, 0],
                '25': [2, 39, 0],
                '26': [2, 39, 0],
                '27': [2, 39, 0],
                '29': [2, 39, 0]
            },
            '90': {
                '8': [2, 40, 0],
                '9': [2, 40, 0],
                '10': [2, 40, 0],
                '11': [2, 40, 0],
                '12': [2, 40, 0],
                '13': [2, 40, 0],
                '14': [2, 40, 0],
                '15': [2, 40, 0],
                '16': [2, 40, 0],
                '17': [2, 40, 0],
                '18': [2, 40, 0],
                '19': [2, 40, 0],
                '20': [2, 40, 0],
                '21': [2, 40, 0],
                '22': [2, 40, 0],
                '23': [2, 40, 0],
                '24': [2, 40, 0],
                '25': [2, 40, 0],
                '26': [2, 40, 0],
                '27': [2, 40, 0],
                '29': [2, 40, 0]
            },
            '91': {
                '8': [2, 41, 0],
                '9': [2, 41, 0],
                '10': [2, 41, 0],
                '11': [2, 41, 0],
                '12': [2, 41, 0],
                '13': [2, 41, 0],
                '14': [2, 41, 0],
                '15': [2, 41, 0],
                '16': [2, 41, 0],
                '17': [2, 41, 0],
                '18': [2, 41, 0],
                '19': [2, 41, 0],
                '20': [2, 41, 0],
                '21': [2, 41, 0],
                '22': [2, 41, 0],
                '23': [2, 41, 0],
                '24': [2, 41, 0],
                '25': [2, 41, 0],
                '26': [2, 41, 0],
                '27': [2, 41, 0],
                '29': [2, 41, 0]
            },
            '92': {
                '8': [1, 0, 94]
            },
            '93': {
                '8': [2, 53, 0],
                '29': [2, 53, 0]
            },
            '94': {
                '1': [2, 9, 0],
                '2': [2, 9, 0],
                '3': [2, 9, 0],
                '4': [2, 9, 0],
                '5': [2, 9, 0],
                '6': [2, 9, 0],
                '7': [2, 9, 0]
            }
        }
    };
    parser.parse = function parse(input) {

        var self = this,
            lexer = self.lexer,
            state,
            symbol,
            action,
            table = self.table,
            gotos = table.gotos,
            tableAction = table.action,
            productions = self.productions,
            valueStack = [null],
            stack = [0];

        lexer.resetInput(input);

        while (1) {
            // retrieve state number from top of stack
            state = stack[stack.length - 1];

            if (!symbol) {
                symbol = lexer.lex();
            }

            if (!symbol) {
                S.log("it is not a valid input: " + input, "error");
                return false;
            }

            // read action for current state and first input
            action = tableAction[state] && tableAction[state][symbol];

            if (!action) {
                var expected = [],
                    error;
                if (tableAction[state]) {
                    S.each(tableAction[state], function (_, symbol) {
                        expected.push(self.lexer.mapReverseSymbol(symbol));
                    });
                }
                error = "Syntax error at line " + lexer.lineNumber + ":\n" + lexer.showDebugInfo() + "\n" + "expect " + expected.join(", ");
                S.error(error);
                return false;
            }

            switch (action[GrammarConst.TYPE_INDEX]) {

            case GrammarConst.SHIFT_TYPE:

                stack.push(symbol);

                valueStack.push(lexer.text);

                // push state
                stack.push(action[GrammarConst.TO_INDEX]);

                // allow to read more
                symbol = null;

                break;

            case GrammarConst.REDUCE_TYPE:

                var production = productions[action[GrammarConst.PRODUCTION_INDEX]],
                    reducedSymbol = production.symbol || production[0],
                    reducedAction = production.action || production[2],
                    reducedRhs = production.rhs || production[1],
                    len = reducedRhs.length,
                    i = 0,
                    ret = undefined,
                    $$ = valueStack[valueStack.length - len]; // default to $$ = $1

                self.$$ = $$;

                for (; i < len; i++) {
                    self["$" + (len - i)] = valueStack[valueStack.length - 1 - i];
                }

                if (reducedAction) {
                    ret = reducedAction.call(self);
                }

                if (ret !== undefined) {
                    $$ = ret;
                } else {
                    $$ = self.$$;
                }

                if (len) {
                    stack = stack.slice(0, - 1 * len * 2);
                    valueStack = valueStack.slice(0, - 1 * len);
                }

                stack.push(reducedSymbol);

                valueStack.push($$);

                var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];

                stack.push(newState);

                break;

            case GrammarConst.ACCEPT_TYPE:

                return $$;
            }

        }

        return undefined;

    };
    return parser;
});
