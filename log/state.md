# Kiroween 2026 — 状态与已核实事实

> 本文件只记录**页面上实际读到**的内容（verified_by:@TOOL）。
> 未核实的字段一律留空，不猜。

## 环境
- 日期：2026-11-01 21:5x (Asia/Shanghai)
- 浏览器：Brave Browser（com.brave.Browser, pid 6307），computer-use via `orca computer`
- 工作目录：/Users/romainchen/sideProjects/kiroween（初始只有 安装提示.md）
- computer-use 备注：首次 AX 调用报 permission_denied，重启 helper 进程（Orca Computer Use）后恢复。

## 账号（浏览器实测）
| 平台 | 状态 | 账号 |
|---|---|---|
| Kiro (app.kiro.dev) | 已登录 | nov1@***（见 log/private.md），Signed in with **BuilderId** |
| GitHub | 已登录 | JieGroupJay（显示名 JieGroup Jay） |
| Gmail | 已登录 | romain28***@gmail.com |
| Devpost | **未登录** | 页头显示 Log in / Sign up |

## Kiro User ID
```
d-9067642ac7.****（全文见 log/private.md）
```
来源：app.kiro.dev/settings/account → “Copy user ID to clipboard” → pbpaste。
注意：工程书里的 `kiro.dev/account/usage` 是 404，正确入口是 **app.kiro.dev/settings/account**。

## Devpost 赛事（kiroween.devpost.com 实测）
- 标题：Kiroween 2026: Build something wicked and git commit to the darkness.
- Participants: 5367
- Deadline: Dec 4, 2026 @ 2:00pm PST
- 页面上有 “Join hackathon” 按钮（未点，需先登录）
- 导航：Overview / My projects / Participants / Resources / Rules / Project gallery / Updates / Discussions / FAQ

## 从页面实测到的身份线索（供用户确认，不要直接当作证件信息使用）
GitHub 个人页 github.com/JieGroup（title: "JieGroup (Jay)"）：
- 显示名：**Jay JieGroup** (he/him)
- Bio：Cofounder of MorphMind. Building steerable AI and open-source tools for AI-powered work.
- 组织：@AIScientists-Dev ｜ 位置：Cambridge, MA
- 官网：https://morphmind.ai ｜ LinkedIn：in/profjieding ｜ X：@ProfJieDing
→ 若属实，**Best Startup Project 附加奖可叠加**（规则要求：确认创始人 + LinkedIn + 公司官网）。

X（x.com）：已登录，可发帖；但 x.com/ProfJieDing 页面显示 “Follow” 按钮，
说明**当前登录的 X 账号可能不是 @ProfJieDing**，发帖前需用户确认用哪个账号。

## 积分申请表（forms.gle/ykuadfNyNdWdbJfH9 → docs.google.com/forms/...）实测字段
当前登录：romain28***@gmail.com。表单语言为中文，按钮是「提交」。
必填项（与工程书一致，已核实）：
1. First Name（短文本）
2. Last Name（短文本）
3. Devpost Email（短文本）+ 提示 “You MUST be registered for the Hackathon in order to receive credits.”
4. Devpost Profile URL（短文本）
5. Country of Residence（短文本）
6. Do you have a Kiro User ID or an AWS User ID?（下拉：Only Kiro ID / Only AWS ID / Neither / Both）
7. Provide your Kiro user ID or AWS account ID ...（短文本，N/A 可填）
8. Tell us which CATEGORY and a little about what you're planning to build.（长文本，必须写类别名）
9. 身份验证同意项（勾选框，触发 Didit 证件+人脸验证）—— 原文已抄录，须由用户本人决定
表单页首提示：credits 不保证、先到先得、每人一码；未填 Category 会被拒。

## 待用户提供（P1–P14）
未收到。已给默认值，见对话中的表格。

## 待用户手动完成（H 交接点）
- H1 Devpost 登录/注册（**当前阻塞点**）
- 后续：YouTube 上传、博客、社交帖发布、Didit 身份验证、积分邮件兑换链接

## 本轮已完成的本地产出
- `log/rules-digest.md`：官方规则核实 + 存档 log/devpost-rules-clean.txt
- `log/state.md`：本文件
- `scripts/browser.sh`：浏览器操作辅助（每次动作重新解析元素索引，避免索引过期）
- 骨架草稿（**待用户确认点子后定稿**）：`.gitignore`、`LICENSE`(MIT)、
  `.kiro/steering/{product,tech,structure}.md`、`.kiro/specs/agent-room/requirements.md`、
  `.kiro/hooks/{test,typecheck}-on-save.json`

## 2026-11-01 21:52 进展
- 点击 Devpost 页面的 “Join hackathon”：
  - 先过 Cloudflare “Verifying you are human”（自动通过，无需人工）。
  - 落到 `kiroween.devpost.com/register?...` → 跳 `secure.devpost.com/users/register?...`
  - 页面：**“Please sign up or log in to continue.” / “Join Devpost to register for Kiroween 2026”**
  - 可选：Sign up with GitHub / Facebook / Google / LinkedIn，或 “Already have an account? Log in”
  - → **H1 交接：等用户登录 Devpost**
- 过程中 Orca 的 AX 一度读不到 Brave 窗口（windows: []）；用
  `osascript -e 'tell application "Brave Browser" to activate'` 恢复。
  已把该重试逻辑写进 scripts/browser.sh。

## 2026-11-01 22:08 进展（第三轮）
- **Kiro CLI 已登录**：`kiro-cli whoami` → `Logged in with Builder ID， Email: oct19@***（见 log/private.md）`
  ⚠️ 与 Kiro Web 的 `nov1@***（见 log/private.md）` **不是同一个账号**。积分表要填"实际用来构建的账号"的 User ID，
  需要用户决定：把 4000 积分给 oct19（CLI 构建）还是 nov1（Web/新账号）。
  另外：kiro-cli 的凭据在 workspace 之外，必须用 full-access 才能调用，
  workspace-write 下会报 `not logged in` 或 `Operation not permitted (os error 1)`。
- **Kiro CLI 审计已跑通**：`kiro-cli chat --no-interactive --model auto --trust-tools=fs_read`
  - 默认模型 `claude-opus-5` 不可用 → 必须用 `--model auto`
  - 输出存 `docs/kiro-cli-audit.log`：R1–R12 逐条 PASS/FAIL + 3 条缺陷
  - 已修 2 条：`speak()` 静默回退（新增 `requirePhrases`）、`scoring.yaml` 接线无证据（补 3 条测试）
  - 测试从 27 → **32 全部通过**；typecheck 通过（新增 @types/node）
- **浏览器状态变化**：Brave 的 Devpost/Kiro/演示 tab 被关掉了（疑似浏览器重启），
  且前台被 **网易UU远程（Windows 远程桌面）** 占据，`screencapture` 截到的是远程桌面画面，
  不是 Brave。→ GUI 截图前必须先 `osascript activate Brave`，并且不要在用户用远程桌面时抢前台。
- Devpost 是否已登录：**未确认**（页面内容节点为空，无法读取）。
