"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.languageSet = void 0;
const react_1 = __importStar(require("react"));
const useDocusaurusContext_1 = __importDefault(
  require("@docusaurus/useDocusaurusContext")
);
const postman_code_generators_1 = __importDefault(
  require("@paloaltonetworks/postman-code-generators")
);
const ApiCodeBlock_1 = __importDefault(
  require("@theme/ApiExplorer/ApiCodeBlock")
);
const buildPostmanRequest_1 = __importDefault(
  require("@theme/ApiExplorer/buildPostmanRequest")
);
const CodeTabs_1 = __importDefault(require("@theme/ApiExplorer/CodeTabs"));
const hooks_1 = require("@theme/ApiItem/hooks");
const merge_1 = __importDefault(require("lodash/merge"));
const languages_1 = require("./languages");
exports.languageSet = [
  {
    highlight: "bash",
    language: "curl",
    codeSampleLanguage: "Shell",
    logoClass: "bash",
    options: {
      longFormat: false,
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "cURL",
    variants: ["curl"],
  },
  {
    highlight: "python",
    language: "python",
    codeSampleLanguage: "Python",
    logoClass: "python",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "requests",
    variants: ["requests", "http.client"],
  },
  {
    highlight: "go",
    language: "go",
    codeSampleLanguage: "Go",
    logoClass: "go",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "native",
    variants: ["native"],
  },
  {
    highlight: "javascript",
    language: "nodejs",
    codeSampleLanguage: "JavaScript",
    logoClass: "nodejs",
    options: {
      ES6_enabled: true,
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "axios",
    variants: ["axios", "native"],
  },
  {
    highlight: "ruby",
    language: "ruby",
    codeSampleLanguage: "Ruby",
    logoClass: "ruby",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "Net::HTTP",
    variants: ["net::http"],
  },
  {
    highlight: "csharp",
    language: "csharp",
    codeSampleLanguage: "C#",
    logoClass: "csharp",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "RestSharp",
    variants: ["restsharp", "httpclient"],
  },
  {
    highlight: "php",
    language: "php",
    codeSampleLanguage: "PHP",
    logoClass: "php",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "cURL",
    variants: ["curl", "guzzle", "pecl_http", "http_request2"],
  },
  {
    highlight: "java",
    language: "java",
    codeSampleLanguage: "Java",
    logoClass: "java",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "OkHttp",
    variants: ["okhttp", "unirest"],
  },
  {
    highlight: "powershell",
    language: "powershell",
    codeSampleLanguage: "PowerShell",
    logoClass: "powershell",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "RestMethod",
    variants: ["restmethod"],
  },
];
function CodeTab({ children, hidden, className }) {
  return react_1.default.createElement(
    "div",
    { role: "tabpanel", className: className, ...{ hidden } },
    children
  );
}
function CodeSnippets({ postman, codeSamples }) {
  // TODO: match theme for vscode.
  const { siteConfig } = (0, useDocusaurusContext_1.default)();
  const contentType = (0, hooks_1.useTypedSelector)(
    (state) => state.contentType.value
  );
  const accept = (0, hooks_1.useTypedSelector)((state) => state.accept.value);
  const server = (0, hooks_1.useTypedSelector)((state) => state.server.value);
  const body = (0, hooks_1.useTypedSelector)((state) => state.body);
  const pathParams = (0, hooks_1.useTypedSelector)(
    (state) => state.params.path
  );
  const queryParams = (0, hooks_1.useTypedSelector)(
    (state) => state.params.query
  );
  const cookieParams = (0, hooks_1.useTypedSelector)(
    (state) => state.params.cookie
  );
  const headerParams = (0, hooks_1.useTypedSelector)(
    (state) => state.params.header
  );
  const auth = (0, hooks_1.useTypedSelector)((state) => state.auth);
  // User-defined languages array
  // Can override languageSet, change order of langs, override options and variants
  const langs = [
    ...(siteConfig?.themeConfig?.languageTabs ?? exports.languageSet),
  ];
  // Filter languageSet by user-defined langs
  const filteredLanguageSet = exports.languageSet.filter((ls) => {
    return langs.some((lang) => {
      return lang.language === ls.language;
    });
  });
  // Merge user-defined langs into languageSet
  const mergedLangs = (0, languages_1.mergeCodeSampleLanguage)(
    (0, merge_1.default)(filteredLanguageSet, langs),
    codeSamples
  );
  // Read defaultLang from localStorage
  const defaultLang = mergedLangs.filter(
    (lang) =>
      lang.language === localStorage.getItem("docusaurus.tab.code-samples")
  );
  const [selectedVariant, setSelectedVariant] = (0, react_1.useState)();
  const [selectedSample, setSelectedSample] = (0, react_1.useState)();
  const [language, setLanguage] = (0, react_1.useState)(() => {
    // Return first index if only 1 user-defined language exists
    if (mergedLangs.length === 1) {
      return mergedLangs[0];
    }
    // Fall back to language in localStorage or first user-defined language
    return defaultLang[0] ?? mergedLangs[0];
  });
  const [codeText, setCodeText] = (0, react_1.useState)("");
  const [codeSampleCodeText, setCodeSampleCodeText] = (0, react_1.useState)(
    () => (0, languages_1.getCodeSampleSourceFromLanguage)(language)
  );
  (0, react_1.useEffect)(() => {
    if (language && !!language.sample) {
      setCodeSampleCodeText(
        (0, languages_1.getCodeSampleSourceFromLanguage)(language)
      );
    }
    if (language && !!language.options) {
      const postmanRequest = (0, buildPostmanRequest_1.default)(postman, {
        queryParams,
        pathParams,
        cookieParams,
        contentType,
        accept,
        headerParams,
        body,
        server,
        auth,
      });
      postman_code_generators_1.default.convert(
        language.language,
        language.variant,
        postmanRequest,
        language.options,
        (error, snippet) => {
          if (error) {
            return;
          }
          setCodeText(snippet);
        }
      );
    } else if (language && !language.options) {
      const langSource = mergedLangs.filter(
        (lang) => lang.language === language.language
      );
      // Merges user-defined language with default languageSet
      // This allows users to define only the minimal properties necessary in languageTabs
      // User-defined properties should override languageSet properties
      const mergedLanguage = { ...langSource[0], ...language };
      const postmanRequest = (0, buildPostmanRequest_1.default)(postman, {
        queryParams,
        pathParams,
        cookieParams,
        contentType,
        accept,
        headerParams,
        body,
        server,
        auth,
      });
      postman_code_generators_1.default.convert(
        mergedLanguage.language,
        mergedLanguage.variant,
        postmanRequest,
        mergedLanguage.options,
        (error, snippet) => {
          if (error) {
            return;
          }
          setCodeText(snippet);
        }
      );
    } else {
      setCodeText("");
    }
  }, [
    accept,
    body,
    contentType,
    cookieParams,
    headerParams,
    language,
    pathParams,
    postman,
    queryParams,
    server,
    auth,
    mergedLangs,
  ]);
  // no dependencies was intentionlly set for this particular hook. it's safe as long as if conditions are set
  (0, react_1.useEffect)(function onSelectedVariantUpdate() {
    if (selectedVariant && selectedVariant !== language.variant) {
      const postmanRequest = (0, buildPostmanRequest_1.default)(postman, {
        queryParams,
        pathParams,
        cookieParams,
        contentType,
        accept,
        headerParams,
        body,
        server,
        auth,
      });
      postman_code_generators_1.default.convert(
        language.language,
        selectedVariant,
        postmanRequest,
        language.options,
        (error, snippet) => {
          if (error) {
            return;
          }
          setCodeText(snippet);
        }
      );
    }
  });
  // no dependencies was intentionlly set for this particular hook. it's safe as long as if conditions are set
  // eslint-disable-next-line react-hooks/exhaustive-deps
  (0, react_1.useEffect)(function onSelectedSampleUpdate() {
    if (
      language.samples &&
      language.samplesSources &&
      selectedSample &&
      selectedSample !== language.sample
    ) {
      const sampleIndex = language.samples.findIndex(
        (smp) => smp === selectedSample
      );
      setCodeSampleCodeText(language.samplesSources[sampleIndex]);
    }
  });
  if (language === undefined) {
    return null;
  }
  return react_1.default.createElement(
    react_1.default.Fragment,
    null,
    react_1.default.createElement(
      CodeTabs_1.default,
      {
        groupId: "code-samples",
        action: {
          setLanguage: setLanguage,
          setSelectedVariant: setSelectedVariant,
          setSelectedSample: setSelectedSample,
        },
        languageSet: mergedLangs,
        lazy: true,
      },
      mergedLangs.map((lang) => {
        return react_1.default.createElement(
          CodeTab,
          {
            value: lang.language,
            label: lang.language,
            key: lang.language,
            attributes: {
              className: `openapi-tabs__code-item--${lang.logoClass}`,
            },
          },
          lang.samples &&
            react_1.default.createElement(
              CodeTabs_1.default,
              {
                className: "openapi-tabs__code-container-inner",
                action: {
                  setLanguage: setLanguage,
                  setSelectedSample: setSelectedSample,
                },
                includeSample: true,
                currentLanguage: lang.language,
                defaultValue: selectedSample,
                languageSet: mergedLangs,
                lazy: true,
              },
              lang.samples.map((sample, index) => {
                return react_1.default.createElement(
                  CodeTab,
                  {
                    value: sample,
                    label: lang.samplesLabels
                      ? lang.samplesLabels[index]
                      : sample,
                    key: `${lang.language}-${lang.sample}`,
                    attributes: {
                      className: `openapi-tabs__code-item--sample`,
                    },
                  },
                  react_1.default.createElement(
                    ApiCodeBlock_1.default,
                    {
                      language: lang.highlight,
                      className: "openapi-explorer__code-block",
                      showLineNumbers: true,
                    },
                    codeSampleCodeText
                  )
                );
              })
            ),
          react_1.default.createElement(
            CodeTabs_1.default,
            {
              className: "openapi-tabs__code-container-inner",
              action: {
                setLanguage: setLanguage,
                setSelectedVariant: setSelectedVariant,
              },
              includeVariant: true,
              currentLanguage: lang.language,
              defaultValue: selectedVariant,
              languageSet: mergedLangs,
              lazy: true,
            },
            lang.variants.map((variant, index) => {
              return react_1.default.createElement(
                CodeTab,
                {
                  value: variant.toLowerCase(),
                  label: variant.toUpperCase(),
                  key: `${lang.language}-${lang.variant}`,
                  attributes: {
                    className: `openapi-tabs__code-item--variant`,
                  },
                },
                react_1.default.createElement(
                  ApiCodeBlock_1.default,
                  {
                    language: lang.highlight,
                    className: "openapi-explorer__code-block",
                    showLineNumbers: true,
                  },
                  codeText
                )
              );
            })
          )
        );
      })
    )
  );
}
exports.default = CodeSnippets;
