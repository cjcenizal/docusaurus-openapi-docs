"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTagDisplayName = exports.processOpenapiFile = exports.processOpenapiFiles = exports.readOpenapiFiles = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("@docusaurus/utils");
const openapi_to_postmanv2_1 = __importDefault(require("@paloaltonetworks/openapi-to-postmanv2"));
const postman_collection_1 = __importDefault(require("@paloaltonetworks/postman-collection"));
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const kebabCase_1 = __importDefault(require("lodash/kebabCase"));
const unionBy_1 = __importDefault(require("lodash/unionBy"));
const uniq_1 = __importDefault(require("lodash/uniq"));
const createRequestExample_1 = require("./createRequestExample");
const loadAndResolveSpec_1 = require("./utils/loadAndResolveSpec");
const index_1 = require("../index");
/**
 * Convenience function for converting raw JSON to a Postman Collection object.
 */
function jsonToCollection(data) {
    return new Promise((resolve, reject) => {
        let schemaPack = new openapi_to_postmanv2_1.default.SchemaPack({ type: "json", data }, { schemaFaker: false });
        schemaPack.computedOptions.schemaFaker = false;
        schemaPack.convert((_err, conversionResult) => {
            if (!conversionResult.result) {
                return reject(conversionResult.reason);
            }
            return resolve(new postman_collection_1.default.Collection(conversionResult.output[0].data));
        });
    });
}
/**
 * Creates a Postman Collection object from an OpenAPI definition.
 */
async function createPostmanCollection(openapiData) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    // Create copy of openapiData
    const data = (0, cloneDeep_1.default)(openapiData);
    // Including `servers` breaks postman, so delete all of them.
    delete data.servers;
    for (let pathItemObject of Object.values(data.paths)) {
        delete pathItemObject.servers;
        (_a = pathItemObject.get) === null || _a === void 0 ? true : delete _a.servers;
        (_b = pathItemObject.put) === null || _b === void 0 ? true : delete _b.servers;
        (_c = pathItemObject.post) === null || _c === void 0 ? true : delete _c.servers;
        (_d = pathItemObject.delete) === null || _d === void 0 ? true : delete _d.servers;
        (_e = pathItemObject.options) === null || _e === void 0 ? true : delete _e.servers;
        (_f = pathItemObject.head) === null || _f === void 0 ? true : delete _f.servers;
        (_g = pathItemObject.patch) === null || _g === void 0 ? true : delete _g.servers;
        (_h = pathItemObject.trace) === null || _h === void 0 ? true : delete _h.servers;
    }
    return await jsonToCollection(data);
}
function createItems(openapiData, options, sidebarOptions) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
    // TODO: Find a better way to handle this
    let items = [];
    const infoIdSpaces = openapiData.info.title.replace(" ", "-").toLowerCase();
    const infoId = (0, kebabCase_1.default)(infoIdSpaces);
    if (openapiData.info.description || openapiData.info.title) {
        // Only create an info page if we have a description.
        const infoDescription = (_a = openapiData.info) === null || _a === void 0 ? void 0 : _a.description;
        let splitDescription;
        if (infoDescription) {
            splitDescription = infoDescription.match(/[^\r\n]+/g);
        }
        const infoPage = {
            type: "info",
            id: infoId,
            unversionedId: infoId,
            title: openapiData.info.title
                ? openapiData.info.title.replace(/((?:^|[^\\])(?:\\{2})*)"/g, "$1'")
                : "",
            description: openapiData.info.description
                ? openapiData.info.description.replace(/((?:^|[^\\])(?:\\{2})*)"/g, "$1'")
                : "",
            frontMatter: {
                description: splitDescription
                    ? splitDescription[0]
                        .replace(/((?:^|[^\\])(?:\\{2})*)"/g, "$1'")
                        .replace(/\s+$/, "")
                    : "",
            },
            securitySchemes: (_b = openapiData.components) === null || _b === void 0 ? void 0 : _b.securitySchemes,
            info: {
                ...openapiData.info,
                tags: openapiData.tags,
                title: (_c = openapiData.info.title) !== null && _c !== void 0 ? _c : "Introduction",
                logo: openapiData.info["x-logo"],
                darkLogo: openapiData.info["x-dark-logo"],
            },
        };
        items.push(infoPage);
    }
    for (let [path, pathObject] of Object.entries(openapiData.paths)) {
        const { $ref, description, parameters, servers, summary, ...rest } = pathObject;
        for (let [method, operationObject] of Object.entries({ ...rest })) {
            const title = (_e = (_d = operationObject.summary) !== null && _d !== void 0 ? _d : operationObject.operationId) !== null && _e !== void 0 ? _e : "Missing summary";
            if (operationObject.description === undefined) {
                operationObject.description =
                    (_g = (_f = operationObject.summary) !== null && _f !== void 0 ? _f : operationObject.operationId) !== null && _g !== void 0 ? _g : "";
            }
            const baseId = operationObject.operationId
                ? (0, kebabCase_1.default)(operationObject.operationId)
                : (0, kebabCase_1.default)(operationObject.summary);
            const extensions = [];
            const commonExtensions = ["x-codeSamples"];
            for (const [key, value] of Object.entries(operationObject)) {
                if (key.startsWith("x-") && !commonExtensions.includes(key)) {
                    extensions.push({ key, value });
                }
            }
            const servers = (_j = (_h = operationObject.servers) !== null && _h !== void 0 ? _h : pathObject.servers) !== null && _j !== void 0 ? _j : openapiData.servers;
            const security = (_k = operationObject.security) !== null && _k !== void 0 ? _k : openapiData.security;
            // Add security schemes so we know how to handle security.
            const securitySchemes = (_l = openapiData.components) === null || _l === void 0 ? void 0 : _l.securitySchemes;
            // Make sure schemes are lowercase. See: https://github.com/cloud-annotations/docusaurus-plugin-openapi/issues/79
            if (securitySchemes) {
                for (let securityScheme of Object.values(securitySchemes)) {
                    if (securityScheme.type === "http") {
                        securityScheme.scheme = securityScheme.scheme.toLowerCase();
                    }
                }
            }
            let jsonRequestBodyExample;
            const content = (_m = operationObject.requestBody) === null || _m === void 0 ? void 0 : _m.content;
            let body;
            for (let key in content) {
                if (key.toLowerCase() === "application/json" ||
                    key.toLowerCase() === "application/json; charset=utf-8") {
                    body = content[key];
                    break;
                }
            }
            if (body === null || body === void 0 ? void 0 : body.schema) {
                jsonRequestBodyExample = (0, createRequestExample_1.sampleRequestFromSchema)(body.schema);
            }
            // Handle vendor JSON media types
            const bodyContent = (_o = operationObject.requestBody) === null || _o === void 0 ? void 0 : _o.content;
            if (bodyContent) {
                const firstBodyContentKey = Object.keys(bodyContent)[0];
                if (firstBodyContentKey.endsWith("+json")) {
                    const firstBody = bodyContent[firstBodyContentKey];
                    if (firstBody === null || firstBody === void 0 ? void 0 : firstBody.schema) {
                        jsonRequestBodyExample = (0, createRequestExample_1.sampleRequestFromSchema)(firstBody.schema);
                    }
                }
            }
            // TODO: Don't include summary temporarilly
            const { summary, ...defaults } = operationObject;
            // Merge common parameters with operation parameters
            // Operation params take precendence over common params
            if (parameters !== undefined) {
                if (operationObject.parameters !== undefined) {
                    defaults.parameters = (0, unionBy_1.default)(operationObject.parameters, parameters, "name");
                }
                else {
                    defaults.parameters = parameters;
                }
            }
            const opDescription = operationObject.description;
            let splitDescription;
            if (opDescription) {
                splitDescription = opDescription.match(/[^\r\n]+/g);
            }
            const apiPage = {
                type: "api",
                id: baseId,
                infoId: infoId !== null && infoId !== void 0 ? infoId : "",
                unversionedId: baseId,
                title: title ? title.replace(/((?:^|[^\\])(?:\\{2})*)"/g, "$1'") : "",
                description: operationObject.description
                    ? operationObject.description.replace(/((?:^|[^\\])(?:\\{2})*)"/g, "$1'")
                    : "",
                frontMatter: {
                    description: splitDescription
                        ? splitDescription[0]
                            .replace(/((?:^|[^\\])(?:\\{2})*)"/g, "$1'")
                            .replace(/\s+$/, "")
                        : "",
                    ...((options === null || options === void 0 ? void 0 : options.proxy) && { proxy: options.proxy }),
                    ...((options === null || options === void 0 ? void 0 : options.hideSendButton) && {
                        hide_send_button: options.hideSendButton,
                    }),
                    ...((options === null || options === void 0 ? void 0 : options.showExtensions) && {
                        show_extensions: options.showExtensions,
                    }),
                },
                api: {
                    ...defaults,
                    ...(extensions.length > 0 && { extensions: extensions }),
                    tags: operationObject.tags,
                    method,
                    path,
                    servers,
                    security,
                    securitySchemes,
                    jsonRequestBodyExample,
                    info: openapiData.info,
                },
            };
            items.push(apiPage);
        }
    }
    // Gather x-webhooks endpoints
    for (let [path, pathObject] of Object.entries((_p = openapiData["x-webhooks"]) !== null && _p !== void 0 ? _p : {})) {
        path = "webhook";
        const { $ref, description, parameters, servers, summary, ...rest } = pathObject;
        for (let [method, operationObject] of Object.entries({ ...rest })) {
            method = "event";
            const title = (_r = (_q = operationObject.summary) !== null && _q !== void 0 ? _q : operationObject.operationId) !== null && _r !== void 0 ? _r : "Missing summary";
            if (operationObject.description === undefined) {
                operationObject.description =
                    (_t = (_s = operationObject.summary) !== null && _s !== void 0 ? _s : operationObject.operationId) !== null && _t !== void 0 ? _t : "";
            }
            const baseId = operationObject.operationId
                ? (0, kebabCase_1.default)(operationObject.operationId)
                : (0, kebabCase_1.default)(operationObject.summary);
            const extensions = [];
            const commonExtensions = ["x-codeSamples"];
            for (const [key, value] of Object.entries(operationObject)) {
                if (key.startsWith("x-") && !commonExtensions.includes(key)) {
                    extensions.push({ key, value });
                }
            }
            const servers = (_v = (_u = operationObject.servers) !== null && _u !== void 0 ? _u : pathObject.servers) !== null && _v !== void 0 ? _v : openapiData.servers;
            const security = (_w = operationObject.security) !== null && _w !== void 0 ? _w : openapiData.security;
            // Add security schemes so we know how to handle security.
            const securitySchemes = (_x = openapiData.components) === null || _x === void 0 ? void 0 : _x.securitySchemes;
            // Make sure schemes are lowercase. See: https://github.com/cloud-annotations/docusaurus-plugin-openapi/issues/79
            if (securitySchemes) {
                for (let securityScheme of Object.values(securitySchemes)) {
                    if (securityScheme.type === "http") {
                        securityScheme.scheme = securityScheme.scheme.toLowerCase();
                    }
                }
            }
            let jsonRequestBodyExample;
            const content = (_y = operationObject.requestBody) === null || _y === void 0 ? void 0 : _y.content;
            let body;
            for (let key in content) {
                if (key.toLowerCase() === "application/json" ||
                    key.toLowerCase() === "application/json; charset=utf-8") {
                    body = content[key];
                    break;
                }
            }
            if (body === null || body === void 0 ? void 0 : body.schema) {
                jsonRequestBodyExample = (0, createRequestExample_1.sampleRequestFromSchema)(body.schema);
            }
            // Handle vendor JSON media types
            const bodyContent = (_z = operationObject.requestBody) === null || _z === void 0 ? void 0 : _z.content;
            if (bodyContent) {
                const firstBodyContentKey = Object.keys(bodyContent)[0];
                if (firstBodyContentKey.endsWith("+json")) {
                    const firstBody = bodyContent[firstBodyContentKey];
                    if (firstBody === null || firstBody === void 0 ? void 0 : firstBody.schema) {
                        jsonRequestBodyExample = (0, createRequestExample_1.sampleRequestFromSchema)(firstBody.schema);
                    }
                }
            }
            // TODO: Don't include summary temporarilly
            const { summary, ...defaults } = operationObject;
            // Merge common parameters with operation parameters
            // Operation params take precendence over common params
            if (parameters !== undefined) {
                if (operationObject.parameters !== undefined) {
                    defaults.parameters = (0, unionBy_1.default)(operationObject.parameters, parameters, "name");
                }
                else {
                    defaults.parameters = parameters;
                }
            }
            const opDescription = operationObject.description;
            let splitDescription;
            if (opDescription) {
                splitDescription = opDescription.match(/[^\r\n]+/g);
            }
            const apiPage = {
                type: "api",
                id: baseId,
                infoId: infoId !== null && infoId !== void 0 ? infoId : "",
                unversionedId: baseId,
                title: title ? title.replace(/((?:^|[^\\])(?:\\{2})*)"/g, "$1'") : "",
                description: operationObject.description
                    ? operationObject.description.replace(/((?:^|[^\\])(?:\\{2})*)"/g, "$1'")
                    : "",
                frontMatter: {
                    description: splitDescription
                        ? splitDescription[0]
                            .replace(/((?:^|[^\\])(?:\\{2})*)"/g, "$1'")
                            .replace(/\s+$/, "")
                        : "",
                    ...((options === null || options === void 0 ? void 0 : options.proxy) && { proxy: options.proxy }),
                    ...((options === null || options === void 0 ? void 0 : options.hideSendButton) && {
                        hide_send_button: options.hideSendButton,
                    }),
                    ...((options === null || options === void 0 ? void 0 : options.showExtensions) && {
                        show_extensions: options.showExtensions,
                    }),
                },
                api: {
                    ...defaults,
                    ...(extensions.length > 0 && { extensions: extensions }),
                    tags: operationObject.tags,
                    method,
                    path,
                    servers,
                    security,
                    securitySchemes,
                    jsonRequestBodyExample,
                    info: openapiData.info,
                },
            };
            items.push(apiPage);
        }
    }
    if ((options === null || options === void 0 ? void 0 : options.showSchemas) === true) {
        // Gather schemas
        for (let [schema, schemaObject] of Object.entries((_1 = (_0 = openapiData === null || openapiData === void 0 ? void 0 : openapiData.components) === null || _0 === void 0 ? void 0 : _0.schemas) !== null && _1 !== void 0 ? _1 : {})) {
            const baseIdSpaces = (_3 = (_2 = schemaObject === null || schemaObject === void 0 ? void 0 : schemaObject.title) === null || _2 === void 0 ? void 0 : _2.replace(" ", "-").toLowerCase()) !== null && _3 !== void 0 ? _3 : "";
            const baseId = (0, kebabCase_1.default)(baseIdSpaces);
            const schemaDescription = schemaObject.description;
            let splitDescription;
            if (schemaDescription) {
                splitDescription = schemaDescription.match(/[^\r\n]+/g);
            }
            const schemaPage = {
                type: "schema",
                id: baseId,
                infoId: infoId !== null && infoId !== void 0 ? infoId : "",
                unversionedId: baseId,
                title: schemaObject.title
                    ? schemaObject.title.replace(/((?:^|[^\\])(?:\\{2})*)"/g, "$1'")
                    : schema,
                description: schemaObject.description
                    ? schemaObject.description.replace(/((?:^|[^\\])(?:\\{2})*)"/g, "$1'")
                    : "",
                frontMatter: {
                    description: splitDescription
                        ? splitDescription[0]
                            .replace(/((?:^|[^\\])(?:\\{2})*)"/g, "$1'")
                            .replace(/\s+$/, "")
                        : "",
                },
                schema: schemaObject,
            };
            items.push(schemaPage);
        }
    }
    if ((sidebarOptions === null || sidebarOptions === void 0 ? void 0 : sidebarOptions.categoryLinkSource) === "tag") {
        // Get global tags
        const tags = (_4 = openapiData.tags) !== null && _4 !== void 0 ? _4 : [];
        // Get operation tags
        const apiItems = items.filter((item) => {
            return item.type === "api";
        });
        const operationTags = (0, uniq_1.default)(apiItems
            .flatMap((item) => item.api.tags)
            .filter((item) => !!item));
        // eslint-disable-next-line array-callback-return
        tags
            .filter((tag) => operationTags.includes(tag.name)) // include only tags referenced by operation
            // eslint-disable-next-line array-callback-return
            .map((tag) => {
            var _a;
            const description = getTagDisplayName(tag.name, (_a = openapiData.tags) !== null && _a !== void 0 ? _a : []);
            const tagId = (0, kebabCase_1.default)(tag.name);
            const splitDescription = description.match(/[^\r\n]+/g);
            const tagPage = {
                type: "tag",
                id: tagId,
                unversionedId: tagId,
                title: description !== null && description !== void 0 ? description : "",
                description: description !== null && description !== void 0 ? description : "",
                frontMatter: {
                    description: splitDescription
                        ? splitDescription[0]
                            .replace(/((?:^|[^\\])(?:\\{2})*)"/g, "$1'")
                            .replace(/\s+$/, "")
                        : "",
                },
                tag: {
                    ...tag,
                },
            };
            items.push(tagPage);
        });
    }
    return items;
}
/**
 * Attach Postman Request objects to the corresponding ApiItems.
 */
function bindCollectionToApiItems(items, postmanCollection) {
    postmanCollection.forEachItem((item) => {
        const method = item.request.method.toLowerCase();
        const path = item.request.url
            .getPath({ unresolved: true }) // unresolved returns "/:variableName" instead of "/<type>"
            .replace(/(?<![a-z0-9-_]+):([a-z0-9-_]+)/gi, "{$1}"); // replace "/:variableName" with "/{variableName}"
        const apiItem = items.find((item) => {
            if (item.type === "info" ||
                item.type === "tag" ||
                item.type === "schema") {
                return false;
            }
            return item.api.path === path && item.api.method === method;
        });
        if ((apiItem === null || apiItem === void 0 ? void 0 : apiItem.type) === "api") {
            apiItem.api.postman = item.request;
        }
    });
}
async function readOpenapiFiles(openapiPath) {
    if (!(0, index_1.isURL)(openapiPath)) {
        const stat = await fs_extra_1.default.lstat(openapiPath);
        if (stat.isDirectory()) {
            // TODO: Add config for inlcude/ignore
            const allFiles = await (0, utils_1.Globby)(["**/*.{json,yaml,yml}"], {
                cwd: openapiPath,
                ignore: utils_1.GlobExcludeDefault,
                deep: 1,
            });
            const sources = allFiles.filter((x) => !x.includes("_category_")); // todo: regex exclude?
            return Promise.all(sources.map(async (source) => {
                // TODO: make a function for this
                const fullPath = (0, utils_1.posixPath)(path_1.default.join(openapiPath, source));
                const data = (await (0, loadAndResolveSpec_1.loadAndResolveSpec)(fullPath));
                return {
                    source: fullPath,
                    sourceDirName: path_1.default.dirname(source),
                    data,
                };
            }));
        }
    }
    const data = (await (0, loadAndResolveSpec_1.loadAndResolveSpec)(openapiPath));
    return [
        {
            source: openapiPath,
            sourceDirName: ".",
            data,
        },
    ];
}
exports.readOpenapiFiles = readOpenapiFiles;
async function processOpenapiFiles(files, options, sidebarOptions) {
    const promises = files.map(async (file) => {
        if (file.data !== undefined) {
            const processedFile = await processOpenapiFile(file.data, options, sidebarOptions);
            const itemsObjectsArray = processedFile[0].map((item) => ({
                ...item,
            }));
            const tags = processedFile[1];
            const tagGroups = processedFile[2];
            return [itemsObjectsArray, tags, tagGroups];
        }
        console.warn(chalk_1.default.yellow(`WARNING: the following OpenAPI spec returned undefined: ${file.source}`));
        return [];
    });
    const metadata = await Promise.all(promises);
    const items = metadata
        .map(function (x) {
        return x[0];
    })
        .flat()
        .filter(function (x) {
        // Remove undefined items due to transient parsing errors
        return x !== undefined;
    });
    const tags = metadata
        .map(function (x) {
        return x[1];
    })
        .filter(function (x) {
        // Remove undefined tags due to transient parsing errors
        return x !== undefined;
    });
    const tagGroups = metadata
        .map(function (x) {
        return x[2];
    })
        .flat()
        .filter(function (x) {
        // Remove undefined tags due to transient parsing errors
        return x !== undefined;
    });
    return [
        items,
        tags,
        tagGroups,
    ];
}
exports.processOpenapiFiles = processOpenapiFiles;
async function processOpenapiFile(openapiData, options, sidebarOptions) {
    const postmanCollection = await createPostmanCollection(openapiData);
    const items = createItems(openapiData, options, sidebarOptions);
    bindCollectionToApiItems(items, postmanCollection);
    let tags = [];
    if (openapiData.tags !== undefined) {
        tags = openapiData.tags;
    }
    let tagGroups = [];
    if (openapiData["x-tagGroups"] !== undefined) {
        tagGroups = openapiData["x-tagGroups"];
    }
    return [items, tags, tagGroups];
}
exports.processOpenapiFile = processOpenapiFile;
// order for picking items as a display name of tags
const tagDisplayNameProperties = ["x-displayName", "name"];
function getTagDisplayName(tagName, tags) {
    var _a;
    // find the very own tagObject
    const tagObject = (_a = tags.find((tagObject) => tagObject.name === tagName)) !== null && _a !== void 0 ? _a : {
        // if none found, just fake one
        name: tagName,
    };
    // return the first found and filled value from the property list
    for (const property of tagDisplayNameProperties) {
        const displayName = tagObject[property];
        if (typeof displayName === "string") {
            return displayName;
        }
    }
    // always default to the tagName
    return tagName;
}
exports.getTagDisplayName = getTagDisplayName;
