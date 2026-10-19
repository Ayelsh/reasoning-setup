var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name]() {
    return __privateGet(this, extra);
  }, set [name](x) {
    return __privateSet(this, extra, x);
  } }, name));
  k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name) : __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra : desc : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// src/host/errors.ts
import { RemoteError } from "@deepseek-ai/dsh-typert-protocol";
function reasoningSetupError(code, message2, options = {}) {
  return new RemoteError(code, message2, { reason: options.reason ?? code }, options.cause === void 0 ? {} : { cause: options.cause });
}

// src/host/scan.ts
var PI_AI_SETTINGS_NS = "llm-pi-ai";
var REASONING_LEVELS = [
  "off",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
];
var THINKING_FORMATS = [
  "openai",
  "deepseek",
  "openrouter",
  "together",
  "baseten",
  "zai",
  "qwen",
  "chat-template",
  "qwen-chat-template",
  "string-thinking",
  "ant-ling"
];
function record(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function routeFormSlice(value, provider) {
  const providers = record(record(value)?.["providers"]);
  return record(providers?.[provider]);
}
function entrySlice(value) {
  const entry = record(value);
  if (entry === void 0) return {};
  const levels = record(entry["reasoningEfforts"]);
  const compat = record(entry["compat"]);
  return {
    ...levels === void 0 ? {} : { reasoningEfforts: levels },
    ...compat === void 0 ? {} : { compat }
  };
}
function modelDeclaration(provider, route, model) {
  if (route === void 0) return void 0;
  if (route.models !== void 0) {
    const index = route.models.findIndex((entry) => entry.id === model);
    if (index < 0) return void 0;
    return declarationAt("models-entry", ["providers", provider, "models", String(index)], entrySlice(route.models[index]));
  }
  return declarationAt(
    "model-override",
    ["providers", provider, "modelOverrides", model],
    entrySlice(route.modelOverrides?.[model])
  );
}
function declarationAt(path, entryPath, entry) {
  return {
    path,
    entryPath,
    ...entry.reasoningEfforts === void 0 ? {} : { levels: entry.reasoningEfforts },
    ...entry.compat === void 0 ? {} : { compat: entry.compat },
    ...entry.compat?.thinkingFormat === void 0 ? {} : { format: entry.compat.thinkingFormat }
  };
}
function validateLevels(levels) {
  const entries = Object.entries(levels);
  for (const [level, wire] of entries) {
    if (!REASONING_LEVELS.includes(level)) {
      return `"${level}" is not a reasoning level; the vocabulary is ${REASONING_LEVELS.join(", ")}`;
    }
    if (wire === null) {
      if (level !== "off") return `level "${level}" needs the wire value dispatch should send; only "off" may leave it empty`;
    } else if (wire.length === 0) {
      return `level "${level}" must not be an empty string`;
    }
  }
  if (!entries.some(([level]) => level !== "off")) {
    return 'the declaration offers no level beyond "off"; declare a thinking level';
  }
  return void 0;
}
function effortOps(edit, declaration) {
  if (edit.kind === "remove") {
    if (declaration.levels === void 0 && declaration.format === void 0) return [];
    return [
      ...declaration.levels === void 0 ? [] : [{ op: "unset", path: [...declaration.entryPath, "reasoningEfforts"] }],
      ...declaration.format === void 0 ? [] : [{ op: "unset", path: [...declaration.entryPath, "compat", "thinkingFormat"] }]
    ];
  }
  const ops = [];
  if (JSON.stringify(declaration.levels) !== JSON.stringify(edit.levels)) {
    ops.push({ op: "set", path: [...declaration.entryPath, "reasoningEfforts"], value: edit.levels });
  }
  if (edit.thinkingFormat !== void 0 && declaration.format !== edit.thinkingFormat) {
    ops.push({
      op: "set",
      path: [...declaration.entryPath, "compat"],
      value: { ...declaration.compat, thinkingFormat: edit.thinkingFormat }
    });
  }
  return ops;
}

// src/host/service.ts
import { SettingsConflictError } from "@deepseek-ai/dsh-settings";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import z from "@deepseek-ai/schemastery";
var Config = z.object({});
function message(error) {
  return error instanceof Error ? error.message : String(error);
}
var _apply_dec, _scan_dec, _a, _init;
var ReasoningSetupService = class extends (_a = TypertRemoteService, _scan_dec = [Remote], _apply_dec = [Remote("apply")], _a) {
  /**
   * @param ctx - host context carrying the LLM runtime and the settings forms.
   * @param _config - validated (empty) configuration.
   */
  constructor(ctx, _config) {
    super(ctx, "reasoningSetup", { namespace: "reasoningSetup" });
    __runInitializers(_init, 5, this);
  }
  async scan() {
    const configurable = new Map(this.ctx.llm.listConfigurableProviders().map((entry) => [entry.provider, entry]));
    const form = this.piAiFormValue();
    const providers = [];
    for (const provider of this.ctx.llm.listProviders()) {
      const editable = configurable.get(provider.id)?.settingsNs === PI_AI_SETTINGS_NS;
      const route = editable ? routeFormSlice(form, provider.id) : void 0;
      const models = [];
      let note;
      try {
        for (const model of await this.ctx.llm.listModels(provider.id)) {
          models.push(await this.modelView(provider.id, editable, route, model));
        }
      } catch (error) {
        note = message(error);
      }
      providers.push({
        id: provider.id,
        name: provider.name,
        editable,
        ...note === void 0 ? {} : { note },
        models
      });
    }
    return { providers, levels: REASONING_LEVELS, formats: THINKING_FORMATS };
  }
  async apply(edit) {
    if (edit.kind === "set") {
      const invalid = validateLevels(edit.levels);
      if (invalid !== void 0) {
        throw reasoningSetupError("reasoning-setup/invalid-levels", invalid);
      }
      if (edit.thinkingFormat !== void 0 && !THINKING_FORMATS.includes(edit.thinkingFormat)) {
        throw reasoningSetupError(
          "reasoning-setup/invalid-levels",
          `"${edit.thinkingFormat}" is not a thinking format; the vocabulary is ${THINKING_FORMATS.join(", ")}`
        );
      }
    }
    const descriptor = this.ctx.settings.describe().find((row) => row.ns === PI_AI_SETTINGS_NS);
    if (descriptor === void 0) {
      throw reasoningSetupError("reasoning-setup/unknown-target", "the llm-pi-ai settings document is not available");
    }
    const route = routeFormSlice(descriptor.value, edit.provider);
    if (route === void 0) {
      throw reasoningSetupError(
        "reasoning-setup/unknown-target",
        `provider "${edit.provider}" is not a route in the llm-pi-ai settings document`
      );
    }
    const declaration = modelDeclaration(edit.provider, route, edit.model);
    if (declaration === void 0) {
      throw reasoningSetupError(
        "reasoning-setup/unknown-target",
        `model "${edit.model}" has no editable declaration site on provider "${edit.provider}"`
      );
    }
    const ops = effortOps(edit, declaration);
    if (ops.length === 0) return { applied: true };
    try {
      await this.ctx.settings.mutate(PI_AI_SETTINGS_NS, ops, descriptor.revision);
    } catch (error) {
      if (error instanceof SettingsConflictError) {
        throw reasoningSetupError(
          "reasoning-setup/conflict",
          "the settings document changed since the scan; reopen the page and retry",
          { cause: error }
        );
      }
      throw reasoningSetupError("reasoning-setup/write-refused", message(error), { cause: error });
    }
    return { applied: true };
  }
  /**
   * Project one model onto its scan view.
   * @param provider - provider route key.
   * @param routeEditable - whether the route is configurable through the llm-pi-ai document.
   * @param route - the route's stored slice, when routeEditable.
   * @param model - the listed model.
   * @returns the model's view, with the resolution refusal as its note when it refused.
   */
  async modelView(provider, routeEditable, route, model) {
    try {
      const resolved = await this.ctx.llm.resolveModelInfo(provider, model.id);
      const declaration = routeEditable ? modelDeclaration(provider, route, model.id) : void 0;
      return {
        id: model.id,
        name: model.name,
        hasReasoning: resolved.reasoning !== void 0,
        efforts: resolved.reasoning === void 0 ? [] : resolved.reasoning.efforts.map((effort) => effort.id),
        ...resolved.reasoning?.defaultEffort === void 0 ? {} : { defaultEffort: resolved.reasoning.defaultEffort },
        editable: declaration !== void 0,
        ...declaration === void 0 ? {} : {
          configPath: declaration.path,
          ...declaration.levels === void 0 ? {} : { declaredLevels: declaration.levels },
          ...declaration.format === void 0 ? {} : { declaredFormat: declaration.format }
        }
      };
    } catch (error) {
      return {
        id: model.id,
        name: model.name,
        hasReasoning: false,
        efforts: [],
        editable: false,
        note: message(error)
      };
    }
  }
  /** The stored form value of the llm-pi-ai settings namespace. */
  piAiFormValue() {
    return this.ctx.settings.describe().find((row) => row.ns === PI_AI_SETTINGS_NS)?.value;
  }
};
_init = __decoratorStart(_a);
__decorateElement(_init, 1, "scan", _scan_dec, ReasoningSetupService);
__decorateElement(_init, 1, "apply", _apply_dec, ReasoningSetupService);
__decoratorMetadata(_init, ReasoningSetupService);
__publicField(ReasoningSetupService, "inject", ["llm", "settings"]);
__publicField(ReasoningSetupService, "Config", Config);
var service_default = ReasoningSetupService;
export {
  Config,
  PI_AI_SETTINGS_NS,
  REASONING_LEVELS,
  ReasoningSetupService,
  THINKING_FORMATS,
  service_default as default,
  effortOps,
  modelDeclaration,
  reasoningSetupError,
  routeFormSlice,
  validateLevels
};
