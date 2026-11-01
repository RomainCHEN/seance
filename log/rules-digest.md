# Kiroween 2026 — 官方规则摘录（已核实）

来源：https://kiroween.devpost.com/rules ，抓取于 2026-11-01 21:47 (Asia/Shanghai)。
原文存档：`log/devpost-rules.html` / `log/devpost-rules-clean.txt`。
下面是**原文要点**，不是我的推断。提交前若有冲突，以官方页面为准。

## 时间（Pacific Time）
| 事件 | 时间 |
|---|---|
| 报名期 | 2026-10-13 08:30 – 2026-12-04 14:00 |
| 提交期 | 2026-10-30 09:00 – 2026-12-04 14:00（北京 12-05 06:00） |
| 评审期 | 2026-12-16 13:00 – 2027-01-29 13:00 |
| 公布 | 约 2027-02-03 09:00 |
| 积分申请截止 | 2026-12-01 12:00 |
| 积分兑换截止 | 2026-12-04 |
| 积分过期 | 2026-12-31 23:59 |

## 资格
- 达到居住地法定成年年龄。
- 排除地区（原文列举）：Quebec、Argentina、Australia、Brazil、Indonesia、Italy、Philippines、Russia、Cuba、Iran、North Korea、Syria、Belarus、Crimea、DNR、LNR、United Arab Emirates，以及任何被 OFAC 全面制裁的国家。
- 团队最多 3 人；也可以是组织（Organization）。

## 四个类别（只能选一个）
- **Resurrection**：复活死掉的技术。
- **Frankenstein**：把看似不兼容的技术缝合起来。
- **Skeleton Crew**：做一个足够精简又足够灵活的骨架模板，并用**两个不同的应用**展示它的通用性。
- **Costume Contest**：任意应用，但要有令人难忘的万圣节风格 UI。

## 提交硬性要求（原文）
- 用 Kiro（IDE / CLI / Web / Kiro Crew）构建的**可用软件**；Kiro 用得不够会被判失格。
- **可用的应用 URL**；需要登录的话，把测试账号与说明写进 Devpost 表单的私密字段。
- **文字说明**（features & functionality）。
- **演示视频**：<3 分钟、公开在 YouTube、必须展示应用真实运行、不得含第三方商标/版权音乐。
- **公开 GitHub 仓库**（不能是 GitLab/BitBucket），含全部源码/资源/运行说明。
- **仓库根目录必须有 `/.kiro`**（specs / hooks / steering 等），**绝对不能把 `.kiro` 写进 .gitignore**，否则可能失格。
- 仓库必须有**开源许可证**，且在仓库页 About 区域可见。
- 标明类别与附加奖类别。
- **Skeleton Crew 额外要求**：仓库里必须有 **2 个独立文件夹**放 2 个应用。
- **Kiro 使用说明**（writeup）：要说明用了哪些 Kiro 能力（IDE/CLI/Web/Crew、自定义 agent、hooks、spec 驱动、steering、MCP、PBT、powers），以及与 vibe coding 的对比。

## 评审标准（各 20%）
1. **Potential Impact** — 真实问题、真实受众、是否真的好用。
2. **Technological Implementation** — 对 Kiro 的使用是否深入、是否有策略、是否用了多种 Kiro 能力。
3. **Design** — 完整连贯的产品体验，不只是技术验证。
4. **Innovation/Idea** — 概念是否新颖、是否组合了不寻常的技术/数据。
5. **Presentation** — 视频是否清楚展示端到端可用、是否讲清问题/受众/价值。

## 附加奖（可叠加）
| 附加奖 | 需要提交什么 |
|---|---|
| Best Startup Project | 确认是创始人 + LinkedIn + 公司官网 |
| Best Student Project（每类别） | 类别 + LinkedIn + 学生邮箱 + 年级学位 + 学校；全队都必须是学生 |
| Best Ghost of Kiroween Past | 在表单里确认 2025 年报名过（Devpost 会核验） |
| Best Kiro Crew App | Crew 应用的功能说明 + 公开 GitHub 仓库 URL |
| Best Demo | 无需额外材料，按 Presentation 分评 |
| Blog Post | 提交期内公开发布的第三方博客 URL，文中须写明是为 Kiroween 2026 而写 |
| Social Blitz | 提交期内发布的公开社交帖 URL，**必须以 `#KiroweenHackathon26` 开头**，写最喜欢的 Kiro 点及它如何改变开发方式 |

## 对本次执行的影响
- 部署必须给评委一个**免登录可用**的 URL → 优先 GitHub Pages（公开静态站），评测零门槛。
- 我们的 Kiro 使用说明必须**只写实际发生的事**（本轮已用到：app.kiro.dev 账号、User ID、后续的 specs/hooks/steering 文件、构建日志）。
- 附加奖可叠加：**Startup**（已核实 GitHub 资料显示 Cofounder of MorphMind + morphmind.ai）、**Blog**、**Social**、**Best Demo**、**Best Student**（待用户确认是否在读）。
- 若走 Skeleton Crew（我的推荐），目录必须是 `template/` + `apps/<app1>/` + `apps/<app2>/` 这种两个独立应用文件夹。
