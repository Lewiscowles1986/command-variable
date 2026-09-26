'use strict';

/**
 * Unit tests for utils.js — the pure helper layer.
 *
 * These are the highest-value tests in the suite: cheap, fast, and they pin
 * down behaviour that every command depends on (path separators, JSON cleaning,
 * UTF-8 conversion, argument coercion).
 */

const vscode = require('vscode');
const utils = require('../../utils');

// utils.js keeps `showErrMsg` in module state, so reset it per test.
beforeEach(() => {
  utils.setShowErrMsg(true);
});

describe('range', () => {
  it('produces a zero-based sequence', () => {
    expect(utils.range(3)).toEqual([0, 1, 2]);
  });

  it('honours the start offset', () => {
    expect(utils.range(3, 5)).toEqual([5, 6, 7]);
  });

  it('produces an empty array for size 0', () => {
    expect(utils.range(0)).toEqual([]);
  });
});

describe('nUp', () => {
  it('renders the zero case as an empty string', () => {
    expect(utils.nUp(0)).toBe('');
  });

  it('renders positive counts as a suffix', () => {
    expect(utils.nUp(1)).toBe('1Up');
    expect(utils.nUp(5)).toBe('5Up');
  });
});

describe('dblQuest (nullish-style default)', () => {
  it('substitutes only for undefined', () => {
    expect(utils.dblQuest(undefined, 'default')).toBe('default');
  });

  it('keeps null, 0, false and empty string', () => {
    expect(utils.dblQuest(null, 'default')).toBeNull();
    expect(utils.dblQuest(0, 'default')).toBe(0);
    expect(utils.dblQuest(false, 'default')).toBe(false);
    expect(utils.dblQuest('', 'default')).toBe('');
  });
});

describe('type predicates', () => {
  it('identifies strings', () => {
    expect(utils.isString('a')).toBe(true);
    expect(utils.isString(1)).toBe(false);
  });

  it('identifies arrays', () => {
    expect(utils.isArray([])).toBe(true);
    expect(utils.isArray({})).toBe(false);
  });

  it('identifies plain objects and excludes arrays', () => {
    expect(utils.isObject({})).toBe(true);
    expect(utils.isObject([])).toBe(false);
  });

  it('documents that null is currently treated as an object', () => {
    // Characterisation test: `typeof null === 'object'`, so this returns true.
    // Callers must guard against null themselves. If this ever becomes false,
    // the change is intentional and this test should be updated with it.
    expect(utils.isObject(null)).toBe(true);
  });
});

describe('getProperty / getDefaultProperty', () => {
  it('reads an own property', () => {
    expect(utils.getProperty({ a: 1 }, 'a', 0)).toBe(1);
  });

  it('falls back when the property is absent', () => {
    expect(utils.getProperty({}, 'a', 9)).toBe(9);
  });

  it('returns an explicit undefined rather than the default', () => {
    expect(utils.getProperty({ a: undefined }, 'a', 9)).toBeUndefined();
  });

  it('reads the default property', () => {
    expect(utils.getDefaultProperty({ default: 5 }, 0)).toBe(5);
    expect(utils.getDefaultProperty({}, 0)).toBe(0);
  });
});

describe('cleanJSONString (JSONC to JSON)', () => {
  it('strips line comments', () => {
    expect(utils.cleanJSONString('{ // note\n "a": 1 }')).toBe('{"a":1}');
  });

  it('removes trailing commas in objects and arrays', () => {
    expect(utils.cleanJSONString('{"a":1,}')).toBe('{"a":1}');
    expect(utils.cleanJSONString('[1,2,]')).toBe('[1,2]');
  });

  it('preserves separators that are not trailing', () => {
    expect(utils.cleanJSONString('{"a":1,"b":2}')).toBe('{"a":1,"b":2}');
  });

  it('treats slashes inside strings as data, not comments', () => {
    expect(utils.cleanJSONString('{"u":"https://example.com/x"}')).toBe(
      '{"u":"https://example.com/x"}'
    );
  });

  it('produces output that JSON.parse accepts', () => {
    const jsonc = `{
      // a comment
      "items": [
        "one", // first
        "two",
      ],
    }`;
    expect(JSON.parse(utils.cleanJSONString(jsonc))).toEqual({ items: ['one', 'two'] });
  });
});

describe('utf8 helpers', () => {
  it('decodes a UTF-8 byte sequence', () => {
    expect(utils.utf8_to_str([0xe2, 0x82, 0xac], 0, 3)).toBe('€');
  });

  it('honours the offset and limit arguments', () => {
    expect(utils.utf8_to_str([0x41, 0x42, 0x43], 1, 2)).toBe('B');
  });

  it('encodes a code point back to UTF-8 bytes', () => {
    expect(utils.str_to_utf8_array('€')).toEqual([0xe2, 0x82, 0xac]);
  });

  it('round-trips through both helpers', () => {
    const original = 'a€b😀c';
    expect(utils.utf8_to_str(utils.str_to_utf8_array(original))).toBe(original);
  });
});

describe('error reporting', () => {
  it('returns the fallback object and surfaces a message', () => {
    expect(utils.errorMessage('boom', 'fallback')).toBe('fallback');
    expect(vscode.__calls('window.showErrorMessage')).toHaveLength(1);
    expect(vscode.__calls('window.showErrorMessage')[0].args[0]).toBe('boom');
  });

  it('defaults to the string "Unknown" when no object is given', () => {
    expect(utils.errorMessage('boom')).toBe('Unknown');
  });

  it('suppresses the UI when error messages are disabled', () => {
    utils.setShowErrMsg(false);
    utils.errorMessage('boom');
    expect(vscode.__calls('window.showErrorMessage')).toHaveLength(0);
  });

  it('reports the multi-root workspace case with the right message', () => {
    expect(utils.fileNotInFolderError('x')).toBe('x');
    expect(vscode.__calls('window.showErrorMessage')[0].args[0]).toMatch(/Multi-root/);
  });
});
