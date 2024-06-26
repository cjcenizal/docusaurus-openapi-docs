"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeFence = exports.greaterThan = exports.lessThan = exports.render = exports.guard = exports.create = void 0;
function create(tag, props) {
    const { children, ...rest } = props;
    let propString = "";
    for (const [key, value] of Object.entries(rest)) {
        propString += ` ${key}={${JSON.stringify(value)}}`;
    }
    return `<${tag}${propString}>${render(children)}</${tag}>`;
}
exports.create = create;
function guard(value, cb) {
    if (!!value || value === 0) {
        const children = cb(value);
        return render(children);
    }
    return "";
}
exports.guard = guard;
function render(children) {
    if (Array.isArray(children)) {
        const filteredChildren = children.filter((c) => c !== undefined);
        return filteredChildren
            .map((i) => (Array.isArray(i) ? i.join("") : i))
            .join("");
    }
    return children !== null && children !== void 0 ? children : "";
}
exports.render = render;
// Regex to selectively URL-encode '>' and '<' chars
exports.lessThan = /<(?!(=|button|\s?\/button|code|\s?\/code|details|\s?\/details|summary|\s?\/summary|hr|\s?\/hr|br|\s?\/br|span|\s?\/span|strong|\s?\/strong|small|\s?\/small|table|\s?\/table|thead|\s?\/thead|tbody|\s?\/tbody|td|\s?\/td|tr|\s?\/tr|th|\s?\/th|h1|\s?\/h1|h2|\s?\/h2|h3|\s?\/h3|h4|\s?\/h4|h5|\s?\/h5|h6|\s?\/h6|title|\s?\/title|p|\s?\/p|em|\s?\/em|b|\s?\/b|i|\s?\/i|u|\s?\/u|strike|\s?\/strike|bold|\s?\/bold|a|\s?\/a|table|\s?\/table|li|\s?\/li|ol|\s?\/ol|ul|\s?\/ul|img|\s?\/img|svg|\s?\/svg|div|\s?\/div|center|\s?\/center))/gu;
exports.greaterThan = /(?<!(button|code|details|summary|hr|br|span|strong|small|table|thead|tbody|td|tr|th|h1|h2|h3|h4|h5|h6|title|p|em|b|i|u|strike|bold|a|li|ol|ul|img|svg|div|center|\/|\s|"|'))>/gu;
exports.codeFence = /`{1,3}[\s\S]*?`{1,3}/g;
