/* global QUnit */

var FilterCompilerConditionsConstants = {
    adguard: true,
    adguard_ext_chromium: true,
    adguard_ext_firefox: false,
    adguard_ext_edge: false,
    adguard_ext_safari: false,
    adguard_ext_opera: false,
    adguard_ext_android_cb: false
};

QUnit.test("Test filter compiler", function (assert) {

    var rules = [
        'test'
    ];

    var compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 1);
    assert.equal(compiled[0], 'test');
});

QUnit.test("Test filter compiler - simple 'if' conditions", function (assert) {

    var rules;
    var compiled;

    rules = [
        'always_included_rule',
        '!#if adguard',
        'if_adguard_included_rule',
        '!#endif'
    ];

    rules = [
        'always_included_rule',
        '!#if (adguard)',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 2);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');

    rules = [
        'always_included_rule',
        '!#if !adguard',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 1);
    assert.equal(compiled[0], 'always_included_rule');

    rules = [
        'always_included_rule',
        '!#if !!adguard',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 2);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');

    rules = [
        'always_included_rule',
        '!#if true',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 2);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');

    rules = [
        'always_included_rule',
        '!#if adguard',
        'if_adguard_included_rule',
        '!#endif',
        '!#if adguard_ext_chromium',
        'if_adguard_ext_chromium_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 3);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');
    assert.equal(compiled[2], 'if_adguard_ext_chromium_included_rule');
});

QUnit.test("Test filter compiler - unsupported conditions", function (assert) {

    var rules = [
        'test',
        '!#if smth',
        'if_adguard_included_rule',
        '!#endif'
    ];

    var compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 1);
    assert.equal(compiled[0], 'test');
});

QUnit.test("Test filter compiler - logical 'if' conditions", function (assert) {

    var rules;
    var compiled;

    // true && true = true
    rules = [
        'always_included_rule',
        '!#if adguard && adguard_ext_chromium',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 2);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');

    // true && false = false
    rules = [
        'always_included_rule',
        '!#if adguard && adguard_ext_opera',
        'if_adguard_ext_opera_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 1);
    assert.equal(compiled[0], 'always_included_rule');

    // true || false = true
    rules = [
        'always_included_rule',
        '!#if adguard || adguard_ext_opera',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 2);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');

    // true && false || true = true
    rules = [
        'always_included_rule',
        '!#if adguard && adguard_ext_opera || adguard_ext_chromium',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 2);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');

    // true && false && true = false
    rules = [
        'always_included_rule',
        '!#if adguard && adguard_ext_opera && adguard_ext_chromium',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 1);
    assert.equal(compiled[0], 'always_included_rule');

    // false && true && true = false
    rules = [
        'always_included_rule',
        '!#if adguard_ext_opera && adguard && adguard_ext_chromium',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 1);
    assert.equal(compiled[0], 'always_included_rule');

    // false && true || true = true
    rules = [
        'always_included_rule',
        '!#if adguard_ext_opera && adguard || adguard_ext_chromium',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 2);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');

    // false || true && true = true
    rules = [
        'always_included_rule',
        '!#if adguard_ext_opera || adguard && adguard_ext_chromium',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 2);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');

    // false && false || true = true
    rules = [
        'always_included_rule',
        '!#if adguard_ext_opera && adguard_ext_firefox || adguard_ext_chromium',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 2);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');

    // false && true && true = false
    rules = [
        'always_included_rule',
        '!#if adguard_ext_opera && adguard && adguard_ext_chromium',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 1);
    assert.equal(compiled[0], 'always_included_rule');
});

QUnit.test("Test filter compiler - 'if' conditions brackets", function (assert) {

    var rules;
    var compiled;

    // (((true))) = true
    rules = [
        'always_included_rule',
        '!#if (((adguard)))',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 2);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');

    // (true && true) = true
    rules = [
        'always_included_rule',
        '!#if (adguard && adguard_ext_chromium)',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 2);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');

    // (true || false) && false = false
    rules = [
        'always_included_rule',
        '!#if (adguard || adguard_ext_opera) && adguard_ext_firefox',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 1);
    assert.equal(compiled[0], 'always_included_rule');

    // (false || false) && (false) = false
    rules = [
        'always_included_rule',
        '!#if ((adguard || adguard_ext_opera) && (adguard_ext_firefox))',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 1);
    assert.equal(compiled[0], 'always_included_rule');

    // false || true && (false) = false
    rules = [
        'always_included_rule',
        '!#if adguard_ext_opera || adguard && (adguard_ext_firefox)',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 1);
    assert.equal(compiled[0], 'always_included_rule');

    // !(false) = true
    rules = [
        'always_included_rule',
        '!#if !(adguard_ext_opera)',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 2);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');

    // false && true || true = true
    rules = [
        'always_included_rule',
        '!#if adguard_ext_opera && adguard || adguard_ext_chromium',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 2);
    assert.equal(compiled[0], 'always_included_rule');
    assert.equal(compiled[1], 'if_adguard_included_rule');

    // false && (true || true) = false
    rules = [
        'always_included_rule',
        '!#if adguard_ext_opera && (adguard || adguard_ext_chromium)',
        'if_adguard_included_rule',
        '!#endif'
    ];

    compiled = FilterCompiler.compile(rules);
    assert.ok(compiled);
    assert.equal(compiled.length, 1);
    assert.equal(compiled[0], 'always_included_rule');
});

QUnit.test("Test filter compiler - invalid 'if' conditions", function (assert) {

    var rules;

    rules = [
        'always_included_rule',
        '!# if adguard',
        'invalid_if_space',
        "!#endif"
    ];

    try {
        FilterCompiler.compile(rules);
        assert.ok(false);
    } catch (ex) {
        assert.ok(ex);
    }

    rules = [
        'always_included_rule',
        '!#if adguard',
        'missing_endif'
    ];

    try {
        FilterCompiler.compile(rules);
        assert.ok(false);
    } catch (ex) {
        assert.ok(ex);
    }

    rules = [
        'always_included_rule',
        '!#if',
        'invalid_condition',
        '!#endif'
    ];

    try {
        FilterCompiler.compile(rules);
        assert.ok(false);
    } catch (ex) {
        assert.ok(ex);
    }

    rules = [
        'always_included_rule',
        '!#if adguard',
        'invalid_condition',
        '!#if adguard_ext_chromium',
        'invalid_nested_condition',
        '!#endif',
        '!#endif'
    ];

    try {
        FilterCompiler.compile(rules);
        assert.ok(false);
    } catch (ex) {
        assert.ok(ex);
    }

    rules = [
        'always_included_rule',
        '!#if (adguard',
        'invalid_condition_brackets',
        '!#endif'
    ];

    try {
        FilterCompiler.compile(rules);
        assert.ok(false);
    } catch (ex) {
        assert.ok(ex);
    }
});