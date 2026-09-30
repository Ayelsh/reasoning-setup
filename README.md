# dsh-reasoning-setup

DeepSeek Harness 的思考强度配置页：一个 out-of-tree profile bundle（插件）。它扫描已注册的 Provider 与模型，找出**没有声明思考能力**的模型（这类模型在任何模型选择器里都不会出现「思考强度」一行），并提供一个设置页，直接为自定义 Provider 的模型声明 `reasoningEfforts` 与 `thinkingFormat`——写入的正是 `llm-pi-ai` 插件的那个设置文档（与「模型」设置页、dsh-zhipu-plan 写的是同一份）。

## 为什么需要它

dsh 中思考强度是每个模型的**声明式能力**，不是全局开关：只有当 provider/model 路由解析出的模型元数据带 `reasoning` 档位表时，选择器才会出现「思考强度」（见 harness `packages/llm/llm-pi-ai/src/catalog.ts` 的 `resolveModelReasoning`）。手工在 `models:` 列表里声明的模型默认按非推理模型处理，必须逐模型声明 `reasoningEfforts`。手改 YAML 容易拼错档位名和 wire 值；本插件把这件事变成页面上的勾选与填写，并在写入前按 pi-ai 解析器的同套规则校验。

## 页面能做什么

- **扫描**：列出全部已注册 Provider 及其模型，标记每个模型当前是否提供思考档位、提供哪些档、默认档是什么。不可经 llm-pi-ai 设置文档编辑的 Provider（如 deepseek-official）只读展示。
- **声明/修改**：为可编辑模型勾选要提供的档位（off / minimal / low / medium / high / xhigh / max），逐档填写 wire 发送值（即请求里发给网关的字符串；`off` 可留空＝选择该档时不发送思考参数），可选 `thinkingFormat`（openai / deepseek / qwen / zai 等 11 种）。
- **移除声明**：删掉本页写入的声明，让模型回到目录继承/默认行为。
- 写入带 revision 乐观锁；文档在扫描后被其它页面改动会拒绝写入（`reasoning-setup/conflict`）而不是覆盖。

## 写到哪里

- 路由带 `models:` 列表（自定义 provider 的常见形态）→ `providers.<route>.models.<i>.reasoningEfforts`（及同条目的 `compat.thinkingFormat`）。
- 目录路由（如 zai / zai-coding-cn）→ `providers.<route>.modelOverrides.<model>.reasoningEfforts`。

保存后重新打开模型选择器即可看到「思考强度」一行。

## 安装

需要 0.1.7-rc.2 及以上、实测 0.2.0-rc.1 的安装（dsh-base 挂载 llm/settings/Typert seam）。在应用内 **设置 → 插件** 里以该 tarball 的路径（先 `pnpm pack` 生成）安装并重启；或把 profile 的 `dsh.profile.bundles` 追加 `dsh-reasoning-setup`。插件不声明任何依赖，运行时通过 profile 的模块回退链接复用宿主已加载的 harness 包。

## 布局

| 路径 | 内容 |
|---|---|
| `src/host/` | `reasoningSetup` 服务：`scan()` 连接 LLM runtime 的 provider/model 枚举与 llm-pi-ai 设置文档；`apply()` 校验草稿后经 `ctx.settings.mutate` 写入。`scan.ts` 是纯函数（表读取、声明定位、校验镜像、op 构建）。 |
| `src/wire/` | 两个 Typert 面，按生成器输出形状手写（仓库生成器需要 workspace 的 ts.Program，out-of-tree 包没有）。`typert-host.js` 是 loader 从 `./typert` 导出注册的清单；`typert-remote-client.js` 是浏览器侧经 `ctx.remote.$mount` 挂载的贡献。 |
| `src/client/` | 设置页浏览器半边：注册 `settings.section` 插槽、双语字典、自注入样式表。 |
| `scripts/` | `build.mjs`（esbuild 三产物 + 自检）、`verify.mjs`（对照 harness 校验：导入解析、loader 清单校验、档位/格式词表与 `llm-pi-ai/src/catalog.ts` 的门表比对、scan 规则夹具）、`client-smoke.mjs`（stub shell 物化浏览器包）。 |

## 构建

```sh
pnpm install
pnpm run build      # 写 lib/index.js, lib/typert.js, lib/client.js
pnpm run verify     # build + 对照 deepseek-harness 检验 + 浏览器冒烟
```

host 半边导入 `@deepseek-ai/cordis`、`@deepseek-ai/dsh-settings`、`@deepseek-ai/dsh-typert-protocol`、`@deepseek-ai/schemastery`（类型另有 `dsh-llm`、`dsh-llm-pi-ai`），全部在宿主应用的依赖闭包里，模块回退链接会解析到运行进程已加载的副本。

## 已知边界

- 只能编辑经 `llm-pi-ai` 设置文档配置的路由；其它适配器（如 deepseek-official）的模型只读展示。
- 「移除声明」只移除本页写入的 `reasoningEfforts` / `compat.thinkingFormat`，不会把目录模型改成 `reasoningEfforts: false`（剥离目录声明的思考能力不属于本页的编辑动作）。
- 档位与格式词表镜像自 `dsh-llm-pi-ai/src/catalog.ts`（该包未导出）；`pnpm run verify` 与 harness 源码比对，升级 harness 后请重跑。

## 许可证

本项目以 MIT 许可证发布，见 [LICENSE](LICENSE)。

档位词表与校验规则镜像自 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)（MIT License, Copyright (c) 2026 DeepSeek）的 `packages/llm/llm-pi-ai/src/catalog.ts`，归属声明见 [NOTICE](NOTICE)。

本项目与 DeepSeek 无从属、背书或赞助关系。「DeepSeek」为其各自所有者的商标，此处仅为描述性使用。