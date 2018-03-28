/**
 * This file is part of Adguard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * Adguard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Adguard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Adguard Browser Extension.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global FilterCompilerConditionsConstants */
/**
 * The utility tool resolves preprocessor directives in filter content.
 *
 * Directives syntax:
 * !#if, !#endif - filters maintainers can use these conditions to supply different rules depending on the ad blocker type.
 * condition - just like in some popular programming languages, pre-processor conditions are based on constants declared by ad blockers. Ad blocker authors define on their own what exact constants do they declare.
 * !#include - this directive allows to include contents of a specified file into the filter.
 *
 * Condition constants should be declared in FilterCompilerConditionsConstants
 *
 * More details:
 * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/917
 */
var FilterCompiler = (function () {

    var CONDITION_DIRECTIVE_START = "!#if";
    var CONDITION_DIRECTIVE_END = "!#endif";

    var CONDITION_OPERATOR_NOT = "!";
    var CONDITION_OPERATOR_AND = "&&";
    var CONDITION_OPERATOR_OR = "||";
    var CONDITION_BRACKET_OPEN_CHAR = "(";
    var CONDITION_BRACKET_CLOSE_CHAR = ")";

    var INCLUDE_DIRECTIVE = "!#include";

    /**
     * Checks brackets in string
     *
     * @param str
     */
    var checkBracketsBalance = function (str) {
        var depth = 0;
        for (var i in str){
            if (str[i] === CONDITION_BRACKET_OPEN_CHAR) {
                // if the char is an opening parenthesis then we increase the depth
                depth ++;
            } else if(str[i] === CONDITION_BRACKET_CLOSE_CHAR) {
                // if the char is an closing parenthesis then we decrease the depth
                depth --;
            }
            //  if the depth is negative we have a closing parenthesis
            //  before any matching opening parenthesis
            if (depth < 0) {
                return false;
            }
        }
        // If the depth is not null then a closing parenthesis is missing
        if (depth > 0) {
            return false;
        }

        return true;
    };

    /**
     * Finds end of condition block started with startIndex
     *
     * @param rules
     * @param startIndex
     */
    var findConditionEnd = function (rules, startIndex) {
        for (var j = startIndex; j < rules.length; j++) {
            var internalRule = rules[j];

            if (internalRule.indexOf(CONDITION_DIRECTIVE_START) === 0) {
                throw new Error('Invalid directives: Nested conditions are not supported: ' + internalRule);
            }

            if (internalRule.indexOf(CONDITION_DIRECTIVE_END) === 0) {
                return j;
            }
        }

        return -1;
    };

    /**
     * Resolves constant expression
     *
     * @param expression
     */
    var resolveConditionConstant = function (expression) {
        if (!expression) {
            throw new Error('Invalid directives: Empty condition');
        }

        var trim = expression.trim();
        return trim === "true" || FilterCompilerConditionsConstants[trim];
    };

    /**
     * Calculates conditional expression
     *
     * @param expression
     */
    var resolveExpression = function (expression) {
        if (!expression) {
            throw new Error('Invalid directives: Empty condition');
        }

        expression = expression.trim();

        if (!checkBracketsBalance(expression)) {
            throw new Error('Invalid directives: Incorrect brackets: ' + expression);
        }

        //Replace bracketed expressions
        var openBracketIndex = expression.lastIndexOf(CONDITION_BRACKET_OPEN_CHAR);
        if (openBracketIndex !== -1) {
            var endBracketIndex = expression.indexOf(CONDITION_BRACKET_CLOSE_CHAR, openBracketIndex);
            var innerExpression = expression.substring(openBracketIndex + 1, endBracketIndex);
            var innerResult = resolveExpression(innerExpression);
            var resolvedInner = expression.substring(0, openBracketIndex) +
                    innerResult + expression.substring(endBracketIndex + 1);

            return resolveExpression(resolvedInner);
        }

        var result;

        // Resolve logical operators
        var indexOfAndOperator = expression.indexOf(CONDITION_OPERATOR_AND);
        var indexOfOrOperator = expression.indexOf(CONDITION_OPERATOR_OR);
        var indexOfNotOperator = expression.indexOf(CONDITION_OPERATOR_NOT);

        if (indexOfOrOperator !== -1) {
            result  = resolveExpression(expression.substring(0, indexOfOrOperator - 1)) ||
                resolveExpression(expression.substring(indexOfOrOperator + CONDITION_OPERATOR_OR.length, expression.length));
        } else if (indexOfAndOperator !== -1) {
            result  = resolveExpression(expression.substring(0, indexOfAndOperator - 1)) &&
                resolveExpression(expression.substring(indexOfAndOperator + CONDITION_OPERATOR_AND.length, expression.length));
        } else if (indexOfNotOperator === 0) {
            result = !resolveExpression(expression.substring(CONDITION_OPERATOR_NOT.length));
        } else {
            result = resolveConditionConstant(expression);
        }

        return result;
    };

    /**
     * Validates and resolves condition directive
     *
     * @param directive
     */
    var resolveCondition = function (directive) {
        var expression = directive.substring(CONDITION_DIRECTIVE_START.length).trim();

        return resolveExpression(expression);
    };

    /**
     * Resolves conditions directives
     *
     * @param rules
     */
    var resolveConditions = function (rules) {
        var result = [];

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];

            if (rule.indexOf(CONDITION_DIRECTIVE_START) === 0) {
                var endLineIndex = findConditionEnd(rules, i + 1);
                if (endLineIndex === -1) {
                    throw new Error('Invalid directives: Condition end not found: ' + rule);
                }

                var conditionValue = resolveCondition(rule);
                if (conditionValue) {
                    result = result.concat(rules.slice(i + 1, endLineIndex));
                }

                // Skip to the end of block
                i = endLineIndex;
            } else if (rule.indexOf(CONDITION_DIRECTIVE_END) === 0) {
                // Found condition end without start
                throw new Error('Invalid directives: Found unexpected condition end: ' + rule);
            } else {
                result.push(rule);
            }
        }

        return result;
    };

    /**
     * Executes async request
     *
     * @param url Url
     * @param contentType Content type
     * @param successCallback success callback
     * @param errorCallback error callback
     */
    var executeRequestAsync = function (url, contentType, successCallback, errorCallback) {

        var request = new XMLHttpRequest();
        try {
            request.open('GET', url);
            request.setRequestHeader('Content-type', contentType);
            request.setRequestHeader('Pragma', 'no-cache');
            request.overrideMimeType(contentType);
            request.mozBackgroundRequest = true;
            if (successCallback) {
                request.onload = function () {
                    successCallback(request);
                };
            }
            if (errorCallback) {
                var errorCallbackWrapper = function () {
                    errorCallback(request);
                };
                request.onerror = errorCallbackWrapper;
                request.onabort = errorCallbackWrapper;
                request.ontimeout = errorCallbackWrapper;
            }
            request.send(null);
        } catch (ex) {
            if (errorCallback) {
                errorCallback(request, ex);
            }
        }
    };

    /**
     * Validates and resolves include directive
     *
     * @param directive
     */
    var resolveInclude = function (directive) {
        var dfd = new Promise(function (resolve, reject) {
            if (directive.indexOf(INCLUDE_DIRECTIVE) !== 0) {
                resolve([directive]);
            } else {
                var url = directive.substring(INCLUDE_DIRECTIVE.length).trim();
                //TODO: Validate url

                var onError = function (request, ex) {
                    reject(ex);
                };

                var onSuccess = function (response) {
                    var responseText = response.responseText;
                    if (!responseText) {
                        onError(response, "Response is empty");
                    }

                    var lines = responseText.split(/[\r\n]+/);
                    //TODO: Compile lines
                    resolve(lines);
                };

                executeRequestAsync(url, "text/plain", onSuccess, onError);
            }
        });

        return dfd;
    };

    /**
     * Resolves include directives
     *
     * @param rules
     */
    var resolveIncludes = function (rules) {
        var dfds = [];

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];

            dfds.push(resolveInclude(rule));
        }

        return Promise.all(dfds);
    };

    /**
     * Compiles filter content
     *
     * @param rules Array of strings
     */
    var compile = function (rules, successCallBack, errorCallback) {

        try {
            // Resolve 'if' conditions
            var resolvedConditionsResult = resolveConditions(rules);

            // Resolve 'includes' directives
            var promise = resolveIncludes(resolvedConditionsResult);

            promise.then(function (values) {
                var result = [];
                values.forEach(function (v) {
                    result = result.concat(v);
                });

                successCallBack(result);
            }, function (ex) {
                errorCallback(ex);
            });

        } catch (ex) {
            errorCallback(ex);
        }
    };

    return {
        compile: compile
    };

})();

