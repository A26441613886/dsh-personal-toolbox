window.__ModuleLoader__.load({
  id: "@local/dsh-personal-intelligence",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    /*COMPAT_PREFERENCES*/
    let react = require("react");
    let react_dom = require("react-dom");
    let react_jsx_runtime = require("react/jsx-runtime");
    let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		/** Local, deterministic supplier capability check mounted beside the composer presets. */
		const INTELLIGENCE_TEST_PROMPT = `你正在参加“供应商能力基线检测”。请完成下面 4 题，并且只输出一行 JSON，不要 Markdown，不要解释。\n\n格式必须是：{"logic":"...","math":0,"instruction":"...","consistency":"..."}\n\n1. 逻辑：A 比 B 高，B 比 C 高。谁最低？只写名字。\n2. 计算：17 × 6 − 8 = ？只写数字。\n3. 指令遵循：把 CAT 倒序，只写结果。\n4. 逻辑边界：所有猫都是动物，部分动物会游泳。能否推出“部分猫会游泳”？只答“能”或“不能”。`;
		const INTELLIGENCE_HISTORY_KEY = "dsh.local.intelligenceTest.v1";
		const INTELLIGENCE_CONFIG_KEY = "dsh.local.intelligenceConfig.v1";
		const INTELLIGENCE_TARGETS_KEY = "dsh.local.intelligenceTargets.v2";
		const INTELLIGENCE_WORKBENCH_HISTORY_KEY = "dsh.local.intelligenceWorkbenchHistory.v2";
		const INTELLIGENCE_PELICAN_PROMPT = "创建一个 HTML，内容是 SVG 绘制一个鹈鹕骑自行车的 2D 动画，不用测试（不要看我源文件里面的东西直接在里面新建一个）";
		const INTELLIGENCE_REASONING_LABELS = { off: "无（不发送思考参数）", low: "低", medium: "中等", high: "高", xhigh: "极高", max: "最大" };
		const INTELLIGENCE_LEGACY_CANDY_PROMPT = `在一个不透明的黑袋子里装有三种口味的糖果：苹果味、桃子味和西瓜味。每种口味的糖果都有两种形状：圆形和五角星形。参赛者摸糖时不能分辨口味，但可以凭手感分辨形状，并据此选择摸取圆形或五角星形糖果。

	袋中各类糖果数量如下：

	圆形：苹果味 7 颗，桃子味 9 颗，西瓜味 8 颗；
	五角星形：苹果味 7 颗，桃子味 6 颗，西瓜味 4 颗。

	问：参赛者在活动前至少要决定摸出多少颗糖，才能保证手中至少有一对糖果，其中一颗是苹果味、另一颗是桃子味，且两颗糖果的形状不同？请给出最少数量和简短证明。正确答案是 21 颗。`;
		const INTELLIGENCE_PREVIOUS_CANDY_PROMPT = `在一个黑色的袋子里放有三种口味的糖果，每种糖果有两种不同的形状（圆形和五角星形，不同的形状靠手感可以分辨）。现已知不同口味的糖和不同形状的数量统计如下表。参赛者需要在活动前决定摸出的糖果数目，那么，最少取出多少个糖果才能保证手中同时拥有不同形状的苹果味和桃子味的糖？（同时手中有圆形苹果味匹配五角星桃子味糖果，或者有圆形桃子味匹配五角星苹果味糖果都满足要求）

| 形状 | 苹果味 | 桃子味 | 西瓜味 |
| --- | --- | --- | --- |
| 圆形 | 7 | 9 | 8 |
| 五角星形 | 7 | 6 | 4 |

请给出推理，最后单独一行写“最终答案：数字”。`;
		const INTELLIGENCE_CANDY_PROMPT = "在一个黑色的袋子里放有三种口味的糖果，每种糖果有两种不同的形状（圆形和五角星形，不同的形状靠手感可以分辨）。现已知不同口味的糖和不同形状的数量统计如下表。参赛者需要在活动前决定摸出的糖果数目，那么，最少取出多少个糖果才能保证手中同时拥有不同形状的苹果味和桃子味的糖？（同时手中有圆形苹果味匹配五角星桃子味糖果，或者有圆形桃子味匹配五角星苹果味糖果都满足要求） 苹果味 桃子味 西瓜味 圆形 7 9 8 五角星形 7 6 4";
		function readIntelligencePrompt() {
			try {
				const value = JSON.parse(localStorage.getItem(INTELLIGENCE_CONFIG_KEY) || "null");
				const prompt = typeof value?.prompt === "string" && value.prompt.trim() ? value.prompt : INTELLIGENCE_CANDY_PROMPT;
				// Only migrate shipped defaults; never overwrite a custom question or its storage.
				return [INTELLIGENCE_TEST_PROMPT, INTELLIGENCE_LEGACY_CANDY_PROMPT, INTELLIGENCE_PREVIOUS_CANDY_PROMPT].some(old => old.replace(/\s+/g, "") === prompt.replace(/\s+/g, "")) ? INTELLIGENCE_CANDY_PROMPT : prompt;
			} catch {
				return INTELLIGENCE_CANDY_PROMPT;
			}
		}
		const intelligenceCss = [
			".dshIt_root{position:relative;display:inline-flex;align-items:center}",
			".dshIt_trigger{box-sizing:border-box;cursor:pointer;height:28px;padding:0 8px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:20px;display:inline-flex;align-items:center;gap:5px}",
			".dshIt_trigger:hover,.dshIt_trigger[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dshIt_trigger:disabled{opacity:.45;cursor:default}",
			".dshIt_panel{z-index:1200;box-sizing:border-box;width:510px;max-width:calc(100vw - 24px);max-height:min(760px,calc(100vh - 24px));overflow:auto;padding:18px;border:.5px solid var(--dsw-alias-border-l1);border-radius:18px;background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-primary);position:fixed}",
			".dshIt_head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}",
			".dshIt_title{font-size:16px;font-weight:600;line-height:24px}",
			".dshIt_subtitle{margin-top:2px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}",
			".dshIt_close{cursor:pointer;width:28px;height:28px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:18px;line-height:26px}",
			".dshIt_close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dshIt_hero{border:.5px solid var(--dsw-alias-border-l2);border-radius:13px;padding:13px 14px;margin-bottom:13px;background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-state-business-primary) 12%,transparent),transparent 70%)}",
			".dshIt_heroTop{display:flex;align-items:center;justify-content:space-between;gap:10px}",
			".dshIt_heroTitle{font-size:14px;font-weight:600;line-height:20px}",
			".dshIt_badge{font-size:11px;color:var(--dsw-alias-state-business-primary);border:.5px solid color-mix(in srgb,var(--dsw-alias-state-business-primary) 45%,transparent);border-radius:999px;padding:2px 7px;white-space:nowrap}",
			".dshIt_hint{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;margin:7px 0 11px}",
			".dshIt_primary,.dshIt_ghost{cursor:pointer;min-height:30px;border-radius:8px;padding:0 11px;font:inherit;font-size:12px}",
			".dshIt_primary{border:none;background:var(--dsw-alias-state-business-primary);color:#fff}",
			".dshIt_primary:hover{filter:brightness(1.08)}",
			".dshIt_ghost{border:.5px solid var(--dsw-alias-border-l4);background:transparent;color:var(--dsw-alias-label-secondary)}",
			".dshIt_ghost:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dshIt_prompt{max-height:150px;overflow:auto;margin:0 0 13px;padding:10px;border-radius:9px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font:12px/18px ui-monospace,SFMono-Regular,Consolas,monospace;white-space:pre-wrap}",
			".dshIt_label{display:block;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;margin:10px 0 5px}",
			".dshIt_input,.dshIt_textarea{box-sizing:border-box;width:100%;border:.5px solid var(--dsw-alias-border-l4);border-radius:9px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);padding:8px 9px;font:inherit;font-size:12px;line-height:18px}",
			".dshIt_input:focus,.dshIt_textarea:focus{outline:none;border-color:var(--dsw-alias-state-business-primary)}",
			".dshIt_textarea{min-height:94px;resize:vertical}",
			".dshIt_actions{display:flex;justify-content:flex-end;gap:8px;margin-top:9px}",
			".dshIt_result{margin-top:14px;border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;padding:12px}",
			".dshIt_resultHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}",
			".dshIt_score{font-size:20px;font-weight:650;line-height:26px}",
			".dshIt_verdict{font-size:12px;padding:3px 8px;border-radius:999px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary)}",
			".dshIt_verdict.good{color:#4ed49b}.dshIt_verdict.warn{color:#f0c36a}.dshIt_verdict.bad{color:#f28c9c}",
			".dshIt_checks{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;margin:0;padding:0;list-style:none}",
			".dshIt_check{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".dshIt_check.ok{color:var(--dsw-alias-label-primary)}",
			".dshIt_history{margin-top:14px;padding-top:12px;border-top:.5px solid var(--dsw-alias-border-l2)}",
			".dshIt_historyTitle{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;margin-bottom:6px}",
			".dshIt_historyRow{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px;padding:3px 0}",
			".dshIt_historyName{color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			".dshIt_details{margin-top:10px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px}",
			".dshIt_details summary{cursor:pointer;color:var(--dsw-alias-label-secondary)}",
			".dshIt_page{box-sizing:border-box;max-width:940px;width:100%;height:100%;margin:0 auto;padding:34px 42px 60px;overflow:auto;color:var(--dsw-alias-label-primary)}",
			".dshIt_pageHead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:24px}",
			".dshIt_page .dshIt_title{font-size:24px;line-height:32px}",
			".dshIt_page .dshIt_subtitle{font-size:13px;line-height:20px}",
			".dshIt_page .dshIt_hero{margin-bottom:18px;padding:18px 20px}",
			".dshIt_page .dshIt_hint{max-width:680px;margin:8px 0 14px;font-size:13px;line-height:20px}",
			".dshIt_promptActions{display:flex;align-items:center;gap:10px}",
			".dshIt_copyHint{color:var(--dsw-alias-label-tertiary);font-size:12px}",
			".dshIt_page .dshIt_prompt{max-height:220px;margin-bottom:18px;padding:14px;border-radius:12px}",
			".dshIt_grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}",
			".dshIt_mode{box-sizing:border-box;height:36px;border:.5px solid var(--dsw-alias-border-l4);border-radius:9px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);display:flex;align-items:center;padding:0 9px;font-size:12px}",
			".dshIt_page .dshIt_textarea{min-height:150px}",
			".dshIt_page .dshIt_result{margin-top:22px;padding:16px}",
			".dshIt_page .dshIt_history{margin-top:22px}",
			"@media (max-width:680px){.dshIt_page{padding:24px 18px 40px}.dshIt_grid{grid-template-columns:minmax(0,1fr)}}",
			".dshIt_statusPage{box-sizing:border-box;max-width:1080px;width:100%;height:100%;margin:0 auto;padding:20px 28px 50px;overflow:auto;scrollbar-width:none;color:var(--dsw-alias-label-primary)}.dshIt_statusPage::-webkit-scrollbar{display:none;width:0;height:0}",
			// Full-column scroll hit area; padding preserves the existing 1024px content width.
			".dshIt_statusPage.dshIw_workbench{max-width:none;margin:0;padding-inline:max(28px,calc((100% - 1024px)/2))}@media(max-width:760px){.dshIt_statusPage.dshIw_workbench{padding:18px 16px 40px}}",
			".dshIt_statusHead{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;border-bottom:.5px solid var(--dsw-alias-border-l2);padding-bottom:18px}",
			".dshIt_statusHead h1{margin:0;font-size:28px;line-height:36px;letter-spacing:0}",
			".dshIt_statusHead p{margin:4px 0 0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}",
			".dshIt_liveDot{display:inline-block;width:7px;height:7px;margin-left:8px;vertical-align:middle;border-radius:50%;background:#4ed49b;box-shadow:0 0 0 4px color-mix(in srgb,#4ed49b 12%,transparent)}",
			".dshIt_statusHeadRight{display:flex;align-items:center;gap:14px;color:var(--dsw-alias-label-tertiary);font-size:12px;padding-top:8px}",
			".dshIt_statusTabs{display:flex;align-items:center;gap:8px;height:54px;border-bottom:.5px solid var(--dsw-alias-border-l2);font-size:13px;color:var(--dsw-alias-label-tertiary)}",
			".dshIt_statusTabs button{height:34px;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;padding:0 10px;cursor:pointer}.dshIt_statusTabs button.active{border-bottom-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary);font-weight:600}",
			".dshIt_statusTabs .dshIt_openFiles{margin-left:auto;flex:none;color:var(--dsw-alias-label-primary)}.dshIt_statusTabs .dshIt_openFiles:disabled{opacity:.5;cursor:default}@media(max-width:760px){.dshIt_statusTabs>span{display:none}}",
			// 消费总览组件挂进页签后，页面在页签栏下方铺满，不再受检测页的 1024px 居中约束。
			".dshIt_statusPage.dshIt_spendingTab{max-width:none;margin:0;padding:0;height:auto;min-height:100%;overflow:visible}.dshIt_statusPage.dshIt_spendingTab .dsh-spending{width:min(100%,1140px)}",
			".dshIt_statusIntro{box-sizing:border-box;display:flex;align-items:center;gap:14px;margin-top:18px;padding:18px 20px;border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;background:linear-gradient(105deg,color-mix(in srgb,var(--dsw-alias-state-business-primary) 12%,transparent),transparent 65%)}",
			".dshIt_statusIntroIcon{width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 12%,transparent);color:var(--dsw-alias-state-business-primary);font-size:22px;flex:none}",
			".dshIt_statusIntro h2,.dshIt_results h2{margin:0;font-size:16px;line-height:24px}.dshIt_statusIntro p{margin:3px 0 0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.dshIt_statusIntro .dshIt_ghost{margin-left:auto;flex:none}",
			".dshIt_introActions{display:flex;align-items:center;gap:8px;margin-left:auto;flex:none}.dshIt_entry{margin-top:12px;padding:16px 18px;border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-2)}.dshIt_entry .dshIt_textarea{min-height:110px}.dshIt_entry .dshIt_actions{margin-top:10px}",
			".dshIt_results{margin-top:28px}.dshIt_resultsHead{display:flex;align-items:center;justify-content:space-between;gap:16px}.dshIt_resultsHead>div:first-child{display:flex;align-items:center;gap:10px}.dshIt_countBadge{color:var(--dsw-alias-label-tertiary);font-size:11px;padding:3px 7px;border-radius:5px;background:var(--dsw-alias-bg-layer-2)}",
			".dshIt_resultsHint{margin:8px 0 14px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.dshIt_legend{display:flex;gap:14px;color:var(--dsw-alias-label-tertiary);font-size:11px}.dshIt_legend span:nth-child(1){color:#4ed49b}.dshIt_legend span:nth-child(2){color:#f5a450}.dshIt_legend span:nth-child(3){color:#ee8c9a}",
			".dshIt_emptyState{padding:30px 20px;border:.5px dashed var(--dsw-alias-border-l3);border-radius:12px;color:var(--dsw-alias-label-tertiary);font-size:13px;text-align:center}",
			".dshIt_cardList{display:flex;flex-direction:column;gap:14px}.dshIt_statusCard{border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-2);overflow:hidden}.dshIt_cardTop{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px 14px}.dshIt_cardIdentity{display:flex;align-items:center;gap:10px;min-width:0}.dshIt_cardIcon{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:9px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-state-business-primary);font-size:17px;flex:none}.dshIt_cardIdentity h3{margin:0;font-size:16px;font-weight:650;line-height:22px}.dshIt_cardIdentity code{display:flex;align-items:center;gap:6px;margin-top:3px;color:var(--dsw-alias-label-primary);font:12px/18px var(--ds-font-family-code,ui-monospace,Consolas,monospace)}.dshIt_provider{color:#329bff;font-weight:650}.dshIt_model{color:var(--dsw-alias-label-primary);font-weight:600}.dshIt_cardVerdict{font-size:11px;border-radius:999px;padding:3px 8px;background:var(--dsw-alias-bg-base)}.dshIt_cardVerdict.good{color:#4ed49b}.dshIt_cardVerdict.warn{color:#f5a450}.dshIt_cardVerdict.bad{color:#ee8c9a}.dshIt_cardVerdict.gray{color:var(--dsw-alias-label-tertiary)}",
			".dshIt_statGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:0 18px 14px}.dshIt_statGrid>div{min-width:0}.dshIt_statGrid span{display:block;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:18px}.dshIt_statGrid strong{display:block;margin-top:3px;color:var(--dsw-alias-label-primary);font:22px/28px var(--ds-font-family-code,ui-monospace,Consolas,monospace)}.dshIt_statGrid small{display:block;color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:16px}",
			".dshIt_bar{display:flex;gap:3px;padding:10px 18px;border-top:.5px solid var(--dsw-alias-border-l2)}.dshIt_bar i{height:22px;min-width:3px;flex:1;border-radius:2px;background:var(--dsw-alias-border-l3);cursor:pointer}.dshIt_bar i.good{background:#4ed49b}.dshIt_bar i.warn{background:#e7c268}.dshIt_bar i.bad{background:#ee8c9a}.dshIt_bar i.gray{background:var(--dsw-alias-border-l3)}.dshIt_cardFoot{display:flex;justify-content:space-between;gap:10px;padding:9px 18px;border-top:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:16px}.dshIt_clear{margin-top:18px;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:11px;cursor:pointer}.dshIt_clear:hover{color:var(--dsw-alias-label-primary)}",
			".dshIw_recordDetail{margin:0 18px 12px;padding:10px 12px;border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-base)}.dshIw_recordDetailHead{display:flex;align-items:center;justify-content:space-between;color:var(--dsw-alias-label-secondary);font-size:11px}.dshIw_recordDetailHead button{border:0;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:11px}.dshIw_recordMeta{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:6px;color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:16px}.dshIw_recordDetail pre{max-height:130px;margin:8px 0 0;overflow:auto;white-space:pre-wrap;color:var(--dsw-alias-label-secondary);font:10px/16px var(--ds-font-family-code,ui-monospace,Consolas,monospace)}",
			"@media (max-width:760px){.dshIt_statusPage{padding:18px 16px 40px}.dshIt_statusHead{flex-direction:column}.dshIt_statusHeadRight{padding-top:0}.dshIt_statusIntro{align-items:flex-start;flex-wrap:wrap}.dshIt_statusIntro .dshIt_ghost{margin-left:58px}.dshIt_legend{display:none}.dshIt_statGrid{grid-template-columns:1fr}}",
			".dshIt_settingsItem{padding:18px 0 20px;border-bottom:.5px solid var(--dsw-alias-border-l2)}.dshIt_settingsHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.dshIt_settingsHead h3{margin:0;font-size:15px;line-height:22px}.dshIt_settingsHead p{margin:3px 0 0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.dshIt_saved{color:#4ed49b;font-size:12px}.dshIt_settingsTextarea{box-sizing:border-box;width:100%;min-height:170px;resize:vertical;border:.5px solid var(--dsw-alias-border-l4);border-radius:9px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);padding:9px;font:12px/18px var(--ds-font-family-code,ui-monospace,Consolas,monospace)}.dshIt_settingsTextarea:focus{outline:none;border-color:var(--dsw-alias-state-business-primary)}.dshIt_settingsFoot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:10px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}"
		].join("");
		const intelligenceTag = "@local/dsh-personal-customizations/intelligence-test.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(intelligenceTag) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@local/dsh-personal-customizations";
			tag.dataset.pluginCss = intelligenceTag;
			tag.textContent = intelligenceCss;
			document.head.appendChild(tag);
		}
		const intelligenceWorkbenchCss = [
".dshIw_zoomHistory{padding:12px 20px 14px;border-top:1px solid var(--dsw-alias-border-l2);flex:none;min-width:0;background:var(--dsw-alias-bg-layer-2)}.dshIw_zoomHistoryHead{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:884px;margin:0 auto 12px}.dshIw_zoomHistoryHead>div{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;min-width:0}.dshIw_zoomHistoryHead strong{font-size:12px;font-weight:600;letter-spacing:.4px}.dshIw_zoomHistoryHead span{font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}.dshIw_zoomHistoryHead .dshIt_ghost{flex:none;font-size:11px;border:0;background:transparent;padding:4px 8px;height:26px;border-radius:6px;color:var(--dsw-alias-label-secondary)}.dshIw_zoomHistoryHead .dshIt_ghost:disabled{opacity:.3}.dshIw_zoomHistoryList{display:flex;gap:12px;max-width:884px;margin:0 auto;overflow-x:auto;padding:3px 4px 4px;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l3) transparent}.dshIw_zoomHistoryItem{box-sizing:border-box;flex:0 0 136px;min-width:0;max-width:136px;padding:0;border:0;background:transparent}.dshIw_zoomHistoryItem:first-child{margin-left:auto}.dshIw_zoomHistoryItem:last-child{margin-right:auto}.dshIw_previewZoomDialog .dshIw_staticThumb{box-sizing:border-box;position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:88px;min-height:88px;max-height:88px;margin:0;padding:0;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);cursor:pointer;overflow:hidden;border-radius:8px;corner-shape:round}.dshIw_zoomHistoryItem.selected .dshIw_staticThumb{border-color:#8fb3ff;box-shadow:0 0 0 2px #6d9bff38}.dshIw_staticThumb:hover{border-color:#8997ab}.dshIw_staticThumb:focus-visible{outline:2px solid #8fb3ff;outline-offset:1px}.dshIw_staticThumbCanvas{position:relative;display:block;flex:none;overflow:hidden;pointer-events:none}.dshIw_staticThumbCanvas iframe{position:absolute;display:block;left:0;top:0;max-width:none;border:0;transform-origin:top left;pointer-events:none}.dshIw_staticThumbHint{font-size:11px;color:var(--dsw-alias-label-tertiary)}.dshIw_historyCaption{display:flex;align-items:center;justify-content:space-between;gap:5px;margin-top:7px;white-space:nowrap;font-size:10px;line-height:14px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-tertiary)}.dshIw_historyCaption>span{font-weight:500;color:var(--dsw-alias-label-secondary)}.dshIw_zoomHistoryItem.selected .dshIw_historyCaption>span{color:#a4c2ff}.dshIw_historyCaption time{font:inherit}.dshIw_zoomHistoryEmpty{margin:8px 0 0;text-align:center;font-size:11px;color:var(--dsw-alias-label-tertiary)}@media(max-width:560px){.dshIw_zoomHistory{padding:10px 12px 12px}.dshIw_zoomHistoryHead{margin-bottom:9px}.dshIw_zoomHistoryHead>div{gap:3px 8px}.dshIw_zoomHistoryHead span{font-size:10px}.dshIw_zoomHistoryList{gap:10px}}",
			".dshIw_testButton{display:inline-flex;flex:none}.dshIw_testButton>button{touch-action:manipulation;user-select:none;-webkit-touch-callout:none}.dshIw_testMenu{box-sizing:border-box;position:fixed;inset:auto;margin:0;padding:6px;border:1px solid var(--dsw-alias-border-l3);border-radius:11px;background:var(--dsw-alias-bg-layer-2,#252629);color:var(--dsw-alias-label-primary,#ededed);box-shadow:0 10px 32px #0006;max-height:calc(100dvh - 16px);overflow:auto}.dshIw_testMenuLabel{display:block;padding:5px 8px 7px;font-size:10px;color:var(--dsw-alias-label-tertiary)}.dshIw_testMenu button{display:block;width:100%;border:0;border-radius:6px;padding:9px;text-align:left;background:transparent;color:inherit;font:inherit;font-size:12px;cursor:pointer}.dshIw_testMenu button:hover,.dshIw_testMenu button:focus-visible{background:var(--dsw-alias-bg-layer-3,#36383d);outline:none;color:var(--dsw-alias-state-business-primary,#6194fb)}",
			".dshIw_toolbar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:18px 0 14px}",
			".dshIw_toolbar h2{margin:0;font-size:16px;line-height:24px}.dshIw_toolbar p{margin:4px 0 0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".dshIw_add{display:inline-flex;align-items:center;gap:6px;flex:none}.dshIw_toolbarRight{display:flex;align-items:center;gap:14px}.dshIw_toolbarRight .dshIt_legend{display:flex;gap:10px}.dshIw_toolbarRight .dshIt_legend span:nth-child(3){color:#ef6b6b}",
			".dshIw_toolbarRight{flex-wrap:wrap;justify-content:flex-end}.dshIw_runAll{height:32px;flex:none;white-space:nowrap;color:var(--dsw-alias-state-business-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 45%,transparent)}.dshIw_runAll:disabled{opacity:.5;cursor:default}",
			".dshIw_form{margin:12px 0 16px;padding:16px 18px;border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-2)}",
			".dshIw_runOptions{display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:10px 18px;border-top:.5px solid var(--dsw-alias-border-l2);font-size:11px;color:var(--dsw-alias-label-secondary);grid-column:1/-1}.dshIw_runOptions label{display:flex;align-items:center;gap:8px}.dshIw_runOptions select{width:auto;max-width:240px;height:30px}.dshIw_runOptions select:disabled{opacity:.6}.dshIt_cardTop{flex-wrap:wrap}.dshIw_cardActions{flex-wrap:wrap}.dshIw_previewEmpty{line-height:1.8;padding:18px;box-sizing:border-box}",
			".dshIw_formGrid{display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:10px}.dshIw_formGrid>div{min-width:0}",
			".dshIw_select{box-sizing:border-box;width:100%;height:36px;border:.5px solid var(--dsw-alias-border-l4);border-radius:9px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);padding:0 9px;font:inherit;font-size:12px}",
			".dshIw_modelStatus{grid-column:1 / -1;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin-top:1px}",
			".dshIw_formFoot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px}.dshIw_formNote{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}.dshIw_formActions{display:flex;align-items:center;gap:8px;flex:none}.dshIw_formActions button:disabled{opacity:.45;cursor:default}",
			".dshIw_cardBody{display:grid;grid-template-columns:minmax(0,1fr) 330px;border-top:.5px solid var(--dsw-alias-border-l2)}",
			".dshIw_cardMain{min-width:0}.dshIw_cardActions{display:flex;align-items:center;gap:6px}.dshIw_cardActions button{height:28px;padding:0 8px;font-size:11px}.dshIw_cardActions button:disabled{opacity:.5;cursor:default}",
			".dshIw_method{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin-top:2px}",
			".dshIt_cardTop{display:grid;grid-template-columns:minmax(220px,1fr) auto auto;align-items:center;gap:16px;padding:16px 18px}",
			".dshIt_cardIdentity{display:flex;align-items:center;gap:12px;min-width:0}.dshIt_cardIdentity>div{min-width:0}.dshIt_cardIdentity h3{margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:17px;font-weight:700;line-height:24px}.dshIt_cardMeta{display:flex;align-items:center;gap:8px;min-width:0;margin-top:3px}.dshIt_cardMeta code{display:flex;align-items:center;gap:6px;min-width:0;margin:0;overflow:hidden;color:var(--dsw-alias-label-primary);font:12px/18px var(--ds-font-family-code,ui-monospace,Consolas,monospace)}.dshIt_cardMeta code span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dshIt_provider{color:#329bff;font-weight:700}.dshIt_model{color:var(--dsw-alias-label-primary);font-weight:650}.dshIw_method{flex:none;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}",
			".dshIt_cardIdentity .dshIt_identityTitle{display:flex;align-items:center;gap:10px;min-width:0;max-width:100%;font-size:18px;line-height:28px}.dshIt_identityTitle .dshIt_provider,.dshIt_identityTitle .dshIt_model{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dshIt_identityTitle .dshIt_provider{max-width:50%;font-weight:700}.dshIt_identityTitle .dshIt_model{font-weight:650}.dshIt_identityDivider{flex:none;color:var(--dsw-alias-label-tertiary);font-weight:400}",
			".dshIt_identityTitle .dshIt_keyName{flex-shrink:0;max-width:30%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:18px;font-weight:400;color:var(--dsw-alias-label-tertiary)}",
			".dshIt_reasoning{display:flex;align-items:center;gap:3px;width:max-content;max-width:100%;padding:3px;border-radius:11px;background:var(--dsw-alias-bg-base)}.dshIt_reasoning button{height:26px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);padding:0 9px;font:inherit;font-size:11px;font-weight:650;cursor:pointer}.dshIt_reasoning button.active{background:#329bff;color:#fff}.dshIt_reasoning button:disabled{opacity:.45;cursor:default}",
			"@media(max-width:980px){.dshIt_cardTop{grid-template-columns:minmax(0,1fr) auto}.dshIt_reasoning{grid-column:1 / -1;overflow-x:auto}}",
			".dshIw_preview{box-sizing:border-box;min-width:0;padding:14px 14px 12px;border-left:.5px solid var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-bg-base) 60%,transparent)}",
			".dshIw_saveOverlay{position:absolute;right:7px;top:7px;z-index:3;display:flex;max-width:calc(100% - 14px);border:1px solid #ffffff30;border-radius:7px;background:rgba(25,29,35,.82);box-shadow:0 2px 8px #0002;backdrop-filter:blur(8px);color:#f4f5f7;font-size:11px;line-height:18px}.dshIw_saveOverlay button,.dshIw_saveOverlay span{display:block;padding:4px 8px;white-space:nowrap}.dshIw_saveOverlay button{border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;cursor:pointer}.dshIw_saveOverlay button:hover{background:#ffffff1c}.dshIw_saveOverlay button:disabled{opacity:.55;cursor:default}.dshIw_saveOverlay button:focus-visible{outline:2px solid #8bb4ff;outline-offset:2px}.dshIw_previewHead strong{white-space:nowrap;flex:none}.dshIw_previewHead span{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:right}",
			".dshIw_previewHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}.dshIw_previewHead strong{font-size:13px;line-height:20px}.dshIw_previewHead span{color:var(--dsw-alias-label-tertiary);font-size:10px}",
			".dshIw_previewSlot{width:100%;min-width:0}.dshIw_previewViewport{position:relative;box-sizing:border-box;margin:0 auto;overflow:hidden;border-radius:8px;background:transparent;border:0}.dshIw_previewViewport:has(.dshIw_previewZoomHotspot){cursor:zoom-in}.dshIw_previewImage{position:absolute;display:block;max-width:none;border:0;background:transparent;transform-origin:top left}.dshIw_previewZoomHotspot{position:absolute;inset:0;z-index:2;width:100%;height:100%;margin:0;padding:0;border:0;background:transparent;cursor:zoom-in}.dshIw_previewZoomHotspot:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}",
			".dshIw_previewEmpty{height:170px;border-radius:8px;border:.5px dashed var(--dsw-alias-border-l3);display:flex;align-items:center;justify-content:center;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px;padding:0 18px}",
			".dshIw_previewText{margin:10px 0 0;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:18px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}",
			".dshIw_candyResult{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;padding:13px 2px 2px;border-top:1px solid var(--dsw-alias-border-l2)}.dshIw_candyResult>div{display:grid;gap:5px;min-width:0}.dshIw_candyResult span{color:var(--dsw-alias-label-secondary);font-size:12px}.dshIw_candyResult small{font-size:10px;line-height:16px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}.dshIw_candyResult strong{font:600 30px/36px var(--ds-font-family-code,ui-monospace,Consolas,monospace);color:var(--dsw-alias-label-tertiary)}.dshIw_candyResult.good strong{color:#4ed49b}.dshIw_candyResult.warn strong{color:#f5a450}",
			".dshIw_entryTitle{display:flex;align-items:center;justify-content:space-between;gap:10px}.dshIw_entryTitle strong{font-size:13px;line-height:20px}.dshIw_entryTitle span{color:var(--dsw-alias-label-tertiary);font-size:11px}",
			".dshIw_timeline{display:flex;flex-direction:column;box-sizing:border-box;min-height:100%;padding:22px 22px 14px}.dshIw_summary{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:26px}.dshIw_passMetric>span{font-size:12px;color:var(--dsw-alias-label-secondary)}.dshIw_passMetric>strong{display:block;margin-top:6px;font-size:34px;line-height:40px;font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-1px}.dshIw_passMetric>strong small{margin-left:3px;font-size:18px;font-weight:450;color:var(--dsw-alias-label-tertiary)}.dshIw_passMetric p{margin:4px 0 0;font-size:11px;color:var(--dsw-alias-label-tertiary)}.dshIw_outcomes{display:flex;gap:22px}.dshIw_outcomes>div{display:grid;gap:7px;min-width:34px}.dshIw_outcomes span{font-size:11px;color:var(--dsw-alias-label-secondary)}.dshIw_outcomes strong{font-size:20px;font-weight:600;font-variant-numeric:tabular-nums}.dshIw_outcomes .good strong{color:#4ed49b}.dshIw_outcomes .warn strong{color:#f5a450}.dshIw_outcomes .bad strong{color:#ef6b6b}.dshIw_timelineHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;font-size:12px;color:var(--dsw-alias-label-secondary)}.dshIw_timeRange{border:1px solid var(--dsw-alias-border-l3);border-radius:7px;padding:4px 7px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px}.dshIw_timeBars{display:flex;gap:4px;height:30px}.dshIw_timeBars button{box-sizing:border-box;flex:1;min-width:0;padding:0;border:0;border-radius:3px;background:var(--dsw-alias-border-l2);cursor:pointer;transition:filter .15s,transform .15s}.dshIw_timeBars button.good{background:#4ed49b}.dshIw_timeBars button.warn{background:#f5a450}.dshIw_timeBars button.bad{background:#ef6b6b}.dshIw_timeBars button:hover{filter:brightness(1.2);transform:translateY(-2px)}.dshIw_timeBars button:focus-visible,.dshIw_timeBars button.selected{outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px}.dshIw_timeAxis{display:flex;justify-content:space-between;margin-top:9px;font-size:10px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-tertiary)}.dshIw_timelineNote{margin:12px 0 18px;font-size:10px;line-height:16px;color:var(--dsw-alias-label-tertiary)}.dshIw_timelineFoot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-top:auto;padding-top:12px;border-top:1px solid var(--dsw-alias-border-l2);font-size:10px;color:var(--dsw-alias-label-tertiary)}.dshIw_timeDetail{margin-bottom:16px;padding:12px;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-base);font-size:12px}.dshIw_timeDetail p{margin:10px 0 6px}.dshIw_timeDetail select{margin-top:10px;max-width:100%}.dshIw_timeDetail pre{max-height:150px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;line-height:17px;color:var(--dsw-alias-label-secondary)}.dshIw_questionResults{padding-left:18px;font-size:11px;line-height:20px}.dshIt_legend span:nth-child(4){color:var(--dsw-alias-label-tertiary)}@media(max-width:760px){.dshIw_timeline{padding:18px 14px 12px}.dshIw_summary{gap:14px}.dshIw_outcomes{gap:12px}.dshIw_timeBars{gap:3px}}",
			".dshIw_modelPicker{position:relative;min-width:0}.dshIw_modelPickerTrigger{box-sizing:border-box;width:100%;height:40px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 12px;border:1px solid var(--dsw-alias-border-l3);border-radius:9px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;text-align:left;cursor:pointer}.dshIw_modelPickerTrigger:hover{border-color:var(--dsw-alias-state-business-primary)}.dshIw_modelPickerTrigger:disabled{opacity:.55;cursor:default}.dshIw_modelPickerTrigger>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dshIw_modelPickerChevron{color:var(--dsw-alias-label-tertiary);font-size:16px;line-height:1}.dshIw_modelPickerMenu{position:fixed;inset:auto;margin:0;box-sizing:border-box;max-height:320px;overflow:auto;overscroll-behavior:contain;padding:7px;border:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 24%,var(--dsw-alias-bg-layer-2));border-radius:13px;corner-shape:round;background:var(--dsw-specific-menu,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary);box-shadow:0 12px 36px #0008,0 2px 8px #0004;scrollbar-width:thin}.dshIw_modelPickerMenu::backdrop{background:transparent}.dshIw_modelPickerOption:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}.dshIw_modelPickerGroupLabel{padding:7px 9px 4px;color:var(--dsw-alias-label-tertiary);font-size:10px;font-weight:650;letter-spacing:.02em}.dshIw_modelPickerOption{display:block;width:100%;padding:8px 9px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;text-align:left;cursor:pointer}.dshIw_modelPickerOption:hover,.dshIw_modelPickerOption[aria-selected=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-state-business-primary)}.dshIw_modelPickerMenu{display:flex;flex-direction:column;padding:0;overflow:hidden}.dshIw_modelPickerSearch{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:8px;flex:none;box-sizing:border-box;margin:0;padding:10px 12px;border:0;border-bottom:1px solid var(--dsw-alias-border-l2);background:#303136;color:var(--dsw-alias-label-tertiary)}.dshIw_modelPickerSearch svg{flex:none}.dshIw_modelPickerSearch input{box-sizing:border-box;width:100%;min-width:0;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;outline:none}.dshIw_modelPickerSearch input::placeholder{color:var(--dsw-alias-label-tertiary)}.dshIw_modelPickerList{min-height:0;overflow:auto;overscroll-behavior:contain;padding:6px;scrollbar-width:thin}.dshIw_modelPickerGroup{padding:2px 0 6px}.dshIw_modelPickerGroupLabel{display:flex;align-items:center;gap:8px;margin:6px 4px 4px;color:var(--dsw-alias-label-tertiary);font-size:10px;font-weight:650;letter-spacing:.08em;text-transform:uppercase}.dshIw_modelPickerGroupLabel::after{content:'';flex:1;height:1px;background:var(--dsw-alias-border-l2)}.dshIw_modelPickerKey{display:flex;align-items:center;gap:7px;margin:7px 6px 3px;padding:0;border:0;color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600;line-height:16px}.dshIw_modelPickerKey i{width:5px;height:5px;flex:none;border-radius:50%;background:#6d9bff}.dshIw_modelPickerKey span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dshIw_modelPickerOption{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:7px 10px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;text-align:left;cursor:pointer}.dshIw_modelPickerKey~.dshIw_modelPickerOption,.dshIw_modelPickerKeys .dshIw_modelPickerOption{padding-left:22px}.dshIw_modelPickerOption:hover,.dshIw_modelPickerOption:focus-visible{background:var(--dsw-alias-interactive-bg-hover);outline:none}.dshIw_modelPickerOption[aria-selected=true]{background:color-mix(in srgb,#6d9bff 16%,transparent);color:#d7e6ff}.dshIw_modelPickerOption small{flex:none;color:var(--dsw-alias-label-tertiary);font-size:11px}.dshIw_modelPickerOption[aria-selected=true] small{color:#8fb3ff}.dshIw_modelPickerEmpty{padding:14px 9px;color:var(--dsw-alias-label-tertiary);font-size:11px}",
			".dshIw_editDialog form{display:grid;gap:16px}.dshIw_editDialog{scroll-padding-top:64px;box-sizing:border-box;width:min(460px,calc(100vw - 32px));max-height:calc(100vh - 48px);overflow:auto;padding:22px;border:1px solid var(--dsw-alias-border-l3);border-radius:16px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);box-shadow:0 20px 80px #0006}.dshIw_editDialog::backdrop{background:#0008}.dshIw_editHead{position:sticky;top:-22px;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 0 12px;background:var(--dsw-alias-bg-layer-2)}.dshIw_editHead h2{margin:0;font-size:18px}.dshIw_editHead button{font-size:20px}.dshIw_editProvider{display:flex;align-items:center;gap:12px;margin:22px 0 18px;font-size:12px;color:var(--dsw-alias-label-secondary)}.dshIw_editProvider strong{font-size:15px;color:#329bff;overflow-wrap:anywhere}.dshIw_editModel{display:grid;gap:8px;font-size:12px}.dshIw_editDialog .dshIw_runOptions{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px;padding:0;border:0}.dshIw_editDialog .dshIw_runOptions label{display:grid;gap:8px;min-width:0}.dshIw_editDialog .dshIw_select{box-sizing:border-box;width:100%;max-width:100%;height:36px}.dshIw_editDialog .dshIw_runOptions>span{grid-column:1/-1;font-size:11px;color:var(--dsw-alias-label-tertiary)}.dshIw_editHint{margin:16px 0;font-size:12px;line-height:19px;color:var(--dsw-alias-label-tertiary)}.dshIw_editFoot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:16px;border-top:1px solid var(--dsw-alias-border-l2)}.dshIw_editFoot>div{display:flex;gap:8px}.dshIw_editDialog button:disabled{opacity:.45;cursor:default}",
			".dshIw_evidenceDialog[open]{display:flex;flex-direction:column;width:min(560px,calc(100vw - 32px));padding:0;overflow:hidden}.dshIw_evidenceDialog .dshIw_editHead{position:static;flex-shrink:0;padding:18px 20px 14px;border-bottom:1px solid var(--dsw-alias-border-l2)}.dshIw_evidenceBody{min-height:0;overflow:auto;padding:16px 20px 20px;overflow-wrap:anywhere;font-size:13px;line-height:1.6}.dshIw_evidenceTarget{margin:0;font-weight:600}.dshIw_evidenceIntro{margin:4px 0 16px;color:var(--dsw-alias-label-secondary)}.dshIw_evidenceCard{padding:14px 16px;margin:12px 0;border:1px solid var(--dsw-alias-border-l3);border-radius:12px}.dshIw_evidenceCardHead{display:flex;align-items:center;justify-content:space-between;gap:12px}.dshIw_evidenceCardHead h3{margin:0;font-size:14px}.dshIw_evidenceCardHead span{font-size:12px;flex-shrink:0;color:var(--dsw-alias-label-secondary)}.dshIw_evidenceSummary{margin:12px 0}.dshIw_evidenceSummary>div{display:grid;grid-template-columns:72px minmax(0,1fr);gap:8px;margin:6px 0}.dshIw_evidenceSummary dt{color:var(--dsw-alias-label-secondary)}.dshIw_evidenceSummary dd{margin:0;font-weight:500}.dshIw_evidenceValue.good{color:#299c74}.dshIw_evidenceValue.warn{color:#bc8129}.dshIw_evidenceValue.bad{color:#dc6262}.dshIw_evidenceValue.muted{color:var(--dsw-alias-label-secondary)}.dshIw_evidenceNext{margin:12px 0 0;padding-top:10px;border-top:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font-size:12px}.dshIw_evidenceNext strong{margin-right:8px;color:var(--dsw-alias-label-primary);font-weight:500}.dshIw_evidenceNote{margin:14px 0;font-size:12px;color:var(--dsw-alias-label-secondary)}.dshIw_evidenceDetails{border-top:1px solid var(--dsw-alias-border-l2);padding-top:12px}.dshIw_evidenceDetails summary{cursor:pointer;color:var(--dsw-alias-label-secondary);font-size:12px}.dshIw_evidenceDetails summary:focus-visible{outline:2px solid #329bff;outline-offset:4px;border-radius:3px}.dshIw_evidenceDetails section{margin-top:16px}.dshIw_evidenceDetails h3{font-size:13px}.dshIw_evidenceDetails dl>div{margin-bottom:10px}.dshIw_evidenceDetails dt{color:var(--dsw-alias-label-secondary);font-size:12px}.dshIw_evidenceDetails dd{margin:2px 0 0;white-space:pre-wrap;font-size:12px}",
			".dshIw_addDialog{width:min(520px,calc(100vw - 32px))}.dshIw_addDialog .dshIw_formGrid{grid-template-columns:minmax(0,1fr);gap:12px;margin-top:16px}.dshIw_addDialog .dshIw_runOptions{margin:4px 0 0}.dshIw_addDialog .dshIw_formFoot{display:grid;grid-template-columns:minmax(0,1fr);justify-content:stretch;justify-items:stretch;box-sizing:border-box;width:100%;min-width:0;gap:16px;margin-top:20px;padding-top:16px;border-top:1px solid var(--dsw-alias-border-l2)}.dshIw_addDialog .dshIw_formActions{display:flex;box-sizing:border-box;width:100%;min-width:0;justify-self:stretch;justify-content:space-between;flex-wrap:wrap;gap:12px}.dshIw_addDialog .dshIw_formCommitActions{margin-left:auto;flex:none;justify-content:flex-end}.dshIw_formCommitActions{display:flex;align-items:center;gap:8px}.dshIw_addDialog .dshIw_formNote{line-height:18px}",
			".dshIw_modelPickerMenu{background:#303136!important;background-color:#303136!important;background-image:none!important;backdrop-filter:none!important}",
			".dshIw_editDialog{isolation:isolate;background:#292a2e!important;background-color:#292a2e!important;background-image:none}.dshIw_editDialog::backdrop{background:#000b}.dshIw_editHead{background:#292a2e!important;background-color:#292a2e!important;background-image:none}",
			".dshIw_toast{position:fixed;right:24px;bottom:24px;z-index:1500;padding:9px 12px;border-radius:9px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-elevation-prominent);font-size:12px}.dshIw_previewZoomDialog{box-sizing:border-box;width:min(1200px,calc(100vw - 36px));height:fit-content;max-width:calc(100vw - 36px);max-height:calc(100vh - 36px);padding:0;border:1px solid var(--dsw-alias-border-l3);border-radius:14px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);box-shadow:0 24px 90px #0008;overflow:hidden}.dshIw_previewZoomDialog::backdrop{background:#0009;backdrop-filter:blur(2px)}.dshIw_previewZoomPanel{display:flex;flex-direction:column;width:100%;min-height:0}.dshIw_previewZoomHead{display:flex;align-items:center;justify-content:space-between;gap:12px;flex:none;padding:12px 14px;border-bottom:1px solid var(--dsw-alias-border-l2)}.dshIw_previewZoomHead strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.dshIw_previewZoomHead button{flex:none;height:28px;padding:0 10px}.dshIw_previewZoomFrame{display:flex;align-items:center;justify-content:center;flex:none;min-height:0;padding:0;background:transparent}.dshIw_previewZoomCanvas{position:relative;flex:none;overflow:hidden;background:transparent}.dshIw_previewZoomCanvas iframe{position:absolute;left:0;top:0;display:block;max-width:none;max-height:none;border:0;background:transparent;transform-origin:top left}",
			".dshIw_bar i.empty{background:var(--dsw-alias-border-l3)}",
			".dshIw_viewSwitch{display:flex;flex:none;gap:3px;padding:3px;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-base)}.dshIw_viewSwitch button{border:0;border-radius:6px;padding:5px 9px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}.dshIw_viewSwitch button[aria-pressed=true]{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-state-business-primary)}.dshIt_statusCard{transition:box-shadow .15s,opacity .15s}.dshIt_statusCard.dragging{opacity:.58}.dshIt_statusCard.drag-over{box-shadow:0 0 0 2px var(--dsw-alias-state-business-primary)}.dshIt_cardTop[draggable=true]{cursor:grab}.dshIt_cardTop[draggable=true]:active{cursor:grabbing}.dshIw_previewMode .dshIt_cardList{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));grid-auto-rows:1fr;align-items:stretch;gap:16px}.dshIw_previewMode .dshIt_cardTop{grid-template-columns:minmax(0,1fr) auto;gap:6px 10px;padding:14px}.dshIw_previewMode .dshIt_cardIdentity{grid-column:1;grid-row:1}.dshIw_previewMode .dshIt_cardVerdict{grid-column:1;grid-row:2;justify-self:start}.dshIw_previewMode .dshIw_cardActions{grid-column:2;grid-row:1 / span 2}.dshIw_previewMode .dshIt_identityTitle{gap:6px;font-size:14px;line-height:22px}.dshIw_previewMode .dshIt_statusCard{display:flex;flex-direction:column;min-width:0}.dshIw_previewMode .dshIw_cardBody{display:flex;flex:1}.dshIw_previewMode .dshIw_preview{border:0;flex:1;display:grid;grid-template-rows:29px 240px minmax(64px,1fr)}.dshIw_previewMode .dshIt_statusCard .dshIw_previewSlot{height:240px;display:flex;align-items:center;justify-content:center}.dshIw_previewMode .dshIw_previewEmpty{height:240px;margin:0;overflow:auto}.dshIw_previewMode .dshIw_previewHead{min-width:0}.dshIw_previewMode .dshIw_cardActions{flex-wrap:nowrap}",
			"@media (max-width:860px){.dshIw_cardBody{grid-template-columns:1fr}.dshIw_preview{border-left:0;border-top:.5px solid var(--dsw-alias-border-l2)}.dshIw_formGrid{grid-template-columns:1fr 1fr}}",
			"@media (max-width:560px){.dshIw_toolbar{align-items:flex-start;flex-direction:column}.dshIw_formGrid{grid-template-columns:1fr}.dshIw_formFoot{align-items:flex-start;flex-direction:column}.dshIw_cardTop{align-items:flex-start;flex-direction:column}.dshIw_cardActions{width:100%}}",
			".dshPd_panel{position:relative;display:grid;gap:16px;box-sizing:border-box;width:100%;margin:4px 0 2px;padding:18px;border:1px solid var(--dsw-alias-border-l3);border-radius:18px;background:radial-gradient(120% 80% at 0% 0%,color-mix(in srgb,#6d8dff 16%,transparent),transparent 42%),linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-bg-layer-2) 86%,#6d8dff 14%),var(--dsw-alias-bg-layer-1));box-shadow:inset 0 1px 0 #ffffff14}",
			".dshPd_head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px}.dshPd_head h3{margin:0;font-size:16px;font-weight:650;line-height:24px;letter-spacing:.2px}.dshPd_head p{margin:4px 0 0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.dshPd_count{flex:none;padding:4px 9px;border:1px solid var(--dsw-alias-border-l3);border-radius:999px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px}",
			".dshPd_grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;width:100%}",
			".dshPd_card{display:grid;grid-template-columns:42px minmax(0,1fr);column-gap:12px;row-gap:4px;align-content:center;min-width:0;padding:14px 15px;border:1px solid var(--dsw-alias-border-l3);border-radius:14px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 78%,transparent);box-shadow:0 10px 24px #00000024}",
			".dshPd_mark{grid-column:1;grid-row:1 / span 2;display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:13px;font-size:18px;line-height:1}.dshPd_mark.blue{background:#6d8dff24;color:#9eb6ff}.dshPd_mark.teal{background:#3dceb624;color:#79ead6}.dshPd_mark.orange{background:#ef835424;color:#ffc09a}.dshPd_mark.violet{background:#b07cff24;color:#d2b6ff}",
			".dshPd_card strong{grid-column:2;grid-row:1;align-self:end;font-size:14px;font-weight:650;line-height:20px}.dshPd_card p{grid-column:2;grid-row:2;margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:19px}",
			".dshPd_note{display:grid;gap:8px;padding:12px 14px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 72%,transparent)}.dshPd_noteHead{display:flex;align-items:center;justify-content:space-between;gap:12px}.dshPd_noteHead strong{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:650}.dshPd_noteHead span{color:var(--dsw-alias-label-tertiary);font-size:11px}.dshPd_layers{display:grid;gap:6px}.dshPd_layer{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:34px}.dshPd_layer b{display:block;color:var(--dsw-alias-label-primary);font-size:12px;font-weight:600;line-height:18px}.dshPd_layer small{display:block;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}.dshPd_switch{position:relative;flex:none;width:34px;height:20px;border:0;border-radius:999px;background:var(--dsw-alias-border-l2);cursor:pointer}.dshPd_switch[aria-pressed=true]{background:#3dceb6}.dshPd_switch i{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .15s ease}.dshPd_switch[aria-pressed=true] i{transform:translateX(14px)}",
			".dshPd_foot{margin:0;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}.dshPd_folder{position:absolute;top:14px;right:14px;height:28px;padding:0 11px;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer}.dshPd_folder:disabled{cursor:default;opacity:.6}",
			".dshPd_panel{gap:20px;padding:24px;background:radial-gradient(ellipse at 100% 0%,color-mix(in srgb,#40c5cb 8%,transparent),transparent 55%),var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l2);box-shadow:none;border-radius:20px;corner-shape:round}.dshPd_head{align-items:center}.dshPd_head h3{font-size:22px;line-height:30px;letter-spacing:-.4px}.dshPd_head p{color:var(--dsw-alias-label-secondary);line-height:20px;max-width:440px}.dshPd_eyebrow{display:block;margin-bottom:8px;color:var(--dsw-alias-label-secondary);font-size:10px;letter-spacing:1.5px;font-weight:600}.dshPd_eyebrow::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;corner-shape:round;background:#31bdbb;margin-right:7px;vertical-align:1px}.dshPd_headActions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}.dshPd_folder{position:static;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;border-radius:10px;padding:0 13px;background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l3);font-size:12px;white-space:nowrap}.dshPd_folder:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l4)}.dshPd_folder:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:3px}.dshPd_grid{gap:12px}.dshPd_card{padding:18px;border-radius:14px;corner-shape:round;border-color:var(--dsw-alias-border-l2);box-shadow:none;background:var(--dsw-alias-bg-layer-2);grid-template-columns:40px minmax(0,1fr);column-gap:14px}.dshPd_card p{font-size:12px;line-height:20px}.dshPd_mark{width:40px;height:40px;border-radius:12px;corner-shape:round}.dshPd_mark svg{display:block;width:24px;height:24px}.dshPd_mark.blue{background:color-mix(in srgb,#5088ed 12%,transparent);color:#5088ed}.dshPd_mark.teal{background:color-mix(in srgb,#16a69d 12%,transparent);color:#16a69d}.dshPd_mark.orange{background:color-mix(in srgb,#d9903d 12%,transparent);color:#d9903d}.dshPd_mark.violet{background:color-mix(in srgb,#9770db 12%,transparent);color:#9770db}.dshPd_compatIntro{display:flex;align-items:center;gap:14px;padding:16px 18px;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;corner-shape:round;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 55%,transparent)}.dshPd_compatIntro>div{flex:1;min-width:0}.dshPd_compatIntro strong{font-size:13px;font-weight:600}.dshPd_compatIntro p{margin:4px 0 0;font-size:12px;line-height:19px;color:var(--dsw-alias-label-tertiary)}.dshPd_compatIntro .dshPd_mark{flex:none}.dshPd_error{margin:0;padding:10px 12px;border-radius:9px;background:#ef6b6b12;color:#ef9696;font-size:12px;line-height:20px;overflow-wrap:anywhere}.dshPd_foot{overflow-wrap:anywhere}",
			".dshPd_note{gap:0;padding:0;border-radius:20px;corner-shape:round;background:var(--dsw-alias-bg-layer-1);overflow:hidden}.dshPd_noteHead{padding:20px 22px;border-bottom:1px solid var(--dsw-alias-border-l2)}.dshPd_noteHead h3{margin:0;font-size:15px;font-weight:600;line-height:23px}.dshPd_noteHead p{margin:4px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}.dshPd_layers{gap:0;padding:0 22px}.dshPd_layer{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:14px;padding:17px 0;min-height:0;border-bottom:1px solid var(--dsw-alias-border-l2)}.dshPd_layer:last-child{border-bottom:0}.dshPd_layerMark{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:11px;background:#8b9aff14;color:#a9b8ff;font-size:18px}.dshPd_layerText b{font-size:13px;line-height:21px}.dshPd_layerText small{font-size:12px;line-height:19px;margin-top:2px}.dshPd_layerControl{display:flex;align-items:center;gap:12px;flex:none}.dshPd_layerState{font-size:11px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}.dshPd_layerState[data-enabled=true]{color:#80cbb8}.dshPd_enabledCount{white-space:nowrap;font-size:11px;color:var(--dsw-alias-label-tertiary)}.dshPd_switch{box-sizing:border-box;width:36px;height:22px;corner-shape:round}.dshPd_switch i{width:18px;height:18px;corner-shape:round}.dshPd_switch[aria-pressed=true]{background:#68bda9}.dshPd_switch:focus-visible{outline:2px solid #9caeff;outline-offset:3px}.dshPd_layerFoot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 22px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 50%,transparent);border-top:1px solid var(--dsw-alias-border-l2)}.dshPd_layerFoot p{margin:0;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px}.dshPd_reload{flex:none;padding:5px 10px;border:1px solid var(--dsw-alias-border-l3);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;cursor:pointer}.dshPd_note>.dshPd_error{margin:12px 22px}",
			"[data-plugin-detail='@local/dsh-personal-customizations'] [data-plugin-rows]{padding:20px 22px;border:1px solid var(--dsw-alias-border-l2);border-radius:16px;background:var(--dsw-alias-bg-layer-1)}[data-plugin-detail='@local/dsh-personal-customizations'] [data-plugin-rows] ul{margin:10px 0 0;padding:0}[data-plugin-detail='@local/dsh-personal-customizations'] [data-plugin-row]{padding:16px 0}[data-plugin-detail='@local/dsh-personal-customizations'] [data-plugin-row] code{display:none}",
			".dshPd_layer{grid-template-columns:40px minmax(0,1fr) auto;gap:16px}.dshPd_layerMark{box-sizing:border-box;width:40px;height:40px;padding:5px;border:1px solid var(--dsw-alias-border-l3);border-radius:12px;background:transparent;color:inherit}.dshPd_iconTile{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;color:#fff}.dshPd_iconTile.blue{background:linear-gradient(135deg,#7eafff,#6a58f0)}.dshPd_iconTile.teal{background:linear-gradient(135deg,#3ccac0,#078ac6)}.dshPd_iconTile.orange{background:linear-gradient(135deg,#ffc05c,#f35b45)}.dshPd_iconTile.violet{background:linear-gradient(135deg,#b593ff,#7765db)}.dshPd_iconTile svg{width:24px;height:24px}.dshPd_layerState{display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:20px;color:var(--dsw-alias-label-secondary);white-space:nowrap}.dshPd_layerState[data-enabled=true]{color:var(--dsw-alias-label-secondary)}",
			"@media(max-width:680px){.dshPd_panel{padding:18px}.dshPd_grid{grid-template-columns:1fr}.dshPd_head{align-items:flex-start;flex-direction:column;gap:12px}.dshPd_headActions{justify-content:flex-start}.dshPd_compatIntro>.dshPd_count{display:none}.dshPd_noteHead{align-items:flex-start;gap:10px;padding:16px}.dshPd_layers{padding:0 16px}.dshPd_layer{gap:10px}.dshPd_layerState{display:none}.dshPd_layerFoot{padding:12px 16px}}",
		".dshIw_previewEmpty.dshIw_previewFailure{flex-direction:column;gap:10px;padding:20px 18px;border:1px solid #ef6b6b66;background:linear-gradient(145deg,#ef6b6b12,transparent);color:#ff9595}.dshIw_failureIcon{display:flex;align-items:center;justify-content:center;width:36px;height:36px;flex:none;border-radius:50%;corner-shape:round;background:#ef6b6b20;color:#ff8b8b;font:700 22px/1 system-ui}.dshIw_previewFailure strong{font-size:15px;line-height:22px;font-weight:650;color:#ff9999}.dshIw_previewFailure p{margin:0;font-size:12px;line-height:20px;color:#d9a8a8;overflow-wrap:anywhere}.dshIw_candyResult.bad strong{color:#ff8585}.dshIw_candyResult.bad small{color:#f29292;font-size:11px}.dshIw_candyResult.bad{border-top-color:#ef6b6b55}",
		".dshIw_workbench:not(.dshIw_previewMode) .dshIt_statusCard .dshIw_preview{display:flex;flex-direction:column;gap:12px}.dshIw_workbench:not(.dshIw_previewMode) .dshIt_statusCard .dshIw_previewHead{flex:none;margin-bottom:0}.dshIw_workbench:not(.dshIw_previewMode) .dshIt_statusCard .dshIw_previewSlot{flex:none}.dshIw_workbench:not(.dshIw_previewMode) .dshIt_statusCard .dshIw_previewEmpty{flex:1 0 auto;height:auto;min-height:170px}.dshIw_workbench:not(.dshIw_previewMode) .dshIt_statusCard .dshIw_candyResult{flex:none;margin-top:auto}",
].join("");
		const intelligenceWorkbenchTag = "@local/dsh-personal-customizations/intelligence-workbench.css";
		if (typeof document !== "undefined") {
			let tag = document.querySelector("style[data-plugin-css=" + JSON.stringify(intelligenceWorkbenchTag) + "]");
			if (tag === null) {
				tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-personal-customizations";
				tag.dataset.pluginCss = intelligenceWorkbenchTag;
				document.head.appendChild(tag);
			}
			tag.textContent = intelligenceWorkbenchCss;
		}
		function readIntelligenceHistory() {
			try {
				const value = JSON.parse(localStorage.getItem(INTELLIGENCE_HISTORY_KEY) || "[]");
				return Array.isArray(value) ? value.slice(0, 6) : [];
			} catch {
				return [];
			}
		}
		function evaluateIntelligenceAnswer(raw) {
			const text = String(raw || "").trim();
			let data;
			try {
				const start = text.indexOf("{");
				const end = text.lastIndexOf("}");
				data = JSON.parse(start >= 0 && end > start ? text.slice(start, end + 1) : text);
			} catch {}
			const checks = [
				["逻辑排序", String(data?.logic ?? "").trim().toUpperCase() === "C"],
				["计算准确", Number(data?.math) === 94],
				["指令遵循", String(data?.instruction ?? "").replace(/\\s/g, "").toUpperCase() === "TAC"],
				["边界判断", String(data?.consistency ?? "").includes("不能")]
			];
			const format = data !== void 0 && data !== null && typeof data === "object" && !Array.isArray(data);
			const score = checks.filter((item) => item[1]).length + (format ? 1 : 0);
			const verdict = score >= 5 ? { label: "稳定", tone: "good" } : score >= 3 ? { label: "建议复测", tone: "warn" } : { label: "疑似降智", tone: "bad" };
			return { score, max: 5, checks, format, verdict };
		}
		function formatIntelligenceTime(value) {
			try { return new Date(value).toLocaleString(); } catch { return ""; }
		}
		function IntelligenceDashboard({ goToConversation }) {
			const [history, setHistory] = react.useState(readIntelligenceHistory);
			const [entryOpen, setEntryOpen] = react.useState(false);
			const [entryLabel, setEntryLabel] = react.useState("当前供应商 / 模型");
			const [entryAnswer, setEntryAnswer] = react.useState("");
			const records = history.reduce((map, item) => {
				const key = item.label || "当前供应商 / 模型";
				const list = map.get(key) || [];
				list.push(item);
				map.set(key, list);
				return map;
			}, new Map());
			const cards = Array.from(records.entries()).map(([label, list]) => {
				const latest = list[0];
				const passRate = Math.round((latest.score / latest.max || latest.score / 5) * 100);
				return { label, latest, passRate, count: list.length, list };
			});
			const clearHistory = () => {
				try { localStorage.removeItem(INTELLIGENCE_HISTORY_KEY); } catch {}
				setHistory([]);
			};
			const recordAnswer = () => {
				const evaluated = evaluateIntelligenceAnswer(entryAnswer);
				const record = { id: Date.now(), label: entryLabel.trim() || "当前供应商 / 模型", score: evaluated.score, verdict: evaluated.verdict.label, at: Date.now() };
				const next = [record, ...history].slice(0, 6);
				try { localStorage.setItem(INTELLIGENCE_HISTORY_KEY, JSON.stringify(next)); } catch {}
				setHistory(next);
				setEntryAnswer("");
				setEntryOpen(false);
			};
			return react_jsx_runtime.jsxs("main", { className: "dshIt_statusPage", children: [
				react_jsx_runtime.jsxs("header", { className: "dshIt_statusHead", children: [react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsxs("h1", { children: ["服务运行状态", react_jsx_runtime.jsx("span", { className: "dshIt_liveDot", "aria-hidden": "true" })] }), react_jsx_runtime.jsx("p", { children: "供应商智力检测与模型表现" })] }), react_jsx_runtime.jsxs("div", { className: "dshIt_statusHeadRight", children: [react_jsx_runtime.jsx("span", { children: "本机记录 · 实时" }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", onClick: goToConversation, children: "返回对话" })] })] }),
				react_jsx_runtime.jsxs("div", { className: "dshIt_statusTabs", children: [react_jsx_runtime.jsx("button", { type: "button", className: "active", children: "智力检测" }), react_jsx_runtime.jsx("span", { children: "固定题 · 独立检测" })] }),
				react_jsx_runtime.jsxs("section", { className: "dshIt_statusIntro", children: [react_jsx_runtime.jsxs("div", { className: "dshIt_statusIntroIcon", children: ["✧"] }), react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("h2", { children: "固定题答复表现" }), react_jsx_runtime.jsx("p", { children: "单项固定逻辑题检测；结果只代表该分组与模型的本题表现，不代表综合能力。" })] }), react_jsx_runtime.jsxs("div", { className: "dshIt_introActions", children: [react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", onClick: () => navigator.clipboard?.writeText(readIntelligencePrompt()), children: "复制固定题" }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_primary", onClick: () => setEntryOpen((value) => !value), children: entryOpen ? "收起录入" : "录入检测结果" })] })] }),
				entryOpen && react_jsx_runtime.jsxs("section", { className: "dshIt_entry", children: [react_jsx_runtime.jsx("label", { className: "dshIt_label", children: "供应商 / 模型名称" }), react_jsx_runtime.jsx("input", { className: "dshIt_input", value: entryLabel, onChange: (event) => setEntryLabel(event.target.value), maxLength: 80 }), react_jsx_runtime.jsx("label", { className: "dshIt_label", children: "粘贴模型原答" }), react_jsx_runtime.jsx("textarea", { className: "dshIt_textarea", value: entryAnswer, onChange: (event) => setEntryAnswer(event.target.value), placeholder: "把对话中模型返回的 JSON 粘贴到这里" }), react_jsx_runtime.jsx("div", { className: "dshIt_actions", children: react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_primary", disabled: !entryAnswer.trim(), onClick: recordAnswer, children: "检查并加入状态" }) })] }),
				react_jsx_runtime.jsxs("section", { className: "dshIt_results", children: [react_jsx_runtime.jsxs("div", { className: "dshIt_resultsHead", children: [react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("h2", { children: "检测结果" }), react_jsx_runtime.jsx("span", { className: "dshIt_countBadge", children: `${cards.length} 个检测目标` })] }), react_jsx_runtime.jsxs("div", { className: "dshIt_legend", children: [react_jsx_runtime.jsx("span", { children: "● 稳定" }), react_jsx_runtime.jsx("span", { children: "● 建议复测" }), react_jsx_runtime.jsx("span", { children: "● 疑似降智" })] })] }), react_jsx_runtime.jsx("p", { className: "dshIt_resultsHint", children: "每个目标独立检测，展示最近一次结果与本机历史记录。" }), cards.length === 0 ? react_jsx_runtime.jsx("div", { className: "dshIt_emptyState", children: "还没有检测记录。先在对话中发送固定题，再回到这里录入结果。" }) : react_jsx_runtime.jsx("div", { className: "dshIt_cardList", children: cards.map((card) => react_jsx_runtime.jsxs("article", { className: "dshIt_statusCard", children: [react_jsx_runtime.jsxs("div", { className: "dshIt_cardTop", children: [react_jsx_runtime.jsxs("div", { className: "dshIt_cardIdentity", children: [react_jsx_runtime.jsx("span", { className: "dshIt_cardIcon", children: "✧" }), react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("h3", { children: card.label }), react_jsx_runtime.jsx("code", { children: "固定题组 · JSON" })] })] }), react_jsx_runtime.jsx("span", { className: "dshIt_cardVerdict " + (card.latest.verdict === "稳定" ? "good" : card.latest.verdict === "疑似降智" ? "bad" : "warn"), children: card.latest.verdict })] }), react_jsx_runtime.jsxs("div", { className: "dshIt_statGrid", children: [react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("span", { children: "固定题通过率" }), react_jsx_runtime.jsx("strong", { children: `${card.passRate}.0%` }), react_jsx_runtime.jsx("small", { children: `${card.latest.score} / 5 次有效答复` })] }), react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("span", { children: "有效答复率" }), react_jsx_runtime.jsx("strong", { children: "100.0%" }), react_jsx_runtime.jsx("small", { children: "最近一次检测" })] }), react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("span", { children: "请求完成率" }), react_jsx_runtime.jsx("strong", { children: "100.0%" }), react_jsx_runtime.jsx("small", { children: `${card.count} 次本机记录` })] })] }), react_jsx_runtime.jsx("div", { className: "dshIt_bar", children: Array.from({ length: 32 }, (_, index) => react_jsx_runtime.jsx("i", { className: index < Math.round(card.passRate / 100 * 32) ? (card.latest.verdict === "稳定" ? "good" : card.latest.verdict === "疑似降智" ? "bad" : "warn") : "empty" }, index)) }), react_jsx_runtime.jsxs("div", { className: "dshIt_cardFoot", children: [react_jsx_runtime.jsxs("span", { children: ["最近检测 · ", formatIntelligenceTime(card.latest.at)] }), react_jsx_runtime.jsx("span", { children: "固定题 · 本地评分" })] })] }, card.label)) })] }),
					history.length > 0 && react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_clear", onClick: clearHistory, children: "清除本机检测记录" })
			] });
		}
		function IntelligenceTestPage({ goToConversation }) {
			return react_jsx_runtime.jsx(IntelligenceDashboard, { goToConversation });
			const [label, setLabel] = react.useState("当前供应商 / 模型");
			const [answer, setAnswer] = react.useState("");
			const [result, setResult] = react.useState(null);
			const [history, setHistory] = react.useState(readIntelligenceHistory);
			const checkAnswer = () => {
				const next = evaluateIntelligenceAnswer(answer);
				const record = { id: Date.now(), label: label.trim() || "当前供应商 / 模型", score: next.score, verdict: next.verdict.label, at: Date.now() };
				const nextHistory = [record, ...history].slice(0, 6);
				try { localStorage.setItem(INTELLIGENCE_HISTORY_KEY, JSON.stringify(nextHistory)); } catch {}
				setResult(next);
			};
			return react_jsx_runtime.jsxs("main", { className: "dshIt_page", children: [
				react_jsx_runtime.jsxs("header", { className: "dshIt_pageHead", children: [react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("div", { className: "dshIt_title", children: "智力检测" }), react_jsx_runtime.jsx("div", { className: "dshIt_subtitle", children: "固定题组 · 供应商能力基线 · 本地记录" })] }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", onClick: goToConversation, children: "返回对话" })] }),
				react_jsx_runtime.jsxs("section", { className: "dshIt_hero", children: [react_jsx_runtime.jsxs("div", { className: "dshIt_heroTop", children: [react_jsx_runtime.jsx("div", { className: "dshIt_heroTitle", children: "标准推理基线" }), react_jsx_runtime.jsx("span", { className: "dshIt_badge", children: "4 题 · 5 分制" })] }), react_jsx_runtime.jsx("div", { className: "dshIt_hint", children: "同一组固定题分别发送给不同供应商，复制模型原答到下方即可比较。题目、评分和历史记录只保存在本机浏览器。" }), react_jsx_runtime.jsxs("div", { className: "dshIt_promptActions", children: [react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_primary", onClick: () => navigator.clipboard?.writeText(INTELLIGENCE_TEST_PROMPT), children: "复制测试提示词" }), react_jsx_runtime.jsx("span", { className: "dshIt_copyHint", children: "复制后到对话中发送" })] })] }),
				react_jsx_runtime.jsx("pre", { className: "dshIt_prompt", children: INTELLIGENCE_TEST_PROMPT }),
				react_jsx_runtime.jsxs("div", { className: "dshIt_grid", children: [react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("label", { className: "dshIt_label", children: "供应商 / 模型名称（用于记录）" }), react_jsx_runtime.jsx("input", { className: "dshIt_input", value: label, onChange: (event) => setLabel(event.target.value), maxLength: 80 })] }), react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("label", { className: "dshIt_label", children: "检测方式" }), react_jsx_runtime.jsx("div", { className: "dshIt_mode", children: "固定题组 · JSON 严格输出" })] })] }),
				react_jsx_runtime.jsx("label", { className: "dshIt_label", children: "粘贴模型原答" }),
				react_jsx_runtime.jsx("textarea", { className: "dshIt_textarea", value: answer, onChange: (event) => setAnswer(event.target.value), placeholder: "把对话中的模型回复粘贴到这里" }),
				react_jsx_runtime.jsx("div", { className: "dshIt_actions", children: react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_primary", disabled: !answer.trim(), onClick: checkAnswer, children: "检查答案并记录" }) }),
				result && react_jsx_runtime.jsxs("section", { className: "dshIt_result", children: [react_jsx_runtime.jsxs("div", { className: "dshIt_resultHead", children: [react_jsx_runtime.jsxs("div", { className: "dshIt_score", children: [result.score, "/", result.max] }), react_jsx_runtime.jsx("span", { className: "dshIt_verdict " + result.verdict.tone, children: result.verdict.label })] }), react_jsx_runtime.jsx("ul", { className: "dshIt_checks", children: [...result.checks, ["JSON 格式", result.format]].map((item) => react_jsx_runtime.jsxs("li", { className: "dshIt_check" + (item[1] ? " ok" : ""), children: [item[1] ? "✓" : "○", item[0]] }, item[0])) })] }),
				history.length > 0 && react_jsx_runtime.jsxs("div", { className: "dshIt_history", children: [react_jsx_runtime.jsx("div", { className: "dshIt_historyTitle", children: "最近检测" }), history.map((item) => react_jsx_runtime.jsxs("div", { className: "dshIt_historyRow", children: [react_jsx_runtime.jsx("span", { className: "dshIt_historyName", title: item.label, children: item.label }), react_jsx_runtime.jsxs("span", { children: [item.score, "/5 · ", item.verdict, " · ", formatIntelligenceTime(item.at)] })] }, item.id))] }),
				react_jsx_runtime.jsx("details", { className: "dshIt_details", children: [react_jsx_runtime.jsx("summary", { children: "评分说明" }), react_jsx_runtime.jsx("div", { children: "5 分为稳定；3–4 分建议换线路复测；0–2 分提示疑似降智。该分数只反映这组固定题的表现，不等同于通用智商。" })] })
			] });
		}
		function readIntelligenceTargets() {
			try {
				const value = JSON.parse(localStorage.getItem(INTELLIGENCE_TARGETS_KEY) || "[]");
				return Array.isArray(value) ? value.filter((item) => item && typeof item.id === "string" && typeof item.name === "string" && ["pelican", "candy", "combined"].includes(item.mode)).map(item => ({ ...item, mode: "combined", reasoningEffort: item.reasoningEffort === "minimal" ? "" : item.reasoningEffort })) : [];
			} catch {
				return [];
			}
		}
		function readIntelligenceWorkbenchHistory() {
			try {
				const value = JSON.parse(localStorage.getItem(INTELLIGENCE_WORKBENCH_HISTORY_KEY) || "[]");
				return Array.isArray(value) ? value.filter((item) => item && typeof item.targetId === "string").map(normalizeIntelligenceRecord).slice(0, 1000) : [];
			} catch {
				return [];
			}
		}
		// A record is one run. Paired tests put both outcomes in questions;
		// unrelated runs in the same time bucket must never become a partial pass.
		function intelligenceResultStatus(record) {
			if (!record) return { tone: "gray", label: "未检测", passed: 0, total: 0 };
			const questions = Array.isArray(record.questions) && record.questions.length ? record.questions : [record];
			const total = questions.length;
			if (record.pending || questions.some(question => question?.pending)) return { tone: "gray", label: "检测中", passed: 0, total };
			const passed = questions.filter(question => question && question.completed !== false && !question.previewFailed && (question.mode === "candy" ? question.answer === 21 : question.passed === true)).length;
			const single = total === 1 && ["candy", "pelican"].includes(record.testMode);
			const label = single ? (record.testMode === "candy" ? "糖果" : "鹈鹕") + (passed ? "通过" : "未通过") : passed === total ? "正常" : passed > 0 ? "半降智" : "降智";
			return { tone: passed === total ? "good" : passed > 0 ? "warn" : "bad", label, passed, total };
		}
		const INTELLIGENCE_TIME_RANGES = {
			day: { label: "24 小时", count: 48, step: 30 * 60000, stepLabel: "30 分钟" },
			week: { label: "7 天", count: 56, step: 3 * 3600000, stepLabel: "3 小时" },
			month: { label: "30 天", count: 60, step: 12 * 3600000, stepLabel: "12 小时" }
		};
		function buildIntelligenceTimeline(records, now, rangeId = "day") {
			const range = INTELLIGENCE_TIME_RANGES[rangeId] || INTELLIGENCE_TIME_RANGES.day;
			const end = Math.floor(now / range.step) * range.step + range.step;
			const start = end - range.count * range.step;
			const slots = Array.from({ length: range.count }, (_, index) => ({ start: start + index * range.step, end: start + (index + 1) * range.step, records: [] }));
			for (const record of records) {
				if (!Number.isFinite(record.at) || record.at < start || record.at >= end || record.at > now) continue;
				slots[Math.floor((record.at - start) / range.step)].records.push(record);
			}
			const counts = { good: 0, warn: 0, bad: 0, gray: 0 };
			for (const slot of slots) {
				slot.records.sort((a, b) => b.at - a.at);
				slot.latest = slot.records[0] || null;
				slot.status = intelligenceResultStatus(slot.latest);
				for (const record of slot.records) counts[intelligenceResultStatus(record).tone]++;
			}
			const total = counts.good + counts.warn + counts.bad;
			return { range, start, end, slots, counts, total, passRate: total ? Math.round(counts.good / total * 100) : null };
		}
		function formatIntelligenceAxisTime(at, withDate = false) {
			const date = new Date(at);
			const clock = date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
			return withDate ? `${date.getMonth() + 1}/${date.getDate()} ${clock}` : clock;
		}
		function IntelligenceTimeline({ records, now, targetId, progress }) {
			const [rangeId, setRangeId] = react.useState("day");
			const [selectedStart, setSelectedStart] = react.useState(null);
			const [recordId, setRecordId] = react.useState(null);
			const timeline = buildIntelligenceTimeline(records, now, rangeId);
			const selectedSlot = timeline.slots.find(slot => slot.start === selectedStart);
			const selected = selectedSlot?.records.find(record => record.id === recordId) || selectedSlot?.latest;
			const latest = records[0];
			return react_jsx_runtime.jsxs("section", { className: "dshIw_timeline", "aria-label": "检测时间线", children: [
				react_jsx_runtime.jsxs("div", { className: "dshIw_summary", children: [
					react_jsx_runtime.jsxs("div", { className: "dshIw_passMetric", children: [react_jsx_runtime.jsx("span", { children: "全部通过率" }), react_jsx_runtime.jsxs("strong", { children: [timeline.passRate === null ? "—" : timeline.passRate, timeline.passRate !== null && react_jsx_runtime.jsx("small", { children: "%" })] }), react_jsx_runtime.jsx("p", { children: timeline.total ? `${timeline.counts.good} / ${timeline.total} 次检测全部通过` : "此时段暂无检测" })] }),
					react_jsx_runtime.jsx("div", { className: "dshIw_outcomes", children: [["good", "正常"], ["warn", "半降智"], ["bad", "降智"]].map(([tone, label]) => react_jsx_runtime.jsxs("div", { className: tone, children: [react_jsx_runtime.jsx("span", { children: label }), react_jsx_runtime.jsx("strong", { children: timeline.counts[tone] })] }, tone)) })
				] }),
				react_jsx_runtime.jsxs("div", { className: "dshIw_timelineHead", children: [react_jsx_runtime.jsx("span", { children: "检测时间线" }), react_jsx_runtime.jsx("select", { className: "dshIw_timeRange", "aria-label": "时间范围", value: rangeId, onChange: event => { setRangeId(event.target.value); setSelectedStart(null); setRecordId(null); }, children: Object.entries(INTELLIGENCE_TIME_RANGES).map(([key, range]) => react_jsx_runtime.jsx("option", { value: key, children: `最近 ${range.label}` }, key)) })] }),
				react_jsx_runtime.jsx("div", { className: "dshIw_timeBars", children: timeline.slots.map(slot => {
					const description = `${formatIntelligenceAxisTime(slot.start, true)} – ${formatIntelligenceAxisTime(slot.end, true)} · ${slot.status.label}${slot.latest ? ` · ${slot.records.length} 次检测，以最后一次为准` : ""}`;
					return react_jsx_runtime.jsx("button", { type: "button", className: slot.status.tone + (slot.start === selectedStart ? " selected" : ""), title: description, "aria-label": description, "aria-pressed": slot.start === selectedStart, "data-start": slot.start, onClick: () => { setSelectedStart(slot.start === selectedStart ? null : slot.start); setRecordId(null); } }, `${targetId}-${slot.start}`);
				}) }),
				react_jsx_runtime.jsxs("div", { className: "dshIw_timeAxis", children: [react_jsx_runtime.jsx("span", { children: formatIntelligenceAxisTime(timeline.start, true) }), react_jsx_runtime.jsx("span", { children: formatIntelligenceAxisTime(timeline.start + (timeline.end - timeline.start) / 2, rangeId !== "day") }), react_jsx_runtime.jsx("span", { children: "现在" })] }),
				react_jsx_runtime.jsx("p", { className: "dshIw_timelineNote", children: `每格 ${timeline.range.stepLabel} · 灰色为未检测 · 同格显示最后一次结果` }),
				selectedSlot && react_jsx_runtime.jsxs("div", { className: "dshIw_timeDetail", children: [
					react_jsx_runtime.jsxs("div", { className: "dshIw_recordDetailHead", children: [react_jsx_runtime.jsx("strong", { children: `${formatIntelligenceAxisTime(selectedSlot.start, true)} – ${formatIntelligenceAxisTime(selectedSlot.end, true)}` }), react_jsx_runtime.jsx("button", { type: "button", onClick: () => setSelectedStart(null), children: "关闭" })] }),
					!selected ? react_jsx_runtime.jsx("p", { children: "此时段未进行检测" }) : react_jsx_runtime.jsxs(react.Fragment, { children: [
						selectedSlot.records.length > 1 && react_jsx_runtime.jsx("select", { className: "dshIw_select", "aria-label": "时段内检测记录", value: selected.id, onChange: event => setRecordId(event.target.value), children: selectedSlot.records.map(record => react_jsx_runtime.jsx("option", { value: record.id, children: `${formatIntelligenceTime(record.at)} · ${intelligenceResultStatus(record).label}` }, record.id)) }),
						react_jsx_runtime.jsx("p", { children: `${intelligenceResultStatus(selected).label} · ${intelligenceResultStatus(selected).passed} / ${intelligenceResultStatus(selected).total} 题通过` }),
						react_jsx_runtime.jsxs("div", { className: "dshIw_recordMeta", children: [react_jsx_runtime.jsx("span", { children: `检测时间：${formatIntelligenceTime(selected.at)}` }), react_jsx_runtime.jsx("span", { children: `耗时：${selected.elapsedMs == null ? "未记录" : Math.round(selected.elapsedMs / 1000) + " 秒"} · 思考：${INTELLIGENCE_REASONING_LABELS[selected.reasoningEffort] || "模型默认"}` }), selected.answer != null && react_jsx_runtime.jsx("span", { children: `答案：${selected.answer}` })] }),
						Array.isArray(selected.questions) && react_jsx_runtime.jsx("ul", { className: "dshIw_questionResults", children: selected.questions.map((question, index) => react_jsx_runtime.jsx("li", { children: `${question.name || (question.mode === "candy" ? "糖果推理" : question.mode === "pelican" ? "鹈鹕 SVG" : `问题 ${index + 1}`)}：${intelligenceResultStatus(question).label}${question.answer != null ? ` · 答案 ${question.answer}` : ""}` }, index)) }),
						react_jsx_runtime.jsx("pre", { children: [selected.raw || selected.verdict || "", selected.partialRaw ? "\n未完成的正文：\n" + selected.partialRaw : ""].join("") })
					] })
				] }),
				react_jsx_runtime.jsxs("div", { className: "dshIw_timelineFoot", children: [react_jsx_runtime.jsx("span", { children: progress ? intelligenceProgressLabel(progress) : latest ? `最近检测 ${formatIntelligenceAxisTime(latest.at, true)}` : "等待首次检测" }), react_jsx_runtime.jsx("span", { children: "时间轴自动更新" })] })
			] });
		}
		function normalizeIntelligenceRecord(item) {
			if (Array.isArray(item?.questions) && item.questions.length) {
				const questions = item.questions.map(normalizeIntelligenceRecord);
				const status = intelligenceResultStatus({ ...item, questions });
				return { ...item, questions, preview: questions.find(q => q.mode === "pelican")?.preview || "", answer: questions.find(q => q.mode === "candy")?.answer ?? null, score: status.passed, max: status.total, tone: status.tone, verdict: status.label, passed: status.tone === "good", valid: questions.some(q => q.valid), grade: status.tone };
			}
			if (item?.completed === false) return { ...item, valid: false, passed: false, tone: "bad", verdict: item.verdict || "请求失败", grade: "red" };
			if (item?.mode === "pelican") {
				if (item.previewFailed) return { ...item, preview: "", valid: false, passed: false, score: 0, tone: "bad", grade: "red", verdict: "预览加载失败" };
				const evaluated = evaluateIntelligencePelican(item.raw || item.preview || "");
				return { ...item, preview: evaluated.preview, previewError: evaluated.previewError, valid: evaluated.valid, passed: evaluated.passed, score: evaluated.score, tone: evaluated.verdict.tone, grade: evaluated.verdict.grade, verdict: evaluated.verdict.label };
			}
			if (item?.mode === "candy") {
				const raw = typeof item.raw === "string" && item.raw.trim() ? item.raw : (Array.isArray(item.responseBlocks) ? item.responseBlocks : []).filter(block => block.type === "text").map(block => block.text || "").join("");
				if (raw.trim()) {
					const evaluated = evaluateIntelligenceCandy(raw);
					return { ...item, answer: evaluated.answer, valid: evaluated.valid, passed: evaluated.passed, score: evaluated.score, max: evaluated.max, tone: evaluated.verdict.tone, grade: evaluated.verdict.grade, verdict: evaluated.verdict.label };
				}
			}
			if (item?.mode !== "candy" || item.answer === null || item.answer === void 0) return item;
			if (item.answer === 21) return { ...item, valid: true, passed: true, tone: "good", verdict: "固定题通过", grade: "green" };
			if (item.answer === 29) return { ...item, valid: true, passed: false, tone: "bad", verdict: "答复为 29", grade: "red" };
			return { ...item, valid: true, passed: false, tone: "bad", verdict: "其他有效答复", grade: "red" };
		}
		function updateIntelligenceTargets(change) {
			return new Promise((resolve, reject) => {
				const request = indexedDB.open("dsh.local.intelligenceTargets.v1", 1);
				request.onupgradeneeded = () => request.result.createObjectStore("targets");
				request.onerror = () => reject(request.error || new Error("检测目标数据库不可用"));
				request.onblocked = () => reject(new Error("检测目标数据库被其他窗口占用"));
				request.onsuccess = () => {
					const db = request.result;
					db.onversionchange = () => db.close();
					let next;
					try {
						const transaction = db.transaction("targets", "readwrite");
						const store = transaction.objectStore("targets");
						const get = store.get("list");
						get.onsuccess = () => {
							try {
								const raw = get.result === void 0 ? localStorage.getItem(INTELLIGENCE_TARGETS_KEY) : null;
								const stored = get.result === void 0 ? (raw === null ? [] : JSON.parse(raw)) : get.result;
								if (!Array.isArray(stored) || stored.some(item => !item || typeof item.id !== "string" || typeof item.name !== "string" || !["pelican", "candy", "combined"].includes(item.mode))) throw new Error("检测目标名单格式异常，已停止覆盖原数据");
								next = change ? change(stored) : stored;
								if (!Array.isArray(next)) throw new Error("检测目标更新失败");
								if (change || get.result === void 0) store.put(next, "list");
							} catch (error) { transaction.abort(); reject(error); }
						};
						transaction.oncomplete = () => { db.close(); resolve(next); };
						transaction.onabort = () => { db.close(); reject(transaction.error || new Error("检测目标保存失败")); };
					} catch (error) { db.close(); reject(error); }
				};
			});
		}
		function writeIntelligenceWorkbenchHistory(value) {
			try { localStorage.setItem(INTELLIGENCE_WORKBENCH_HISTORY_KEY, JSON.stringify(value.slice(0, 1000))); return true; } catch { return false; }
		}
		// Large replies belong in IndexedDB, not the small synchronous localStorage quota.
		// Keep the legacy key intact as a migration backup, including after a failed transaction.
		function intelligenceHistoryDatabase(mode, value) {
			return new Promise((resolve, reject) => {
				const request = indexedDB.open('dsh.local.intelligenceHistory.v1', 1);
				let settled = false;
				const fail = error => { settled = true; reject(error || new Error('检测记录数据库不可用')); };
				request.onupgradeneeded = () => request.result.createObjectStore('history');
				request.onerror = () => fail(request.error);
				request.onblocked = () => fail(new Error('检测记录数据库被其他窗口占用'));
				request.onsuccess = () => {
					const db = request.result;
					if (settled) { db.close(); return; }
					db.onversionchange = () => db.close();
					try {
						const transaction = db.transaction('history', mode);
						const store = transaction.objectStore('history');
						const operation = mode === 'readonly' ? store.get('records') : store.put(value, 'records');
						transaction.oncomplete = () => { db.close(); settled = true; resolve(operation.result); };
						transaction.onabort = () => { db.close(); fail(transaction.error || operation.error); };
					} catch (error) { db.close(); fail(error); }
				};
			});
		}
		function intelligenceModelKey(providerId, modelId) {
			return `${providerId}\u0000${modelId}`;
		}
		function intelligenceReasoningChoices(model) {
			const declared = Array.isArray(model?.reasoning?.efforts) ? model.reasoning.efforts.filter((effort) => effort && typeof effort.id === "string" && effort.id !== "minimal") : [];
			const byId = new Map(declared.map((effort) => [effort.id, effort]));
			byId.set("off", { id: "off", name: INTELLIGENCE_REASONING_LABELS.off });
			const defaultEffort = model?.reasoning?.defaultEffort === "minimal" ? void 0 : model?.reasoning?.defaultEffort;
			return [{ id: "", name: `模型默认${defaultEffort ? `（${INTELLIGENCE_REASONING_LABELS[defaultEffort] || defaultEffort}）` : ""}` }, ...byId.values()].map((effort) => ({ ...effort, name: INTELLIGENCE_REASONING_LABELS[effort.id] || effort.name }));
		}
		function IntelligenceRunOptions({ value, model, disabled, onChange }) {
			const choices = intelligenceReasoningChoices(model);
			if (value.reasoningEffort && value.reasoningEffort !== "minimal" && !choices.some(item => item.id === value.reasoningEffort)) choices.push({ id: value.reasoningEffort, name: `${value.reasoningEffort}（已保存，请确认支持）` });
			return react_jsx_runtime.jsxs("div", { className: "dshIw_runOptions", children: [
				react_jsx_runtime.jsxs("label", { children: ["思考强度", react_jsx_runtime.jsx(IntelligenceModelPicker, { value: value.reasoningEffort || "", disabled, placeholder: "模型默认", groups: [{ label: "思考强度", items: choices.map(effort => ({ value: effort.id, label: effort.name })) }], onChange: reasoningEffort => onChange({ reasoningEffort }), ariaLabel: "思考强度" })] }),
				react_jsx_runtime.jsxs("label", { children: ["总等待时限", react_jsx_runtime.jsx(IntelligenceModelPicker, { value: String(value.timeoutMinutes || 10), disabled, placeholder: "10 分钟", groups: [{ label: "总等待时限", items: [3, 5, 10, 20, 30].map(minutes => ({ value: String(minutes), label: `${minutes} 分钟` })) }], onChange: timeoutMinutes => onChange({ timeoutMinutes: Number(timeoutMinutes) }), ariaLabel: "总等待时限" })] }),
				react_jsx_runtime.jsx("span", { children: "按原始提示词请求 · 保留上游答复" })
			] });
		}
		function intelligenceProgressLabel(progress) {
			if (!progress) return "正在发送请求…";
			const seconds = Math.max(0, Math.floor((Date.now() - progress.startedAt) / 1000));
			const retry = progress.retrying ? `等待自动重试 ${Math.min((progress.retryCount || 0) + 1, 3)}/3` : progress.retryCount ? `正在重试 ${progress.retryCount}/3` : "";
			const stage = progress.textChars ? `正在生成正文 · ${progress.textChars} 字` : progress.reasoningChars ? `正在思考 · ${progress.reasoningChars} 字` : "等待供应商响应";
			return `${retry ? retry + " · " : ""}${progress.retrying ? "已保留上次未完成内容" : stage} · 已等待 ${seconds} 秒 / ${progress.timeoutMinutes} 分钟`;
		}
		function resolveIntelligenceTargetDisplay(target, modelOptions) {
			const match = modelOptions.find((item) => item.providerId === target.providerId && item.modelId === target.modelId);
			if (match) return { name: match.modelName, provider: match.providerName, model: match.modelName };
			return {
				name: target.name || target.model || "未命名模型",
				provider: target.provider || "已保存模型",
				model: target.model || target.name || "未知模型"
			};
		}
		function intelligenceProviderProfile(providerId, namespaces) {
			const official = providerId === "deepseek-official";
			const section = namespaces.find(item => item.ns === (official ? "llm-deepseek" : "llm-pi-ai"))?.value;
			return official ? section : section?.providers?.[providerId];
		}
		function intelligenceTargetKeyName(target, namespaces) {
			const profile = intelligenceProviderProfile(target.providerId, namespaces);
			if (!profile) return "";
			const keys = Array.isArray(profile.apiKeys) ? profile.apiKeys : [];
			const model = Array.isArray(profile.models) && profile.models.length ? profile.models.find(item => item.id === target.modelId) : profile.modelOverrides?.[target.modelId];
			const selected = keys.find(item => item.id === model?.apiKey) || keys.find(item => item.id === profile.activeApiKey) || keys[0];
			return selected ? selected.name || "未命名密钥" : "默认密钥";
		}
		// 添加检测模型的三级目录：供应商、该供应商的命名密钥、密钥下的模型。
		// 只按模型 id 精确匹配，同一上游模型的两个别名仍分属各自的密钥。
		function intelligenceCatalogGroups(groups, namespaces) {
			return groups.map(group => {
				const profile = intelligenceProviderProfile(group.id, namespaces);
				const keys = Array.isArray(profile?.apiKeys) ? profile.apiKeys : [];
				const entries = Array.isArray(profile?.models) ? profile.models : [];
				const fallback = keys.find(key => key.id === profile?.activeApiKey)?.id ?? keys[0]?.id;
				const buckets = new Map(keys.map(key => [key.id, { label: key.name || "未命名密钥", items: [] }]));
				for (const model of Array.isArray(group.models) ? group.models : []) {
					if (!model || typeof model.id !== "string") continue;
					const configured = entries.find(entry => entry.id === model.id) ?? profile?.modelOverrides?.[model.id];
					const keyId = configured?.apiKey ?? fallback;
					if (keyId && !buckets.has(keyId)) buckets.set(keyId, { label: "已失效密钥", items: [] });
					const item = { value: intelligenceModelKey(group.id, model.id), label: model.name || model.id };
					const bucket = (keyId && buckets.get(keyId)) || buckets.get("");
					if (bucket) bucket.items.push(item);
					else buckets.set("", { label: "默认密钥", items: [item] });
				}
				const grouped = [...buckets.values()].filter(bucket => bucket.items.length);
				return { label: group.name || group.id, keys: grouped.length ? grouped : undefined, items: grouped.length ? [] : (Array.isArray(group.models) ? group.models : []).filter(model => model && typeof model.id === "string").map(model => ({ value: intelligenceModelKey(group.id, model.id), label: model.name || model.id })) };
			}).filter(group => (group.keys || []).length || group.items.length);
		}
		function getIntelligencePrompt(mode) {
			if (mode === "pelican") return INTELLIGENCE_PELICAN_PROMPT;
			const configured = readIntelligencePrompt();
			return configured === INTELLIGENCE_TEST_PROMPT ? INTELLIGENCE_CANDY_PROMPT : configured;
		}
        // Keep the reply intact. Only locate its HTML/SVG document for an isolated preview.
        function prepareIntelligenceSvg(raw) {
            const text = String(raw || "");
            const fenced = [...text.matchAll(/```(?:html|svg|xml)?[ \t]*\r?\n([\s\S]*?)```/gi)].find(match => /<(?:html|svg|!doctype)\b/i.test(match[1]));
            const candidate = fenced ? fenced[1] : text;
            const htmlStart = candidate.search(/<!doctype\s+html\b|<html\b/i);
            if (htmlStart >= 0) {
                const end = candidate.toLowerCase().lastIndexOf("</html>");
                return { svg: candidate.slice(htmlStart, end >= htmlStart ? end + 7 : undefined), error: "" };
            }
            if (/<svg\b/i.test(candidate)) {
                // Preserve surrounding styles and scripts, including HTML fragments.
                return { svg: candidate, error: "" };
            }
            return { svg: "", error: "未返回可预览的 HTML / SVG，原始答复已保留" };
        }
        function extractIntelligenceSvg(raw) {
            return prepareIntelligenceSvg(raw).svg;
        }
		function evaluateIntelligenceCandy(raw) {
			// Work on a parsing copy only; retain the original reply in history and exports.
			let text = String(raw || "").normalize("NFKC").replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/\*{2,}|[`#]/g, "").replace(/(^|[^\d])\*([^*\n]+)\*(?!\d)/g, "$1$2");
			for (let i = 0; i < 3; i++) text = text.replace(/\\(?:text|mathrm|mathbf|textbf|operatorname)\s*\{([^{}]*)\}/g, "$1");
			text = text.replace(/\\(?:boxed|fbox)\s*\{([^{}]*)\}/g, "【$1】").replace(/\\[,;! ]|\$|\\[()[\]]/g, "");
			// Use a stated right-hand result, never calculate an unstated answer ourselves.
			text = text.replace(/\b\d+(?:\s*[+×*]\s*\d+)+\s*=\s*(\d+)\b/g, "$1").trim();
			const numeral = "(?:\\d+|[零〇一二两三四五六七八九十百]+)";
			const number = value => {
				if (/^\d+$/.test(value)) return Number(value);
				const digits = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
				if (!/[十百]/.test(value)) return Number([...value].map(char => digits[char]).join(""));
				let total = 0, digit = 0;
				for (const char of value) { if (char === "十" || char === "百") { total += (digit || 1) * (char === "十" ? 10 : 100); digit = 0; } else digit = digits[char]; }
				return total + digit;
			};
			const candidates = [];
			const collect = (pattern, priority) => {
				for (const match of text.matchAll(pattern)) {
					const tail = text.slice(match.index + match[0].length, match.index + match[0].length + 45);
					const prefix = text.slice(Math.max(0, match.index - 20), match.index);
					// Do not mistake alternatives, a range, a decimal or a rejected hypothesis for a conclusion.
					if (/^\s*(?:[颗个粒枚]|candies)?\s*(?:糖果)?\s*(?:[或至到/～~+*×=]|-\s*\d|\.\d|不能|无法|不够|并不|不对|是错误)/i.test(tail) || /(?:如果|假设|假定|比如|例如|并非|不是|并不需要|不需要)\s*$/.test(prefix)) continue;
					const answer = number(match[1]);
					if (Number.isSafeInteger(answer)) candidates.push({ answer, priority, index: match.index });
				}
			};
			const filler = "(?:(?:是|为|应当|应该|需要|必须|至少|最少|只需|应|要|取出|摸出|抽取|抽出|拿出|取|摸|抽|的|糖果|数量|数目|颗数|个数|总共|一共|共|is|are)|[\\s:：=,，\\[\\]【】{}\"'：]){0,18}";
			collect(new RegExp("(?:最终答案|最终结果|final\\s+answer)" + filler + "(" + numeral + ")(?![\\d十百])", "gi"), 5);
			collect(new RegExp("(?:答案|结论|answer|final_answer)" + filler + "(" + numeral + ")(?![\\d十百])", "gi"), 4);
			collect(new RegExp("【\\s*(" + numeral + ")\\s*(?:颗|个|粒|枚)?\\s*】", "g"), 4);
			collect(new RegExp("(?:最少|至少|只需|最小数量|minimum)" + filler + "(" + numeral + ")(?![\\d十百])\\s*(?:颗|个|粒|枚|candies)?", "gi"), 3);
			collect(new RegExp("(?:需要|应当|应该|必须)" + filler + "(" + numeral + ")\\s*(?:颗|个|粒|枚|candies)", "gi"), 2);
			const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
			const bare = new RegExp("^[\\s【】{}\\[\\]]*(" + numeral + ")[\\s【】{}\\[\\]]*(?:颗|个|粒|枚|candies)?(?:糖果)?[。.!！]?$");
			for (const line of [lines[0], lines.at(-1)]) {
				const match = line?.match(bare);
				if (match && !(lines.length > 1 && /^\d+\.$/.test(line)) && Number.isSafeInteger(number(match[1]))) candidates.push({ answer: number(match[1]), priority: 1, index: text.lastIndexOf(line) });
			}
			candidates.sort((a, b) => a.priority - b.priority || a.index - b.index);
			const answer = candidates.at(-1)?.answer ?? null;
			const valid = answer !== null;
			const passed = answer === 21;
			const verdict = answer === 21 ? { label: "固定题通过", tone: "good", grade: "green" } : answer === 29 ? { label: "答复为 29", tone: "bad", grade: "red" } : answer !== null ? { label: "其他有效答复", tone: "bad", grade: "red" } : { label: "无有效答复", tone: "bad", grade: "red" };
			return {
				mode: "candy",
				score: passed ? 1 : 0,
				max: 1,
				valid,
				passed,
				answer,
				preview: "",
				verdict
			};
		}
		function evaluateIntelligencePelican(raw) {
			const prepared = prepareIntelligenceSvg(raw);
			const svg = prepared.svg;
			const passed = svg.length > 0;
			const valid = passed;
			return {
				mode: "pelican",
				score: passed ? 1 : 0,
				max: 1,
				valid,
				passed,
				answer: null,
				preview: svg,
				previewError: prepared.error,
				verdict: passed ? { label: "已返回 HTML / SVG", tone: "good", grade: "green" } : { label: "未返回 HTML / SVG", tone: "bad", grade: "red" }
			};
		}
		function evaluateIntelligenceWorkbench(mode, raw) {
			return mode === "pelican" ? evaluateIntelligencePelican(raw) : evaluateIntelligenceCandy(raw);
		}
		function intelligenceFreshnessEvidence(result, previous, mode) {
			const bodyOf = q => q.code === 'UPSTREAM_RESPONSE_REUSED' ? q.partialRaw : q.raw;
			const candidates = previous.filter(q => q.mode === mode);
			const idMatches = result.upstreamResponseId ? candidates.filter(q => q.upstreamResponseId === result.upstreamResponseId) : [];
			const sameIdBody = idMatches.find(q => bodyOf(q) === result.raw);
			// Compare the full returned text, not the extracted candy number or the rendered image.
			const sameLongBody = result.raw.length >= 200 ? candidates.find(q => bodyOf(q) === result.raw) : null;
			const match = sameIdBody || sameLongBody || idMatches[0];
			const cacheEvidence = sameIdBody ? 'same-id-and-body' : sameLongBody ? 'same-body' : idMatches.length ? 'same-id' : null;
			const cacheWarning = sameIdBody ? '响应 ID 与完整正文均与历史相同，疑似重复回答；无法确认本轮是否重新生成。' : sameLongBody ? '完整正文与历史逐字相同（不少于 200 字），但响应 ID 不同或未提供；疑似重复回答，不能仅据此证明缓存。' : idMatches.length ? '响应 ID 重复，但正文不同；可能是供应商编号复用，不据此判失败。' : '';
			return { cacheEvidence, cacheWarning, duplicateOf: match ? { requestId: match.requestId || null, at: match.completedAt || match.serverStartedAt || null } : null };
		}
		function intelligenceFreshnessLabel(q) {
			return q?.cacheEvidence === 'same-id-and-body' ? '疑似重复回答 · ID 与全文相同' : q?.cacheEvidence === 'same-body' ? '疑似重复回答 · 全文相同' : q?.cacheEvidence === 'same-id' ? '响应 ID 重复 · 正文不同' : q?.cacheWarning ? '生成新鲜度待确认' : '';
		}
		// Plugin-owned state survives navigation between the workbench and chat.
		async function readIntelligenceResponse(response, onProgress) {
			if (!response.headers.get("content-type")?.includes("application/x-ndjson")) return response.json();
			const reader = response.body.getReader(), decoder = new TextDecoder();
			let buffer = "", result;
			const consume = line => {
				if (!line.trim()) return;
				const event = JSON.parse(line);
				if (event.type === "progress") onProgress(event);
				if (event.type === "result") result = event;
			};
			try {
				while (true) {
					const { done, value } = await reader.read();
					buffer += decoder.decode(value, { stream: !done });

					let end;
					while ((end = buffer.indexOf("\n")) >= 0) { consume(buffer.slice(0, end)); buffer = buffer.slice(end + 1); }
					if (done) { consume(buffer); break; }
				}
			} finally { try { await reader.cancel(); } catch {} reader.releaseLock(); }
			if (!result) throw new Error("检测连接提前关闭，未收到完整结果；请检查服务和供应商连接");
			return result;
		}
		function intelligenceAttemptFields(value) {
			const fields = {};
			for (const key of ["attempt", "attemptRequestId", "maxRetries", "retryCount", "retrying", "nextRetryAt", "retryReason", "retryStopReason", "attemptHistory"]) {
				if (value && value[key] !== undefined) fields[key] = value[key];
			}
			return fields;
		}
		async function saveIntelligenceArtifact(html, runId, fetchImpl = fetch) {
			// A local export may queue behind parallel model streams in the browser.
			// Retry only this idempotent file request, never the model generation.
			const body = JSON.stringify({ html, ...(runId ? { runId } : {}) });
			for (let attempt = 0; attempt < 3; attempt++) {
				try {
					const response = await fetchImpl('/api/intelligence-artifact', {
						method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(120000),
						headers: { 'content-type': 'application/json' }, body
					});
					if (response.status === 404) throw new Error('保存接口不可用，请重启 Harness 后重试保存');
					if ([408, 429, 502, 503, 504].includes(response.status)) {
						try { await response.body?.cancel(); } catch {}
						throw Object.assign(new Error('本地保存服务暂时无响应'), { retryable: true });
					}
					const file = await response.json();
					if (!response.ok || !/^[a-f0-9]{64}$/.test(file.id || '')) throw new Error(file.error || '保存动画文件失败');
					return file;
				} catch (error) {
					const timeout = error?.name === 'TimeoutError' || /signal timed out/i.test(error?.message || '');
					const transient = timeout || error?.retryable || error?.name === 'TypeError';
					if (!transient || attempt === 2) throw new Error(timeout ? '本地保存等待超时；生成内容已保留，可单独重试保存' : error?.message || '本地文件保存失败');
					await new Promise(resolve => window.setTimeout(resolve, 1000 * (attempt + 1)));
				}
			}
		}
		function createIntelligenceRunner(fetchImpl = fetch) {
			const pending = new Map(), listeners = new Set(), artifactRetries = new Set();
			let history = readIntelligenceWorkbenchHistory(), historyError = '';
			const hasDatabase = typeof indexedDB !== 'undefined';
			let historyLoading = hasDatabase, historySaving = false, loadFailed = false;
			let writes = Promise.resolve(), revision = 0;
			const earlyChanges = [];
			let snapshot = { running: [], progress: {}, history, historyError, historyLoading, historySaving };
			const publish = () => {
				snapshot = { running: [...pending.keys()], progress: Object.fromEntries([...pending].map(([id, task]) => [id, task.progress])), history, historyError, historyLoading, historySaving };
				for (const listener of listeners) listener();
			};
			const queueSave = () => {
				if (loadFailed) return; // Never overwrite unread database history with a partial legacy copy.
				const value = history, generation = ++revision;
				historySaving = true;
				writes = writes.then(async () => {
					try {
						if (hasDatabase) await intelligenceHistoryDatabase('readwrite', value);
						else if (!writeIntelligenceWorkbenchHistory(value)) throw new Error('浏览器存储不可用或空间不足');
						if (generation === revision) historyError = '';
					} catch (error) {
						if (generation === revision) historyError = `检测记录保存失败：${error?.name === 'QuotaExceededError' ? '浏览器存储空间不足' : error?.message || '浏览器存储不可用'}。本轮结果仍在页面中，请先导出检测记录备份。`;
					} finally {
						if (generation === revision) historySaving = false;
						publish();
					}
				});
			};
			const persist = change => {
				history = change(history).slice(0, 1000);
				if (historyLoading) earlyChanges.push(change);
				else queueSave();
			};
			const ready = hasDatabase ? intelligenceHistoryDatabase('readonly').then(stored => {
				if (stored !== undefined && !Array.isArray(stored)) throw new Error('检测历史格式无效，已保留原数据');
				if (stored !== undefined) {
					history = stored.filter(item => item && typeof item.targetId === 'string').map(normalizeIntelligenceRecord).slice(0, 1000);
					for (const change of earlyChanges) history = change(history).slice(0, 1000);
				}
				historyLoading = false;
				if (stored === undefined || earlyChanges.length) queueSave();
				earlyChanges.length = 0;
				publish();
			}).catch(error => {
				historyLoading = false; loadFailed = true;
				historyError = `检测历史读取失败：${error?.message || '数据库不可用'}。为保护原记录已暂停写入，请先导出本页记录备份。`;
				publish();
			}) : Promise.resolve();
			const flushHistory = async () => { await ready; await writes; };
			const record = (target, raw, evaluated, completed = true, meta = {}) => {
				const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, targetId: target.id, providerId: target.providerId, modelId: target.modelId, provider: target.provider, model: target.model, mode: target.mode, score: evaluated.score, max: evaluated.max, valid: evaluated.valid, passed: evaluated.passed, completed, answer: evaluated.answer, preview: evaluated.preview, verdict: evaluated.verdict.label, tone: evaluated.verdict.tone, grade: evaluated.verdict.grade || evaluated.verdict.tone, raw, at: Date.now(), reasoningEffort: target.reasoningEffort || "default", timeoutMinutes: target.timeoutMinutes || 10, ...meta };
				persist(items => [item, ...items]);
				publish();
				return item;
			};
			return {
				subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
				getSnapshot: () => snapshot,
				flushHistory,
				exportHistory: () => {
					const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), records: history }, null, 2)], { type: 'application/json' });
					const url = URL.createObjectURL(blob), link = document.createElement('a');
					link.href = url; link.download = `intelligence-history-${Date.now()}.json`; link.click();
					window.setTimeout(() => URL.revokeObjectURL(url), 60000);
				},
				record,
				async retryArtifact(id) {
					if (artifactRetries.has(id)) return;
					artifactRetries.add(id);
					try {
						await ready;
						const item = history.find(entry => entry.id === id);
						const question = item?.questions?.find(q => q.mode === 'pelican');
						// Only an explicit failed-save action can re-export a saved result.
						if (!question?.artifactError || !question.preview || question.artifactSaving) return;
						const patch = fields => {
							persist(items => items.map(entry => entry.id !== id ? entry : { ...entry, questions: entry.questions.map(q => q.mode === 'pelican' ? { ...q, ...fields } : q) }));
							publish();
						};
						patch({ artifactSaving: true });
						try { patch({ artifact: await saveIntelligenceArtifact(question.preview, question.runId || item.runId || item.id, fetchImpl), artifactError: '', artifactSaving: false }); }
						catch (error) { patch({ artifactError: error.message || '本地文件保存失败', artifactSaving: false }); }
						await flushHistory();
					} finally { artifactRetries.delete(id); }
				},
				artifactSaved: (id, artifact) => {
					persist(items => items.map(item => item.id !== id ? item : { ...item, questions: item.questions?.map(q => q.mode === 'pelican' ? { ...q, artifact, artifactError: '', artifactSaving: false } : q) }));
					publish();
				},
				identifyHistory: target => {
					if (!historyLoading && !history.some(item => item.targetId === target.id && !item.modelId)) return;
					persist(items => items.map(item => item.targetId === target.id && !item.modelId ? { ...item, providerId: target.providerId, modelId: target.modelId, provider: target.provider, model: target.model } : item));
					publish();
				},
				previewFailed: (id, targetId) => {
					const failed = q => ({ ...q, previewFailed: true, preview: "", passed: false, valid: false, previewError: "浏览器无法加载预览，请查看原始答复" });
					const task = pending.get(targetId);
					if (task) task.progress = { ...task.progress, questions: task.progress.questions.map(q => q.mode === "pelican" ? failed(q) : q) };
					else persist(items => items.map(item => item.id !== id ? item : item.questions?.length ? { ...item, questions: item.questions.map(q => q.mode === "pelican" ? failed(q) : q) } : failed(item)));
					publish();
				},
				clearHistory: targetId => { persist(items => targetId ? items.filter(item => item.targetId !== targetId) : []); publish(); },
				cancel: id => pending.get(id)?.controller.abort('cancelled'),
				dispose: () => { for (const task of pending.values()) task.controller.abort('disposed'); listeners.clear(); },
				async run(target, testMode = "combined") {
					if (pending.has(target.id) || !target.providerId || !target.modelId || !["combined", "pelican", "candy"].includes(testMode)) return;
					const modes = testMode === "combined" ? ["pelican", "candy"] : [testMode];
					const controller = new AbortController(), startedAt = Date.now();
					const runId = `${startedAt}-${crypto.randomUUID()}`;
					const timeoutMinutes = [3, 5, 10, 20, 30].includes(target.timeoutMinutes) ? target.timeoutMinutes : 10;
					const task = { controller, progress: { runId, testMode, startedAt, timeoutMinutes, textChars: 0, reasoningChars: 0, questions: modes.map(mode => ({ mode, runId, name: mode === "pelican" ? "鹈鹕 SVG" : "糖果推理", pending: true, startedAt, timeoutMinutes, textChars: 0, reasoningChars: 0 })) } };
					pending.set(target.id, task);
					publish();
					const updateQuestion = (mode, patch) => {
						const questions = task.progress.questions.map(q => q.mode === mode ? { ...q, ...patch } : q);
						task.progress = { ...task.progress, questions, textChars: questions.reduce((n, q) => n + (q.textChars || 0), 0), reasoningChars: questions.reduce((n, q) => n + (q.reasoningChars || 0), 0) };
						publish();
					};
					const tick = window.setInterval(publish, 1000);
					const timeout = window.setTimeout(() => controller.abort('timeout'), timeoutMinutes * 60000 + 15000);
				const runQuestion = async mode => {
					const prompt = getIntelligencePrompt(mode);
					const requestId = `${runId}:${mode}`;
					updateQuestion(mode, { requestId });
					let result;
					try {
							const response = await fetchImpl('/api/intelligence-test', {
								method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
								headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
							body: JSON.stringify({ requestId, provider: target.providerId, model: target.modelId, mode, prompt, timeoutMinutes, ...(target.reasoningEffort ? { reasoningEffort: target.reasoningEffort } : {}) })
						});
							if (response.status === 404) throw new Error('后台尚未加载静默检测接口，请在当前任务完成后重启 Harness');
						result = await readIntelligenceResponse(response, event => updateQuestion(mode, { textChars: event.textChars || 0, reasoningChars: event.reasoningChars || 0, firstChunkMs: event.firstChunkMs, transport: event.transport, ...intelligenceAttemptFields(event), ...(typeof event.partialRaw === "string" ? { partialRaw: event.partialRaw } : {}), ...(event.responseBlocks ? { responseBlocks: event.responseBlocks } : {}), ...(event.toolCalls ? { toolCalls: event.toolCalls } : {}) }));
						if (!response.ok || result.error) throw new Error(result.error || `请求失败（HTTP ${response.status}）`);
						await ready;
						if (result.requestId !== requestId) throw new Error(result.requestId ? '检测请求响应编号不匹配，已丢弃结果' : '后台未返回本轮请求编号，请重启 Harness 后重试');
						if (result.provider !== target.providerId || result.model !== target.modelId) throw new Error('检测响应的供应商或模型不匹配，已丢弃结果');
						const upstreamResponseId = typeof result.upstreamResponseId === 'string' ? result.upstreamResponseId : null;
						updateQuestion(mode, { upstreamResponseId, serverStartedAt: result.serverStartedAt, serverElapsedMs: result.serverElapsedMs, firstChunkMs: result.firstChunkMs, rawSha256: result.rawSha256, transport: result.transport });
						if (typeof result.raw !== 'string') throw new Error('未收到模型返回结果');
						// An upstream ID is diagnostic metadata, not proof of generation or answer quality.
						const previous = history.filter(item => item.providerId === target.providerId && item.modelId === target.modelId).flatMap(item => item.questions || []);
						for (const other of pending.values()) if (other !== task) previous.push(...other.progress.questions.filter(q => q.provider === target.providerId && q.model === target.modelId));
						updateQuestion(mode, intelligenceFreshnessEvidence(result, previous, mode));
							controller.signal.throwIfAborted();
							const evaluated = evaluateIntelligenceWorkbench(mode, result.raw);
						updateQuestion(mode, { ...evaluated, ...intelligenceAttemptFields(result), retrying: false, partialRaw: "", verdict: evaluated.verdict.label, tone: evaluated.verdict.tone, pending: false, completed: true, raw: result.raw, responseBlocks: result.responseBlocks, toolCalls: result.toolCalls, finishReason: result.finishReason, prompt, requestId, provider: result.provider, model: result.model, serverStartedAt: result.serverStartedAt, upstreamStartedAt: result.upstreamStartedAt, serverElapsedMs: result.serverElapsedMs, elapsedMs: result.elapsedMs ?? Date.now() - startedAt, textChars: result.textChars || result.raw.length, reasoningChars: result.reasoningChars || 0 });
							updateQuestion(mode, { completedAt: Date.now() });
							if (mode === 'pelican' && evaluated.preview) {
								updateQuestion(mode, { artifactSaving: true });
								try { updateQuestion(mode, { artifact: await saveIntelligenceArtifact(evaluated.preview, runId, fetchImpl), artifactError: '' }); }
								catch (error) { updateQuestion(mode, { artifactError: error.message || '保存动画文件失败' }); }
								finally { updateQuestion(mode, { artifactSaving: false }); }
							}
						} catch (error) {
							const checkpoint = task.progress.questions.find(q => q.mode === mode);
							const cancelled = controller.signal.aborted;
							const code = cancelled ? controller.signal.reason === 'timeout' ? 'CLIENT_TIMEOUT' : 'CANCELLED' : result?.code || 'REQUEST_FAILED';
							const message = cancelled ? code === 'CLIENT_TIMEOUT' ? `检测连接超过 ${timeoutMinutes} 分钟仍未完成` : '测试已取消' : error instanceof Error ? error.message : '模型请求失败';
							updateQuestion(mode, { ...intelligenceAttemptFields(result), retrying: false, pending: false, completed: false, valid: false, passed: false, score: 0, max: 1, answer: null, preview: '', verdict: code.includes('TIMEOUT') ? '检测超时' : code === 'CANCELLED' ? '测试已取消' : '请求失败', raw: message, code, elapsedMs: result?.elapsedMs ?? Date.now() - startedAt, textChars: result?.textChars ?? checkpoint?.textChars ?? 0, reasoningChars: result?.reasoningChars ?? checkpoint?.reasoningChars ?? 0, ...(result?.upstreamResponseId ? { upstreamResponseId: result.upstreamResponseId } : {}), partialRaw: result?.partialRaw ?? checkpoint?.partialRaw ?? '', responseBlocks: result?.responseBlocks ?? checkpoint?.responseBlocks, toolCalls: result?.toolCalls ?? checkpoint?.toolCalls, ...(result?.transport ? { transport: result.transport } : {}), ...(result?.firstChunkMs == null ? {} : { firstChunkMs: result.firstChunkMs }), serverElapsedMs: result?.serverElapsedMs });
						}
					};
					try {
						await Promise.all(modes.map(runQuestion));
						const questions = task.progress.questions;
						const status = intelligenceResultStatus({ questions, testMode });
						record({ ...target, mode: testMode }, questions.map(q => `${q.name}\n${q.raw}${q.partialRaw ? `\n未完成正文：\n${q.partialRaw}` : ''}`).join('\n\n'), { score: status.passed, max: modes.length, valid: questions.some(q => q.valid), passed: status.passed === modes.length, answer: questions.find(q => q.mode === 'candy')?.answer ?? null, preview: questions.find(q => q.mode === 'pelican')?.preview || '', verdict: status }, true, { id: runId, runId, testMode, startedAt, questions, elapsedMs: Date.now() - startedAt, textChars: task.progress.textChars, reasoningChars: task.progress.reasoningChars });
						await flushHistory();
					} finally {
						window.clearTimeout(timeout);
						window.clearInterval(tick);
						pending.delete(target.id);
						publish();
					}
				}
			};
		}
		// Display the unselected question from its own latest record. Never copy it
		// into the new run, alter grading, or treat it as a newly generated answer.
		function intelligenceDisplayedQuestions(target, history, active) {
			const records = history.filter(item => item.targetId === target.id && (!item.modelId || item.modelId === target.modelId && item.providerId === target.providerId)).sort((a, b) => b.at - a.at);
			const current = active || records[0];
			const questionsOf = item => item?.questions || (item ? [item] : []);
			const mode = current?.testMode || current?.mode || "combined";
			const result = {};
			for (const name of ["pelican", "candy"]) {
				let owner = current, question = questionsOf(current).find(q => q.mode === name), retained = false;
				if (!question && ["pelican", "candy"].includes(mode) && mode !== name) {
					owner = records.find(item => questionsOf(item).some(q => q.mode === name));
					question = questionsOf(owner).find(q => q.mode === name);
					retained = !!question;
				}
				result[name] = { question, retained, recordId: owner?.id, at: question?.completedAt || owner?.at, runKey: question?.runId || owner?.runId || owner?.id || target.id };
			}
			return result;
		}
		function intelligenceCandyTone(question) {
			if (!question || question.pending) return "gray";
			if (question.completed === false || question.answer == null) return "bad";
			return question.answer === 21 ? "good" : "warn";
		}
		function IntelligencePreviewPlaceholder({ question, selectedTestMode }) {
			const cancelled = question?.code === "CANCELLED";
			const failed = !!question && !question.pending && !cancelled && (question.completed === false || question.previewFailed || !!question.previewError || question.passed === false);
			const detail = question?.pending ? intelligenceProgressLabel(question) : question?.previewError || (question?.completed === false ? question.raw : failed ? "本次检测没有返回可用画面，可重新测试。" : selectedTestMode === "candy" ? "本轮仅测糖果 · 未检测鹈鹕" : "测试完成后，这里会显示 SVG 预览");
			const title = question?.code?.includes("TIMEOUT") ? "检测超时" : question?.completed === false ? "请求失败" : "未生成可预览画面";
			return react_jsx_runtime.jsxs("div", { className: "dshIw_previewEmpty" + (failed ? " dshIw_previewFailure" : ""), role: "status", children: failed ? [
				react_jsx_runtime.jsx("span", { className: "dshIw_failureIcon", "aria-hidden": true, children: "!" }),
				react_jsx_runtime.jsx("strong", { children: title }),
				react_jsx_runtime.jsx("p", { children: detail || "本次检测没有返回可用画面，可重新测试。" })
			] : detail });
		}
		function IntelligenceSaveOverlay({ question, onRetry }) {
			if (!question?.artifactSaving && !question?.artifactError) return null;
			return react_jsx_runtime.jsx("div", { className: "dshIw_saveOverlay", onPointerDown: event => event.stopPropagation(), onDoubleClick: event => event.stopPropagation(), children:
				question.artifactSaving ? react_jsx_runtime.jsx("span", { role: "status", children: "保存中…" }) : react_jsx_runtime.jsx("button", { type: "button", draggable: false, disabled: !onRetry, onClick: event => { event.stopPropagation(); onRetry?.(); }, title: "仅重新保存本轮文件，不调用模型", children: "重试保存" })
			});
		}
		function intelligenceRequestSummary(q) {
			const transport = q.transport;
			const attempted = transport?.observed && transport.attempts > 0;
			const responded = attempted && transport.responses > 0;
			const httpError = responded && transport.status >= 400;
			let request = { text: "未记录，暂时无法确认", tone: "muted" };
			if (httpError) request = { text: "接口返回错误（HTTP " + transport.status + "）", tone: "bad" };
			else if (responded) request = { text: "已发出，接口已响应", tone: "good" };
			else if (attempted) request = { text: q.pending ? "正在请求，等待接口响应" : "已尝试请求，但未收到接口响应", tone: q.pending ? "muted" : "warn" };
			else if (q.pending) request = { text: "检测中，等待请求记录", tone: "muted" };
			if (q.retrying) request = { text: "等待自动重试 " + Math.min((q.retryCount || 0) + 1, 3) + "/3", tone: "warn" };
			let duplicate = { text: "这条记录缺少检查证据", tone: "muted" };
			if (q.pending) duplicate = { text: "回答尚未完成，暂不比较", tone: "muted" };
			else if (q.cacheEvidence === "same-id-and-body" || q.cacheEvidence === "same-body") duplicate = { text: "完整回答与历史相同", tone: "warn" };
			else if (q.cacheEvidence === "same-id") duplicate = { text: "仅编号重复，回答内容不同", tone: "warn" };
			else if (q.cacheWarning) duplicate = { text: "有重复疑点，需要核查", tone: "warn" };
			else if (q.completed === false) duplicate = { text: "未完成，无法比较完整回答", tone: "muted" };
			else if (q.cacheEvidence === null && typeof q.raw === "string" && q.raw.length > 0) duplicate = { text: "未发现与已存记录重复", tone: "muted" };
			let next = "这条记录缺少请求证据，不等于没有发送。下次检测后再看；仍缺失时检查后台版本或接口适配。";
			if (q.retrying || q.pending && q.retryCount) next = "正在自动重试这道题，上次收到的内容已保留；重试是新请求，可能再次计费。";
			else if (q.pending) next = "先等这道题完成，结论会自动更新。";
			else if (httpError) next = "先查看检测失败原因；接口返回错误不代表模型降智。";
			else if (attempted && !responded) next = "先核对连接或超时原因，暂时不能确认供应商是否收到请求。";
			else if (duplicate.tone === "warn") next = q.cacheEvidence === "same-id" ? "不能因为编号重复就判定用了旧答案；有疑问时对照供应商日志。" : "请对照供应商日志核查。回答重复是线索，还不能单独证明用了缓存。";
			else if (responded && q.completed === false) next = "接口已响应，但本轮未完成；先查看检测失败原因。";
			else if (responded) next = "已记录接口响应；是否重新生成，仍需对照供应商日志确认。";
			const elapsed = q.serverElapsedMs ?? q.elapsedMs;
			const totalSeconds = Number.isFinite(elapsed) && elapsed >= 0 ? Math.round(elapsed / 1000) : null;
			const duration = totalSeconds === null ? "" : totalSeconds < 60 ? totalSeconds + " 秒" : Math.floor(totalSeconds / 60) + " 分 " + totalSeconds % 60 + " 秒";
			return { request, duplicate, next, duration, retry: q.retrying ? "等待重试 " + Math.min((q.retryCount || 0) + 1, 3) + "/3" : q.retryCount ? (q.pending ? "正在重试 " : "已重试 ") + q.retryCount + "/3" : "" };
		}
		function IntelligenceRequestEvidence({ title, questions, onClose }) {
			const dialogRef = react.useRef(null);
			react.useEffect(() => { const dialog = dialogRef.current; dialog.showModal(); return () => dialog.close(); }, []);
			return react_jsx_runtime.jsxs("dialog", { ref: dialogRef, className: "dshIw_editDialog dshIw_evidenceDialog", "aria-label": "请求核查", onCancel: event => { event.preventDefault(); onClose(); }, children: [
				react_jsx_runtime.jsxs("div", { className: "dshIw_editHead", children: [react_jsx_runtime.jsx("h2", { children: "请求核查" }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", onClick: onClose, "aria-label": "关闭请求核查", children: "×" })] }),
				react_jsx_runtime.jsxs("div", { className: "dshIw_evidenceBody", children: [
					react_jsx_runtime.jsx("p", { className: "dshIw_evidenceTarget", children: title }),
					react_jsx_runtime.jsx("p", { className: "dshIw_evidenceIntro", children: "先看下面的结论，编号和技术数据不用逐项看。" }),
					questions.length === 0 ? react_jsx_runtime.jsx("p", { children: "还没有可核查的检测记录。" }) : questions.map(q => {
						const summary = intelligenceRequestSummary(q);
						return react_jsx_runtime.jsxs("section", { className: "dshIw_evidenceCard", "aria-label": q.mode === "candy" ? "糖果推理结论" : "鹈鹕动画结论", children: [
							react_jsx_runtime.jsxs("div", { className: "dshIw_evidenceCardHead", children: [react_jsx_runtime.jsx("h3", { children: q.mode === "candy" ? "糖果推理" : "鹈鹕动画" }), summary.duration && react_jsx_runtime.jsx("span", { children: (q.pending ? "已等待 " : "耗时 ") + summary.duration })] }),
							react_jsx_runtime.jsx("dl", { className: "dshIw_evidenceSummary", children: [["请求情况", summary.request], ["重复情况", summary.duplicate], ...(q.mode === "pelican" && q.artifactError ? [["文件保存", { text: "本地保存未完成，返回卡片点“重试保存”，无需重新检测", tone: "warn" }]] : []), ...(summary.retry ? [["自动重试", { text: summary.retry, tone: "muted" }]] : [])].map(([label, value]) => react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("dt", { children: label }), react_jsx_runtime.jsx("dd", { className: "dshIw_evidenceValue " + value.tone, children: value.text })] }, label)) }),
							react_jsx_runtime.jsxs("p", { className: "dshIw_evidenceNext", children: [react_jsx_runtime.jsx("strong", { children: "下一步" }), summary.next] })
						] }, q.mode);
					}),
					react_jsx_runtime.jsx("p", { className: "dshIw_evidenceNote", children: "请求已发出 ≠ 已重新生成；速度快 ≠ 使用旧答案。" }),
					react_jsx_runtime.jsxs("details", { className: "dshIw_evidenceDetails", children: [
						react_jsx_runtime.jsx("summary", { children: "技术详情（排查时再看）" }),
						questions.map(q => {
							const transport = q.transport;
							const seconds = ms => typeof ms === "number" ? (ms / 1000).toFixed(2) + " 秒" : "未记录";
							const rows = [
								["本轮请求", q.requestId || "未记录"],
								...(q.mode === "pelican" ? [["本地文件", q.artifactSaving ? "正在保存" : q.artifactError || (q.artifact ? "曾保存到本地（不实时检查文件是否存在）" : "未导出本地文件")], ...(q.artifact?.path ? [["保存位置", q.artifact.path]] : [])] : []),
								...(q.attemptRequestId ? [["当前尝试请求", q.attemptRequestId]] : []),
								...(q.maxRetries ? [["自动重试", `${q.retryCount || 0}/${q.maxRetries}；总时限内重试，重新请求可能再次计费`]] : []),
								...(q.retryStopReason ? [["停止重试原因", q.retryStopReason]] : []),
								...(q.attemptHistory || []).map(item => [`第 ${item.attempt} 次尝试`, `${item.error || item.code || "未完成"}；正文 ${item.textChars || 0} 字，思考 ${item.reasoningChars || 0} 字；请求 ${item.requestId || "未记录"}；内容保留在检测记录中`]),
								[q.retryCount ? "当前尝试 HTTP 请求" : "HTTP 请求", transport?.observed ? "实际发起 " + transport.attempts + " 次，收到响应 " + transport.responses + " 次，网络异常 " + transport.failures + " 次" : "未取得 HTTP 层记录，不能以本机编号代替外发证据"],
								["HTTP 状态", transport?.status ?? "未记录"],
								...(transport?.cacheIsolation === "per-attempt-query" ? [["缓存线路隔离", "本次尝试已使用独立网址参数；题目与请求正文未改，是否重新生成仍以供应商记录为准"]] : []),
								["响应头等待 / 首段内容 / 总耗时", [seconds(transport?.headersMs), seconds(q.firstChunkMs), seconds(q.serverElapsedMs)].join(" / ")],
								["上游响应 ID", q.upstreamResponseId || "未提供"],
								["完整正文 SHA-256", q.rawSha256 || "未记录"],
								["重复内容检查", q.pending ? "等待完整回答后比较" : q.cacheWarning || intelligenceRequestSummary(q).duplicate.text + "；新鲜度尚未证实"],
								...(q.duplicateOf ? [["匹配历史请求", q.duplicateOf.requestId || "未记录"], ["匹配历史时间", q.duplicateOf.at ? formatIntelligenceTime(q.duplicateOf.at) : "未记录"]] : []),
								...Object.entries(transport?.headers || {}).map(([name, value]) => ["上游响应头 · " + name, value])
							];
							return react_jsx_runtime.jsxs("section", { children: [react_jsx_runtime.jsx("h3", { children: q.mode === "candy" ? "糖果推理" : "鹈鹕 HTML / SVG" }), react_jsx_runtime.jsx("dl", { children: rows.map(([label, value]) => react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("dt", { children: label }), react_jsx_runtime.jsx("dd", { children: String(value) })] }, label)) })] }, q.mode);
						})
					] })
				] })
			] });
		}
		function IntelligenceTestButton({ label, className, disabled = false, running = false, onRun, onCancel }) {
			const [open, setOpen] = react.useState(false);
			const triggerRef = react.useRef(null), menuRef = react.useRef(null);
			const timerRef = react.useRef(null), leaveRef = react.useRef(null), pressRef = react.useRef(null), suppressRef = react.useRef(false), keyboardRef = react.useRef(false);
			const menuId = react.useId();
			const clearTimer = () => { window.clearTimeout(timerRef.current); timerRef.current = null; };
			const clearLeave = () => { window.clearTimeout(leaveRef.current); leaveRef.current = null; };
			const close = () => { clearTimer(); clearLeave(); setOpen(false); };
			const reveal = keyboard => { keyboardRef.current = keyboard; clearLeave(); setOpen(true); };
			const schedule = pressed => {
				clearTimer(); clearLeave();
				if (disabled || running) return;
				timerRef.current = window.setTimeout(() => { if (pressed) suppressRef.current = true; reveal(false); }, 600);
			};
			const leave = () => { clearTimer(); clearLeave(); leaveRef.current = window.setTimeout(() => setOpen(false), 220); };
			react.useEffect(() => { if (disabled || running) { clearTimer(); clearLeave(); setOpen(false); } return () => { clearTimer(); clearLeave(); }; }, [disabled, running]);
			react.useLayoutEffect(() => {
				if (!open || disabled || running) return;
				const menu = menuRef.current, trigger = triggerRef.current;
				const place = () => {
					const rect = trigger.getBoundingClientRect(), width = Math.min(180, window.innerWidth - 16);
					menu.style.width = width + "px";
					menu.style.left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8)) + "px";
					const height = menu.offsetHeight;
					menu.style.top = Math.max(8, rect.bottom + height + 6 < window.innerHeight ? rect.bottom + 6 : rect.top - height - 6) + "px";
				};
				const sync = event => { if (event.newState === "closed" && !menu.matches(":popover-open")) setOpen(false); };
				const scroll = event => { if (!menu.contains(event.target)) close(); };
				menu.addEventListener("toggle", sync); menu.showPopover(); place();
				if (keyboardRef.current) menu.querySelector("button")?.focus({ preventScroll: true });
				window.addEventListener("resize", place); document.addEventListener("scroll", scroll, true);
				return () => { menu.removeEventListener("toggle", sync); if (menu.matches(":popover-open")) menu.hidePopover(); window.removeEventListener("resize", place); document.removeEventListener("scroll", scroll, true); };
			}, [open, disabled, running]);
			const menuKey = event => {
				if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); triggerRef.current?.focus(); return; }
				const buttons = [...menuRef.current.querySelectorAll("button")], index = buttons.indexOf(document.activeElement);
				if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
					event.preventDefault(); event.stopPropagation();
					buttons[event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + buttons.length) % buttons.length]?.focus();
				}
			};
			return react_jsx_runtime.jsxs("span", { className: "dshIw_testButton", onDragStart: event => { event.preventDefault(); event.stopPropagation(); }, children: [
				react_jsx_runtime.jsx("button", { ref: triggerRef, type: "button", draggable: false, className, disabled, "aria-haspopup": running ? undefined : "menu", "aria-expanded": open && !running, "aria-controls": open ? menuId : undefined,
					title: running ? "取消当前检测" : "点击检测两题；悬停或长按选择单项，也可按方向下键展开",
					onPointerEnter: event => { if (event.pointerType === "mouse") schedule(false); }, onPointerLeave: leave,
					onPointerDown: event => { event.stopPropagation(); if (event.button !== 0) return; suppressRef.current = false; pressRef.current = { x: event.clientX, y: event.clientY }; schedule(true); },
					onPointerMove: event => { const press = pressRef.current; if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) { clearTimer(); suppressRef.current = true; } },
					onPointerUp: () => { clearTimer(); pressRef.current = null; }, onPointerCancel: () => { clearTimer(); pressRef.current = null; suppressRef.current = true; close(); },
					onContextMenu: event => event.preventDefault(),
					onKeyDown: event => { if (!disabled && !running && (event.key === "ArrowDown" || event.key === "F4")) { event.preventDefault(); clearTimer(); reveal(true); } if (event.key === "Escape") close(); },
					onClick: event => { event.stopPropagation(); clearTimer(); if (suppressRef.current && event.detail !== 0) { suppressRef.current = false; if (menuRef.current) menuRef.current.showPopover(); reveal(false); return; } close(); if (running) onCancel?.(); else onRun("combined"); }, children: label }),
				open && !disabled && !running && react_jsx_runtime.jsxs("div", { ref: menuRef, id: menuId, popover: "auto", role: "menu", "aria-label": label + " · 检测项目", className: "dshIw_testMenu", onPointerEnter: clearLeave, onPointerLeave: leave, onKeyDown: menuKey, children: [
					react_jsx_runtime.jsx("span", { className: "dshIw_testMenuLabel", children: "选择单项检测" }),
					...[ ["candy", "只测糖果"], ["pelican", "只测鹈鹕"] ].map(([mode, text]) => react_jsx_runtime.jsx("button", { type: "button", role: "menuitem", onClick: event => { event.stopPropagation(); close(); onRun(mode); triggerRef.current?.focus({ preventScroll: true }); }, children: text }, mode))
				] })
			] });
		}
		function IntelligenceModelPicker({ value, groups, disabled, placeholder, onChange, ariaLabel = "模型", searchable = false }) {
			const [open, setOpen] = react.useState(false);
			const [query, setQuery] = react.useState("");
			const rootRef = react.useRef(null), triggerRef = react.useRef(null), menuRef = react.useRef(null), searchRef = react.useRef(null);
			const menuId = react.useId();
			const needle = searchable ? query.trim().toLocaleLowerCase() : "";
			const visibleGroups = needle ? groups.flatMap(group => {
				const groupHit = String(group.label || "").toLocaleLowerCase().includes(needle);
				const keys = (group.keys || []).flatMap(key => {
					const keyHit = groupHit || String(key.label || "").toLocaleLowerCase().includes(needle);
					const items = (key.items || []).filter(item => keyHit || [item.label, item.value].join(" ").toLocaleLowerCase().includes(needle));
					return items.length ? [{ ...key, items }] : [];
				});
				const items = (group.items || []).filter(item => groupHit || [item.label, item.value].join(" ").toLocaleLowerCase().includes(needle));
				return keys.length || items.length ? [{ ...group, keys, items }] : [];
			}) : groups;
			const selected = groups.flatMap(group => [...(group.items || []), ...(group.keys || []).flatMap(key => key.items || [])]).find(item => item.value === value);
			// Native popovers stay above the modal and escape its overflow clipping,
			// while remaining descendants of the dialog for focus and inherited theme.
			react.useLayoutEffect(() => {
				if (!open || disabled) return;
				const menu = menuRef.current, trigger = triggerRef.current;
				const sync = event => { if (event.newState === "closed") setOpen(false); };
				const place = () => {
					const rect = trigger.getBoundingClientRect(), viewport = window.visualViewport;
					const leftEdge = (viewport?.offsetLeft || 0) + 12, topEdge = (viewport?.offsetTop || 0) + 12;
					const rightEdge = leftEdge + (viewport?.width || window.innerWidth) - 24;
					const bottomEdge = topEdge + (viewport?.height || window.innerHeight) - 24;
					const width = Math.min(Math.max(rect.width, 220), rightEdge - leftEdge);
					menu.style.width = `${width}px`;
					menu.style.maxHeight = "320px";
					const desired = Math.min(320, menu.scrollHeight + 2);
					const below = Math.max(0, bottomEdge - rect.bottom - 8), above = Math.max(0, rect.top - topEdge - 8);
					const upward = below < desired && above > below;
					const height = Math.min(desired, upward ? above : below);
					menu.style.maxHeight = `${height}px`;
					menu.style.left = `${Math.max(leftEdge, Math.min(rect.left, rightEdge - width))}px`;
					menu.style.top = `${Math.max(topEdge, upward ? rect.top - height - 8 : rect.bottom + 8)}px`;
				};
				const scroll = event => { if (!menu.contains(event.target)) place(); };
				menu.addEventListener("toggle", sync);
				menu.showPopover();
				place();
				if (searchable) searchRef.current?.focus({ preventScroll: true });
				else {
					const option = menu.querySelector('[aria-selected="true"]') || menu.querySelector('[role="option"]');
					option?.focus({ preventScroll: true });
					if (option) menu.scrollTop = Math.max(0, option.offsetTop - menu.clientHeight / 2);
				}
				const observer = new ResizeObserver(place);
				observer.observe(trigger);
				window.addEventListener("resize", place);
				document.addEventListener("scroll", scroll, true);
				window.visualViewport?.addEventListener("resize", place);
				window.visualViewport?.addEventListener("scroll", place);
				return () => {
					menu.removeEventListener("toggle", sync);
					if (menu.matches(":popover-open")) menu.hidePopover();
					observer.disconnect();
					window.removeEventListener("resize", place);
					document.removeEventListener("scroll", scroll, true);
					window.visualViewport?.removeEventListener("resize", place);
					window.visualViewport?.removeEventListener("scroll", place);
				};
			}, [open, disabled, searchable]);
			const close = () => { setOpen(false); setQuery(""); triggerRef.current?.focus({ preventScroll: true }); };
			const onMenuKey = event => {
				if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); return; }
				// 搜索框里的普通按键留给输入；方向键仍在结果间移动。
				const searchInput = searchRef.current;
				if (searchable && (event.target === searchInput || searchInput?.contains(event.target) === true) && !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
				const options = [...menuRef.current.querySelectorAll('[role="option"]')];
				const index = options.indexOf(document.activeElement);
				let next;
				if (event.key === "ArrowDown") next = (index + 1) % options.length;
				else if (event.key === "ArrowUp") next = (index - 1 + options.length) % options.length;
				else if (event.key === "Home") next = 0;
				else if (event.key === "End") next = options.length - 1;
				else return;
				event.preventDefault(); event.stopPropagation();
				options[next]?.focus({ preventScroll: true });
				options[next]?.scrollIntoView({ block: "nearest" });
			};
			return react_jsx_runtime.jsxs("div", { ref: rootRef, className: "dshIw_modelPicker", children: [
				react_jsx_runtime.jsxs("button", { ref: triggerRef, type: "button", className: "dshIw_modelPickerTrigger", "aria-label": ariaLabel, "aria-expanded": open && !disabled, "aria-haspopup": "listbox", "aria-controls": menuId, disabled, onClick: () => setOpen(current => !current), onKeyDown: event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); } }, children: [react_jsx_runtime.jsx("span", { children: selected?.label || placeholder }), react_jsx_runtime.jsx("span", { className: "dshIw_modelPickerChevron", "aria-hidden": "true", children: open ? "⌃" : "⌄" })] }),
				open && !disabled && react_jsx_runtime.jsxs("div", { ref: menuRef, id: menuId, popover: "auto", className: "dshIw_modelPickerMenu", role: "listbox", "aria-label": ariaLabel, onKeyDown: onMenuKey, children: [
					searchable && react_jsx_runtime.jsxs("label", { className: "dshIw_modelPickerSearch", children: [
						react_jsx_runtime.jsx("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", "aria-hidden": "true", children: react_jsx_runtime.jsx("path", { d: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-5.2-5.2" }) }),
						react_jsx_runtime.jsx("input", { ref: searchRef, type: "text", role: "searchbox", placeholder: "搜索供应商、密钥或模型", "aria-label": "搜索供应商、密钥或模型", value: query, onChange: event => setQuery(event.target.value) })
					] }),
					react_jsx_runtime.jsx("div", { className: "dshIw_modelPickerList", children: visibleGroups.length ? visibleGroups.map(group => react_jsx_runtime.jsxs("section", { className: "dshIw_modelPickerGroup", children: [
						react_jsx_runtime.jsx("div", { className: "dshIw_modelPickerGroupLabel", children: group.label }),
						react_jsx_runtime.jsx("div", { className: "dshIw_modelPickerKeys", children: (group.keys || []).map(key => react_jsx_runtime.jsxs("div", { children: [
							react_jsx_runtime.jsxs("div", { className: "dshIw_modelPickerKey", children: [react_jsx_runtime.jsx("i", { "aria-hidden": "true" }), react_jsx_runtime.jsx("span", { children: key.label })] }),
							(key.items || []).map(item => react_jsx_runtime.jsxs("button", { type: "button", role: "option", tabIndex: -1, "aria-selected": item.value === value, className: "dshIw_modelPickerOption", onClick: () => { onChange(item.value); close(); }, children: [react_jsx_runtime.jsx("span", { children: item.label }), item.value === value ? react_jsx_runtime.jsx("small", { children: "当前" }) : null] }, item.value))
						] }, key.label)) }),
						(group.items || []).map(item => react_jsx_runtime.jsxs("button", { type: "button", role: "option", tabIndex: -1, "aria-selected": item.value === value, className: "dshIw_modelPickerOption", onClick: () => { onChange(item.value); close(); }, children: [react_jsx_runtime.jsx("span", { children: item.label }), item.value === value ? react_jsx_runtime.jsx("small", { children: "当前" }) : null] }, item.value))
					] }, group.label)) : react_jsx_runtime.jsx("div", { className: "dshIw_modelPickerEmpty", children: needle ? `没有匹配“${query.trim()}”的模型` : placeholder }) })
				] })
			] });
		}
		function IntelligenceTargetEditor({ target, modelOptions, catalogState, onRefresh, disabled, onSave, onClose }) {
			const dialogRef = react.useRef(null);
			const [value, setValue] = react.useState({ modelId: target.modelId, reasoningEffort: target.reasoningEffort || "", timeoutMinutes: target.timeoutMinutes || 10 });
			const models = modelOptions.filter(item => item.providerId === target.providerId);
			const selected = models.find(item => item.modelId === value.modelId);
			const providerName = models[0]?.providerName || target.provider || target.providerId;
			const loading = catalogState.status === "loading";
			react.useEffect(() => {
				const dialog = dialogRef.current;
				dialog.showModal();
				return () => dialog.close();
			}, []);
			const changeModel = modelId => {
				const model = models.find(item => item.modelId === modelId)?.model;
				setValue(current => ({ ...current, modelId, reasoningEffort: intelligenceReasoningChoices(model).some(item => item.id === current.reasoningEffort) ? current.reasoningEffort : "" }));
			};
			return react_jsx_runtime.jsx("dialog", { ref: dialogRef, className: "dshIw_editDialog", "aria-labelledby": "dsh-intelligence-edit-title", onCancel: event => { event.preventDefault(); onClose(); }, children:
				react_jsx_runtime.jsxs("form", { onSubmit: event => { event.preventDefault(); if (selected && !loading && !disabled) onSave(value); }, children: [
					react_jsx_runtime.jsxs("div", { className: "dshIw_editHead", children: [react_jsx_runtime.jsx("h2", { id: "dsh-intelligence-edit-title", children: "编辑检测模型" }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", "aria-label": "关闭编辑", onClick: onClose, children: "×" })] }),
					react_jsx_runtime.jsxs("p", { className: "dshIw_editProvider", children: ["供应商", react_jsx_runtime.jsx("strong", { children: providerName })] }),
					react_jsx_runtime.jsxs("label", { className: "dshIw_editModel", children: ["模型", react_jsx_runtime.jsx(IntelligenceModelPicker, { value: value.modelId, disabled: disabled || loading || !models.length, placeholder: loading ? "正在读取模型…" : `${target.model || target.name}（当前不可用）`, groups: [{ label: providerName, items: models.map(item => ({ value: item.modelId, label: item.modelName })) }], onChange: changeModel, ariaLabel: "模型" })] }),
					react_jsx_runtime.jsx(IntelligenceRunOptions, { value, model: selected?.model, disabled: disabled || loading, onChange: patch => setValue(current => ({ ...current, ...patch })) }),
					react_jsx_runtime.jsx("p", { className: "dshIw_editHint", children: catalogState.error ? `模型列表读取失败：${catalogState.error}` : !loading && !models.length ? "该供应商暂无可用模型，请检查供应商设置后刷新。" : "仅可选择此供应商的模型。切换模型后，展示该模型自己的检测记录。" }),
					react_jsx_runtime.jsxs("div", { className: "dshIw_editFoot", children: [react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", disabled: loading, onClick: onRefresh, children: loading ? "读取中…" : "刷新模型" }), react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", onClick: onClose, children: "取消" }), react_jsx_runtime.jsx("button", { type: "submit", className: "dshIt_primary", disabled: !selected || loading || disabled, children: "保存修改" })] })] })
				] })
			});
		}
		function IntelligenceHtmlPreview({ html, title, onDoubleClick, onSelect, maxHeight = 240, saveControl }) {
			const viewportRef = react.useRef(null), frameRef = react.useRef(null);
			const [box, setBox] = react.useState({ width: 300, height: 240 });
			const [pageSize, setPageSize] = react.useState({ width: 960, height: 720 });
			const token = react.useMemo(() => `dsh-preview-${Math.random().toString(36).slice(2)}`, [html]);
			// Measurement is added only to the preview copy. Saved replies/documents remain untouched.
			// Fit the frame tightly around the scaled document, keeping a 240px height limit.
			const srcDoc = react.useMemo(() => html + `<script>(()=>{const report=()=>{const root=document.documentElement,body=document.body;parent.postMessage({type:"dsh-preview-size",token:${JSON.stringify(token)},width:Math.max(960,root.scrollWidth,body?.scrollWidth||0),height:Math.max(720,root.scrollHeight,body?.scrollHeight||0)},"*")};const measure=()=>{const observer=new ResizeObserver(()=>{observer.disconnect();report()});observer.observe(document.documentElement)};const ready=()=>{if(document.fonts?.ready)document.fonts.ready.then(measure);else measure()};if(document.readyState==="complete")ready();else addEventListener("load",ready,{once:true})})()<\/script>`, [html, token]);
			react.useLayoutEffect(() => {
				const viewport = viewportRef.current;
				const resize = () => setBox(current => current.width === viewport.clientWidth && current.height === maxHeight ? current : { width: viewport.clientWidth, height: maxHeight });
				resize();
				const observer = new ResizeObserver(resize);
				observer.observe(viewport);
				return () => observer.disconnect();
			}, [maxHeight]);
			react.useLayoutEffect(() => {
				const receive = event => {
					const value = event.data;
					if (event.source !== frameRef.current?.contentWindow || value?.type !== "dsh-preview-size" || value.token !== token) return;
					if (!Number.isFinite(value.width) || !Number.isFinite(value.height)) return;
					setPageSize({ width: Math.max(960, Math.min(16384, value.width)), height: Math.max(720, Math.min(16384, value.height)) });
				};
				window.addEventListener("message", receive);
				return () => window.removeEventListener("message", receive);
			}, [token]);
			const scale = Math.min(box.width / pageSize.width, box.height / pageSize.height, 1);
			return react_jsx_runtime.jsx("div", { ref: viewportRef, className: "dshIw_previewSlot", children: react_jsx_runtime.jsxs("div", { className: "dshIw_previewViewport", style: { width: pageSize.width * scale, height: pageSize.height * scale }, children: [
				react_jsx_runtime.jsx("iframe", { ref: frameRef, className: "dshIw_previewImage", title, sandbox: "allow-scripts", referrerPolicy: "no-referrer", scrolling: "no", srcDoc, style: { width: pageSize.width, height: pageSize.height, left: 0, top: 0, transform: `scale(${scale})` } }),
				(onDoubleClick || onSelect) && react_jsx_runtime.jsx("button", { type: "button", className: "dshIw_previewZoomHotspot", "aria-label": onSelect ? title : "双击放大查看", title: onSelect ? title : "双击放大查看", onClick: onSelect ? () => onSelect(pageSize) : undefined, onDoubleClick: onDoubleClick ? () => onDoubleClick(pageSize) : undefined }),
				saveControl
			] }) });
		}
		function intelligencePreviewHistory(target, history, current) {
			return history.filter(item => item.targetId === target.id && (!item.modelId || item.modelId === target.modelId && item.providerId === target.providerId))
				.map(item => { const q = (item.questions || [item]).find(q => q.mode === "pelican"); return q ? { id: item.id, runKey: q.runId || item.runId || item.id, at: q.completedAt || item.at, html: q.preview, completed: q.completed } : null; })
				.filter(item => item?.html && item.completed !== false && item.id !== current.recordId && item.runKey !== current.runKey && (!current.at || item.at <= current.at))
				.sort((a, b) => b.at - a.at).slice(0, 5);
		}
		function intelligenceStaticPreview(html) {
			const doc = new DOMParser().parseFromString(html, "text/html");
			// Only the thumbnail copy is inert. The selected large view uses the
			// original answer, including its scripts, styles and animation.
			doc.querySelectorAll('script,iframe,object,embed,link,base,meta,video,audio,animate,animateMotion,animateTransform,set').forEach(node => node.remove());
			for (const node of doc.querySelectorAll('*')) {
				for (const attr of [...node.attributes]) if (/^on/i.test(attr.name)) node.removeAttribute(attr.name);
			}
			const policy = doc.createElement('meta');
			policy.httpEquiv = 'Content-Security-Policy';
			policy.content = "default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; form-action 'none'; base-uri 'none'";
			doc.head.prepend(policy);
			const style = doc.createElement('style');
			style.textContent = '*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important}';
			doc.body.append(style);
			return '<!doctype html>' + doc.documentElement.outerHTML;
		}
		const IntelligenceHistoryThumbnail = react.memo(function IntelligenceHistoryThumbnail({ item, onSelect }) {
			const initialSize = item.pageSize || { width: 960, height: 720 };
			const [size, setSize] = react.useState(initialSize);
			const [empty, setEmpty] = react.useState(false);
			const srcDoc = react.useMemo(() => intelligenceStaticPreview(item.html), [item.html]);
			const scale = Math.min(132 / size.width, 86 / size.height, 1);
			const label = (item.current ? '当前结果' : '历史 ' + item.number) + ' · ' + formatIntelligenceTime(item.at);
			return react_jsx_runtime.jsxs('button', { type: 'button', className: 'dshIw_staticThumb', title: label, 'aria-label': '查看' + label, onClick: () => onSelect(item, size), children: [
				!empty && react_jsx_runtime.jsx('span', { className: 'dshIw_staticThumbCanvas', style: { width: size.width * scale, height: size.height * scale }, children: react_jsx_runtime.jsx('iframe', {
					title: label, sandbox: 'allow-same-origin', tabIndex: -1, 'aria-hidden': true, referrerPolicy: 'no-referrer', scrolling: 'no', srcDoc,
					style: { width: initialSize.width, height: initialSize.height, transform: `scale(${scale})` },
					onLoad: event => {
						const doc = event.currentTarget.contentDocument;
						if (!doc) return;
						doc.querySelectorAll('svg').forEach(svg => svg.pauseAnimations?.());
						setSize({ width: Math.max(initialSize.width, Math.min(16384, doc.documentElement.scrollWidth)), height: Math.max(initialSize.height, Math.min(16384, doc.documentElement.scrollHeight)) });
						setEmpty(!doc.querySelector('svg,img') && !(doc.body.innerText || '').trim());
					}
				}) }),
				empty && react_jsx_runtime.jsx('span', { className: 'dshIw_staticThumbHint', children: '点击查看动态内容' })
			] });
		});
		function IntelligencePreviewLightbox({ html: originalHtml, title, pageSize: originalSize, at, history = [], onClose }) {
			const dialogRef = react.useRef(null), headRef = react.useRef(null), historyRef = react.useRef(null);
			const [selected, setSelected] = react.useState(null);
			const previews = react.useMemo(() => [{ id: '__current__', current: true, html: originalHtml, pageSize: originalSize, at }, ...history.slice(0, 5).map((item, index) => ({ ...item, number: index + 1 }))], [originalHtml, originalSize, at, history]);
			const selectPreview = react.useCallback((item, size) => setSelected(item.current ? null : { ...item, pageSize: size }), []);
			const html = selected?.html || originalHtml, pageSize = selected?.pageSize || originalSize;
			const [box, setBox] = react.useState({ width: Math.min(1200, window.innerWidth - 36) - 2, height: Math.min(860, window.innerHeight - 36) - 56 });
			// Keep the exact layout viewport used by the card. Measuring animated
			// descendants and feeding their bounds back into the iframe causes a
			// resize loop (especially for vh/vw layouts and off-screen scenery).
			// Only the outer display scale responds to changes in available space.
			react.useEffect(() => {
				const dialog = dialogRef.current;
				if (!dialog) return;
				dialog.showModal();
				return () => { if (dialog.open) dialog.close(); };
			}, []);
			react.useLayoutEffect(() => {
				const resize = () => {
					const width = Math.max(1, Math.min(1200, window.innerWidth - 36) - 2);
					const height = Math.max(1, window.innerHeight - 36 - headRef.current.getBoundingClientRect().height - historyRef.current.getBoundingClientRect().height - 2);
					setBox(current => current.width === width && current.height === height ? current : { width, height });
				};
				resize();
				const observer = new ResizeObserver(resize); observer.observe(headRef.current); observer.observe(historyRef.current);
				window.addEventListener("resize", resize);
				return () => { observer.disconnect(); window.removeEventListener("resize", resize); };
			}, []);
			const scale = Math.min(box.width / pageSize.width, box.height / pageSize.height);
			return react_jsx_runtime.jsxs("dialog", { ref: dialogRef, className: "dshIw_previewZoomDialog", style: { width: Math.max(Math.min(1000, box.width), pageSize.width * scale) + 2, overflowY: "auto" }, "aria-label": title, onCancel: event => { event.preventDefault(); onClose(); }, onClick: event => { if (event.target === event.currentTarget) onClose(); }, children: [
				react_jsx_runtime.jsxs("div", { className: "dshIw_previewZoomPanel", children: [
					react_jsx_runtime.jsxs("header", { ref: headRef, className: "dshIw_previewZoomHead", children: [react_jsx_runtime.jsx("strong", { title, children: title }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", onClick: onClose, children: "关闭" })] }),
					react_jsx_runtime.jsx("div", { className: "dshIw_previewZoomFrame", children: react_jsx_runtime.jsx("div", { className: "dshIw_previewZoomCanvas", style: { width: pageSize.width * scale, height: pageSize.height * scale }, children: react_jsx_runtime.jsx("iframe", { title, sandbox: "allow-scripts", referrerPolicy: "no-referrer", srcDoc: html, style: { width: pageSize.width, height: pageSize.height, transform: `scale(${scale})` } }, selected?.id || "current") }) }),
					react_jsx_runtime.jsxs("section", { ref: historyRef, className: "dshIw_zoomHistory", "aria-label": "历史画面对照", children: [
						react_jsx_runtime.jsxs("div", { className: "dshIw_zoomHistoryHead", children: [react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("strong", { children: "画面对照" }), react_jsx_runtime.jsx("span", { children: (selected ? `历史 ${selected.number} · ` : "当前 · ") + formatIntelligenceTime(selected?.at || at) })] }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", disabled: !selected, onClick: () => setSelected(null), children: "返回当前结果" })] }),
						react_jsx_runtime.jsx("div", { className: "dshIw_zoomHistoryList", children: previews.map(item => react_jsx_runtime.jsxs("div", { className: "dshIw_zoomHistoryItem" + ((item.current ? !selected : selected?.id === item.id) ? " selected" : ""), children: [react_jsx_runtime.jsx(IntelligenceHistoryThumbnail, { item, onSelect: selectPreview }), react_jsx_runtime.jsxs("div", { className: "dshIw_historyCaption", title: formatIntelligenceTime(item.at), children: [react_jsx_runtime.jsx("span", { children: item.current ? "当前" : `历史 ${item.number}` }), react_jsx_runtime.jsx("time", { children: item.at ? new Date(item.at).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }) : "本轮" })] })] }, item.id || item.runKey)) }),
						!history.length && react_jsx_runtime.jsx("p", { className: "dshIw_zoomHistoryEmpty", children: "暂无更早的鹈鹕画面" })
					] })
				] })
			] });
		}
		function IntelligenceAddDialog({ children, onClose }) {
			const dialogRef = react.useRef(null);
			react.useEffect(() => {
				const dialog = dialogRef.current;
				dialog.showModal();
				return () => dialog.close();
			}, []);
			return react_jsx_runtime.jsxs("dialog", { ref: dialogRef, className: "dshIw_editDialog dshIw_addDialog", "aria-labelledby": "dsh-intelligence-add-title", onCancel: event => { event.preventDefault(); onClose(); }, children: [
				react_jsx_runtime.jsxs("div", { className: "dshIw_editHead", children: [react_jsx_runtime.jsx("h2", { id: "dsh-intelligence-add-title", children: "添加检测模型" }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", "aria-label": "关闭添加", onClick: onClose, children: "×" })] }),
				...react.Children.toArray(children)
			] });
		}
		function IntelligenceWorkbenchPage({ goToConversation, loadModelCatalog, settingsFace, runner, slots, renderSlot }) {
			const [keyNamespaces, setKeyNamespaces] = react.useState(() => settingsFace?.getSnapshot().view?.namespaces || []);
			react.useEffect(() => {
				if (!settingsFace) return;
				let active = true;
				const sync = () => { const view = settingsFace.getSnapshot().view; if (active && view) setKeyNamespaces(view.namespaces); };
				const unsubscribe = settingsFace.subscribe(sync);
				void settingsFace.ensure().then(sync).catch(() => {});
				return () => { active = false; unsubscribe(); };
			}, [settingsFace]);
			const [targets, setTargets] = react.useState(readIntelligenceTargets);
			const [targetsLoading, setTargetsLoading] = react.useState(true);
			const targetsChannel = react.useRef(null);
			react.useEffect(() => {
				let active = true;
				const syncTargets = () => {
					void updateIntelligenceTargets().then(next => { if (active) { setTargets(next); setTargetsLoading(false); } }).catch(error => { if (active) setToast(`检测目标读取失败：${error.message || "数据库不可用"}`); });
				};
				const onStorage = event => { if (event.key === INTELLIGENCE_TARGETS_KEY) syncTargets(); };
				const channel = typeof BroadcastChannel === "function" ? new BroadcastChannel("dsh.local.intelligenceTargets.v1") : null;
				targetsChannel.current = channel;
				if (channel) channel.onmessage = syncTargets;
				window.addEventListener("storage", onStorage);
				window.addEventListener("focus", syncTargets);
				syncTargets();
				return () => { active = false; window.removeEventListener("storage", onStorage); window.removeEventListener("focus", syncTargets); channel?.close(); targetsChannel.current = null; };
			}, []);
			const [viewMode, setViewMode] = react.useState(() => { try { return localStorage.getItem("dsh.local.intelligenceView.v1") === "preview" ? "preview" : "detail"; } catch { return "detail"; } });
			const previewOnly = viewMode === "preview";
			const changeViewMode = mode => { setViewMode(mode); setRequestEvidence(null); try { localStorage.setItem("dsh.local.intelligenceView.v1", mode); } catch {} };
			const [timelineNow, setTimelineNow] = react.useState(Date.now);
			react.useEffect(() => {
				const tick = () => setTimelineNow(Date.now());
				const timer = window.setInterval(tick, 15000);
				window.addEventListener("focus", tick);
				document.addEventListener("visibilitychange", tick);
				return () => { window.clearInterval(timer); window.removeEventListener("focus", tick); document.removeEventListener("visibilitychange", tick); };
			}, []);
			const { history, running, progress, historyError, historyLoading, historySaving } = react.useSyncExternalStore(runner.subscribe, runner.getSnapshot);
			const [openingFiles, setOpeningFiles] = react.useState(false);
			// 页签由消费总览组件自行挂载；组件关闭时插槽为空，这里只剩「智力检测」。
			// 插槽通知按微任务合并，版本号才是同步的，所以用版本号驱动读取。
			const spendingTabVersion = react.useSyncExternalStore(
				react.useCallback(listener => slots.subscribe("intelligence.status.tab", listener), [slots]),
				() => slots.getVersion("intelligence.status.tab"),
				() => 0);
			const spendingTabs = slots.entries("intelligence.status.tab");
			void spendingTabVersion;
			const [statusTab, setStatusTab] = react.useState("tests");
			const activeStatusTab = spendingTabs.some(entry => entry.options.id === statusTab) ? statusTab : "tests";
			const openingFilesRef = react.useRef(false);
			const [editingTargetId, setEditingTargetId] = react.useState(null);
			const editingTarget = targets.find(item => item.id === editingTargetId);
			const [addOpen, setAddOpen] = react.useState(false);
			const [entryTargetId, setEntryTargetId] = react.useState(null);
			const [rawAnswer, setRawAnswer] = react.useState("");
			const [toast, setToast] = react.useState("");
			const [draggingTargetId, setDraggingTargetId] = react.useState(null);
			const [dragOverTargetId, setDragOverTargetId] = react.useState(null);
			const [zoomPreview, setZoomPreview] = react.useState(null);
			const [requestEvidence, setRequestEvidence] = react.useState(null);
			const [draft, setDraft] = react.useState({ modelKey: "", mode: "combined", reasoningEffort: "", timeoutMinutes: 10 });
			const [catalogState, setCatalogState] = react.useState({ status: "loading", groups: [], failures: [], error: null });
			const activeTarget = targets.find((target) => target.id === entryTargetId) || null;
			const modelOptions = catalogState.groups.flatMap((group) => (Array.isArray(group.models) ? group.models : []).filter((model) => model && typeof model.id === "string").map((model) => ({
				key: intelligenceModelKey(group.id, model.id),
				providerId: group.id,
				providerName: group.name || group.id,
				modelId: model.id,
				modelName: model.name || model.id,
				group,
				model
			})));
			const selectedModel = modelOptions.find((item) => item.key === draft.modelKey) || null;
			const reasoningChoices = intelligenceReasoningChoices(selectedModel?.model);
			const selectedReasoning = reasoningChoices.some((item) => item.id === draft.reasoningEffort) ? draft.reasoningEffort : "";
			react.useEffect(() => {
				if (!toast) return;
				const timeout = window.setTimeout(() => setToast(""), toast.includes("未保存") ? 10000 : 1800);
				return () => window.clearTimeout(timeout);
			}, [toast]);
			react.useEffect(() => {
				let active = true;
				setCatalogState((current) => ({ ...current, status: "loading", error: null }));
				Promise.resolve().then(() => loadModelCatalog()).then((response) => {
					if (response?.ok === false) throw new Error(`${response.error?.code || "model_catalog"}: ${response.error?.message || "无法读取模型目录"}`);
					const value = response?.value ?? response;
					const groups = Array.isArray(value?.groups) ? value.groups.filter((group) => group && typeof group.id === "string") : [];
					const failures = Array.isArray(value?.failures) ? value.failures : [];
					if (!active) return;
					setCatalogState({ status: "ready", groups, failures, error: null });
					const options = groups.flatMap((group) => (Array.isArray(group.models) ? group.models : []).filter((model) => model && typeof model.id === "string").map((model) => ({ key: intelligenceModelKey(group.id, model.id) })));
					const defaultSelection = value?.default;
					const defaultKey = defaultSelection?.provider && defaultSelection?.model ? intelligenceModelKey(defaultSelection.provider, defaultSelection.model) : "";
					setDraft((current) => current.modelKey && options.some((item) => item.key === current.modelKey) ? current : { ...current, modelKey: options.find((item) => item.key === defaultKey)?.key || options[0]?.key || "" });
				}).catch((error) => {
					if (active) setCatalogState({ status: "error", groups: [], failures: [], error: error instanceof Error ? error.message : String(error) });
				});
				return () => { active = false; };
			}, []);
			const refreshModels = () => {
				setCatalogState((current) => ({ ...current, status: "loading", error: null }));
				Promise.resolve().then(() => loadModelCatalog()).then((response) => {
					if (response?.ok === false) throw new Error(`${response.error?.code || "model_catalog"}: ${response.error?.message || "无法读取模型目录"}`);
					const value = response?.value ?? response;
					const groups = Array.isArray(value?.groups) ? value.groups.filter((group) => group && typeof group.id === "string") : [];
					const failures = Array.isArray(value?.failures) ? value.failures : [];
					setCatalogState({ status: "ready", groups, failures, error: null });
					setDraft((current) => {
						const currentStillExists = groups.some((group) => (group.models || []).some((model) => intelligenceModelKey(group.id, model.id) === current.modelKey));
						if (currentStillExists) return current;
						const defaultSelection = value?.default;
						const defaultKey = defaultSelection?.provider && defaultSelection?.model ? intelligenceModelKey(defaultSelection.provider, defaultSelection.model) : "";
						const first = groups.flatMap((group) => group.models || [])[0];
						return { ...current, modelKey: groups.some((group) => (group.models || []).some((model) => intelligenceModelKey(group.id, model.id) === defaultKey)) ? defaultKey : first ? intelligenceModelKey(groups.find((group) => (group.models || []).includes(first))?.id || "", first.id) : "" };
					});
				}).catch((error) => setCatalogState((current) => ({ ...current, status: "error", error: error instanceof Error ? error.message : String(error) })));
			};
			const openGeneratedFolder = async () => {
				if (openingFilesRef.current) return;
				openingFilesRef.current = true;
				setOpeningFiles(true);
				try {
					const response = await fetch("/api/intelligence-artifact", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "open-folder" }) });
					const result = await response.json();
					if (response.status === 400 && result.error === '没有可保存的 SVG 动画') throw new Error('后台仍是旧版本，请在当前任务结束后重启 Harness 再打开文件夹');
					if (!response.ok || !result.ok) throw new Error(result.error || "打开生成文件夹失败");
				} catch (error) { setToast(error.message || "打开生成文件夹失败"); }
				finally { openingFilesRef.current = false; setOpeningFiles(false); }
			};
			const copyPrompt = (mode) => {
				const prompt = getIntelligencePrompt(mode);
				try { navigator.clipboard?.writeText(prompt); } catch {}
				setToast("测试提示词已复制");
			};
			const addTarget = async () => {
				if (targetsLoading) return;
				if (!selectedModel) {
					setToast("请先从模型列表选择一个模型");
					return;
				}
				const target = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: selectedModel.modelName, provider: selectedModel.providerName, model: selectedModel.modelName, providerId: selectedModel.providerId, modelId: selectedModel.modelId, mode: "combined", reasoningEffort: selectedReasoning, timeoutMinutes: draft.timeoutMinutes };
				let next;
				try { next = await updateIntelligenceTargets(current => [...current, target]); }
				catch (error) { setToast(`检测目标未保存：${error.message || "浏览器存储不可用"}`); return; }
				setTargets(next);
				targetsChannel.current?.postMessage("updated");
				setDraft({ modelKey: selectedModel.key, mode: "combined", reasoningEffort: selectedReasoning, timeoutMinutes: draft.timeoutMinutes });
				setAddOpen(false);
				setToast("检测目标已添加");
			};
			const saveTargetEdit = async value => {
				if (targetsLoading) return;
				const target = targets.find(item => item.id === editingTargetId);
				if (!target || runner.getSnapshot().running.includes(target.id)) return;
				const selected = modelOptions.find(item => item.providerId === target.providerId && item.modelId === value.modelId);
				if (!selected || catalogState.status !== "ready") { setToast("请选择此供应商的可用模型"); return; }
				const reasoningEffort = intelligenceReasoningChoices(selected.model).some(item => item.id === value.reasoningEffort) ? value.reasoningEffort : "";
				const timeoutMinutes = [3, 5, 10, 20, 30].includes(value.timeoutMinutes) ? value.timeoutMinutes : 10;
				runner.identifyHistory(target);
				let next;
				try { next = await updateIntelligenceTargets(current => {
					if (!current.some(item => item.id === target.id)) throw new Error("目标已在其他窗口删除");
					return current.map(item => item.id === target.id ? { ...item, modelId: selected.modelId, model: selected.modelName, name: selected.modelName, provider: selected.providerName, reasoningEffort, timeoutMinutes } : item);
				}); }
				catch (error) { setToast(`检测设置未保存：${error.message || "浏览器存储不可用"}`); return; }
				setTargets(next);
				targetsChannel.current?.postMessage("updated");
				setEditingTargetId(null);
				setToast("检测设置已保存");
			};
			const removeTarget = async (target) => {
				if (targetsLoading) return;
				if (running.includes(target.id)) return;
				if (!window.confirm(`删除“${target.name}”及其本机检测记录？`)) return;
				let nextTargets;
				try { nextTargets = await updateIntelligenceTargets(current => current.filter(item => item.id !== target.id)); }
				catch (error) { setToast(`删除未保存：${error.message || "浏览器存储不可用"}`); return; }
				setTargets(nextTargets);
				targetsChannel.current?.postMessage("updated");
				runner.clearHistory(target.id);
				if (entryTargetId === target.id) { setEntryTargetId(null); setRawAnswer(""); }
			};
			const reorderTargets = async (sourceId, destinationId) => {
				if (targetsLoading) return;
				if (!sourceId || !destinationId || sourceId === destinationId) return;
				let next;
				try { next = await updateIntelligenceTargets(current => {
					const sourceIndex = current.findIndex(item => item.id === sourceId), destinationIndex = current.findIndex(item => item.id === destinationId);
					if (sourceIndex < 0 || destinationIndex < 0) return current;
					const reordered = [...current], [moved] = reordered.splice(sourceIndex, 1);
					reordered.splice(destinationIndex, 0, moved);
					return reordered;
				}); }
				catch (error) { setToast(`排序未保存：${error.message || "浏览器存储不可用"}`); return; }
				setTargets(next);
				targetsChannel.current?.postMessage("updated");
			};
			const recordAnswer = () => {
				if (!activeTarget || !rawAnswer.trim()) return;
				runner.record(activeTarget, rawAnswer, evaluateIntelligenceWorkbench(activeTarget.mode, rawAnswer));
				setRawAnswer("");
				setEntryTargetId(null);
				setToast("检测结果已加入状态");
			};

			const idleTargets = targets.filter(target => target.providerId && target.modelId && !running.includes(target.id));
			const runningTargetCount = targets.filter(target => running.includes(target.id)).length;
			const runAllTargets = (testMode = "combined") => {
				const active = new Set(runner.getSnapshot().running);
				const available = targets.filter(target => target.providerId && target.modelId && !active.has(target.id));
				if (!available.length) return;
				// 全部检测不按卡片顺序排队：每个目标同时进入检测中，
				// 浏览器连接数只影响请求发出的先后，不限制同时进行的数量。
				for (const target of available) void runner.run(target, testMode);
				setToast(`已同时启动 ${available.length} 个${testMode === "candy" ? "糖果" : testMode === "pelican" ? "鹈鹕" : "组合"}检测${active.size ? "，正在检测的目标已跳过" : ""}`);
			};
			const cards = targets.map((target) => {
				const records = history.filter((item) => item.targetId === target.id && (!item.modelId || item.modelId === target.modelId && item.providerId === target.providerId)).sort((a, b) => b.at - a.at);
				return { target, display: { ...resolveIntelligenceTargetDisplay(target, modelOptions), keyName: intelligenceTargetKeyName(target, keyNamespaces) }, records, latest: records[0] || null };
			});
			return react_jsx_runtime.jsxs("main", { className: "dshIt_statusPage dshIw_workbench" + (previewOnly ? " dshIw_previewMode" : ""), children: [
				react_jsx_runtime.jsxs("header", { className: "dshIt_statusHead", children: [react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsxs("h1", { children: ["服务运行状态", react_jsx_runtime.jsx("span", { className: "dshIt_liveDot", "aria-hidden": "true" })] }), react_jsx_runtime.jsx("p", { children: "供应商智力检测与模型表现" })] }), react_jsx_runtime.jsxs("div", { className: "dshIt_statusHeadRight", children: [react_jsx_runtime.jsx("span", { children: "本机记录 · 实时" }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", onClick: goToConversation, children: "返回对话" })] })] }),
				react_jsx_runtime.jsxs("div", { className: "dshIt_statusTabs", role: "tablist", children: [react_jsx_runtime.jsx("button", { type: "button", role: "tab", "aria-selected": activeStatusTab === "tests", className: activeStatusTab === "tests" ? "active" : undefined, onClick: () => setStatusTab("tests"), children: "智力检测" }), spendingTabs.map(entry => react_jsx_runtime.jsx("button", { type: "button", role: "tab", "aria-selected": activeStatusTab === entry.options.id, className: activeStatusTab === entry.options.id ? "active" : undefined, onClick: () => setStatusTab(entry.options.id), children: entry.options.label }, entry.options.id)), activeStatusTab === "tests" && react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_openFiles", disabled: openingFiles, title: "在资源管理器中打开生成文件夹，不恢复已删除的文件", onClick: () => void openGeneratedFolder(), children: openingFiles ? "正在打开…" : "打开生成文件夹 ↗" })] }),
				activeStatusTab !== "tests" && react_jsx_runtime.jsx("div", { className: "dshIt_statusPage dshIt_spendingTab", children: renderSlot("intelligence.status.tab", {}, { only: activeStatusTab }) }),
				activeStatusTab === "tests" && react_jsx_runtime.jsxs(react.Fragment, { children: [
				react_jsx_runtime.jsxs("section", { className: "dshIt_statusIntro", children: [react_jsx_runtime.jsx("div", { className: "dshIt_statusIntroIcon", children: "✧" }), react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("h2", { children: "固定题答复表现" }), react_jsx_runtime.jsx("p", { children: "点击测试按钮同时检测两题；悬停片刻或长按可选单项。单题连接异常最多重试 3 次，重试可能再次计费。返回对话后检测仍会继续。" })] }), react_jsx_runtime.jsxs("div", { className: "dshIt_introActions", children: [react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", onClick: () => copyPrompt("candy"), children: "复制糖果题" }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", onClick: () => copyPrompt("pelican"), children: "复制鹈鹕题" })] })] }),
				react_jsx_runtime.jsxs("div", { className: "dshIw_toolbar", children: [react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsxs("h2", { children: ["检测结果", react_jsx_runtime.jsx("span", { className: "dshIt_countBadge", children: `${targets.length} 个检测目标` })] }), react_jsx_runtime.jsx("p", { children: "点击测两题，悬停或长按选单项；全部检测适用于所有空闲模型。" })] }), react_jsx_runtime.jsxs("div", { className: "dshIw_toolbarRight", children: [react_jsx_runtime.jsx("div", { className: "dshIw_viewSwitch", role: "group", "aria-label": "显示方式", children: [["detail", "详细模式"], ["preview", "预览模式"]].map(([mode, label]) => react_jsx_runtime.jsx("button", { type: "button", "aria-pressed": viewMode === mode, onClick: () => changeViewMode(mode), children: label }, mode)) }), react_jsx_runtime.jsxs("div", { className: "dshIt_legend", children: [react_jsx_runtime.jsx("span", { children: "● 正常" }), react_jsx_runtime.jsx("span", { children: "● 半降智" }), react_jsx_runtime.jsx("span", { children: "● 降智" }), react_jsx_runtime.jsx("span", { children: "● 未检测" })] }), react_jsx_runtime.jsx(IntelligenceTestButton, { className: "dshIt_ghost dshIw_runAll", disabled: !idleTargets.length, onRun: runAllTargets, label: !idleTargets.length && runningTargetCount ? `检测中 · ${runningTargetCount}` : "全部检测" }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_primary dshIw_add", onClick: () => setAddOpen(true), children: "+ 添加检测模型" })] })] }),
				addOpen && react_jsx_runtime.jsxs(IntelligenceAddDialog, { onClose: () => setAddOpen(false), children: [react_jsx_runtime.jsxs("div", { className: "dshIw_formGrid", children: [react_jsx_runtime.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [react_jsx_runtime.jsx("label", { className: "dshIt_label", htmlFor: "dsh-intelligence-add-model", children: "已配置模型" }), react_jsx_runtime.jsx(IntelligenceModelPicker, { value: draft.modelKey, disabled: catalogState.status !== "ready" || modelOptions.length === 0, placeholder: catalogState.status === "loading" ? "正在读取模型列表…" : modelOptions.length ? "请选择供应商、密钥和模型" : "没有可用模型", groups: intelligenceCatalogGroups(catalogState.groups, keyNamespaces), searchable: true, onChange: modelKey => setDraft({ ...draft, modelKey }), ariaLabel: "已配置模型" })] }), react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("label", { className: "dshIt_label", children: "检测方式" }), react_jsx_runtime.jsx("div", { className: "dshIt_mode", children: "组合检测 · 鹈鹕 + 糖果" })] }), react_jsx_runtime.jsx(IntelligenceRunOptions, { value: { ...draft, reasoningEffort: selectedReasoning }, model: selectedModel?.model, onChange: patch => setDraft(current => ({ ...current, ...patch })) }), react_jsx_runtime.jsxs("div", { className: "dshIw_modelStatus", children: [catalogState.error ? `模型列表读取失败：${catalogState.error}` : catalogState.status === "loading" ? "正在从 Harness 模型目录读取…" : modelOptions.length ? `已读取 ${modelOptions.length} 个模型，可直接选择` : "模型目录为空，请先在设置中配置模型", catalogState.failures.length > 0 ? `（${catalogState.failures.length} 个供应商读取失败）` : ""] })] }), react_jsx_runtime.jsxs("div", { className: "dshIw_formFoot", children: [react_jsx_runtime.jsxs("span", { className: "dshIw_formNote", children: ["目标和记录只保存在本机浏览器。", catalogState.error ? " " : " 模型来自当前 Harness 配置。"] }), react_jsx_runtime.jsxs("div", { className: "dshIw_formActions", children: [react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", onClick: refreshModels, disabled: catalogState.status === "loading", children: "刷新模型列表" }), react_jsx_runtime.jsxs("div", { className: "dshIw_formCommitActions", children: [react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", onClick: () => setAddOpen(false), children: "取消" }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_primary", onClick: addTarget, disabled: targetsLoading || !selectedModel || catalogState.status !== "ready", children: "保存检测目标" })] })] })] })] }),
				entryTargetId && activeTarget && react_jsx_runtime.jsxs("section", { className: "dshIw_form dshIt_entry", children: [react_jsx_runtime.jsxs("div", { className: "dshIw_entryTitle", children: [react_jsx_runtime.jsx("strong", { children: `录入：${activeTarget.name}` }), react_jsx_runtime.jsx("span", { children: activeTarget.mode === "pelican" ? "鹈鹕 SVG 测试" : "糖果测试 · 预期 21 颗" })] }), react_jsx_runtime.jsx("label", { className: "dshIt_label", children: "模型原始答复" }), react_jsx_runtime.jsx("textarea", { className: "dshIt_textarea", value: rawAnswer, onChange: (event) => setRawAnswer(event.target.value), placeholder: activeTarget.mode === "pelican" ? "粘贴模型返回的 SVG 或包含 SVG 的代码块" : "粘贴模型完整回答；系统会读取最终答案是否为 21" }), react_jsx_runtime.jsxs("div", { className: "dshIt_actions", children: [react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", onClick: () => copyPrompt(activeTarget.mode), children: "复制本题" }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_primary", disabled: !rawAnswer.trim(), onClick: recordAnswer, children: "检查并记录" })] })] }),
				(historyLoading || historySaving) && react_jsx_runtime.jsx("p", { role: "status", children: historyLoading ? "正在读取检测记录…" : "正在保存检测记录…" }),
                historyError && react_jsx_runtime.jsxs("div", { role: "alert", style: { color: "#ef6b6b" }, children: [react_jsx_runtime.jsx("p", { children: historyError }), react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", onClick: () => runner.exportHistory(), children: "导出检测记录备份" })] }),
				targets.length === 0 ? react_jsx_runtime.jsx("div", { className: "dshIt_emptyState", children: "还没有检测目标。点击“添加检测模型”，每次同时检测鹈鹕动画和糖果推理。" }) : react_jsx_runtime.jsx("div", { className: "dshIt_cardList", children: cards.map((card) => {
					const { target, display, latest, records } = card;
					const isRunning = running.includes(target.id);
					const questionResults = isRunning ? progress[target.id]?.questions || [] : latest?.questions || (latest ? [latest] : []);
					const selectedTestMode = (isRunning ? progress[target.id]?.testMode : latest?.testMode) || "combined";
					const shown = intelligenceDisplayedQuestions(target, records, isRunning ? progress[target.id] : undefined);
					const pelican = shown.pelican.question;
					const candy = shown.candy.question;
					const previewSvg = pelican?.preview || "";
					const previewSrc = previewSvg;
					const previewRunKey = shown.pelican.runKey;
					const requestTraceText = questionResults.map(q => `${q.mode === 'candy' ? '糖果' : '鹈鹕'} · 请求：${q.requestId || '旧记录未记录'} · 上游响应：${q.upstreamResponseId || '未提供'}${typeof q.serverElapsedMs === 'number' ? ` · 后台耗时 ${(q.serverElapsedMs / 1000).toFixed(1)} 秒` : ''}`).join('\n');
					return react_jsx_runtime.jsxs("article", {
						className: "dshIt_statusCard" + (dragOverTargetId === target.id ? " drag-over" : "") + (draggingTargetId === target.id ? " dragging" : ""),
						onDragOver: event => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; if (dragOverTargetId !== target.id) setDragOverTargetId(target.id); },
						onDrop: event => { event.preventDefault(); reorderTargets(event.dataTransfer.getData("text/plain"), target.id); setDraggingTargetId(null); setDragOverTargetId(null); },
						children: [
							react_jsx_runtime.jsxs("div", { className: "dshIt_cardTop", draggable: true, title: "按住顶部拖动调整顺序", onDragStart: event => { const id = target.id; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", id); setDraggingTargetId(id); }, onDragEnd: () => { setDraggingTargetId(null); setDragOverTargetId(null); }, children: [
								react_jsx_runtime.jsx("div", { className: "dshIt_cardIdentity", children: react_jsx_runtime.jsxs("h3", { className: "dshIt_identityTitle", title: `${display.provider} · ${display.model}`, children: [
									react_jsx_runtime.jsx("span", { className: "dshIt_provider", children: display.provider }),
									react_jsx_runtime.jsx("span", { className: "dshIt_identityDivider", children: "·" }),
									react_jsx_runtime.jsx("span", { className: "dshIt_model", children: display.model }),
									display.keyName && react_jsx_runtime.jsx("small", { className: "dshIt_keyName", title: `密钥：${display.keyName}`, children: display.keyName })
								] }) }),
								(previewOnly || isRunning || latest) && react_jsx_runtime.jsx("span", { className: "dshIt_cardVerdict " + (isRunning ? "gray" : intelligenceResultStatus(latest).tone), children: isRunning ? selectedTestMode === "candy" ? "糖果检测中" : selectedTestMode === "pelican" ? "鹈鹕检测中" : "测试进行中" : intelligenceResultStatus(latest).label }),
								react_jsx_runtime.jsxs("div", { className: "dshIw_cardActions", children: [
									!previewOnly && questionResults.length > 0 && react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", draggable: false, onClick: () => setRequestEvidence(target.id), title: pelican?.cacheWarning || candy?.cacheWarning || "查看本轮请求与保存详情", children: "请求核查" }),
									!previewOnly && react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", draggable: false, disabled: isRunning || targetsLoading, onClick: () => setEditingTargetId(target.id), children: "编辑" }),
									react_jsx_runtime.jsx(IntelligenceTestButton, { className: "dshIt_primary", running: isRunning, onCancel: () => runner.cancel(target.id), onRun: mode => void runner.run(target, mode), label: isRunning ? "取消测试" : "开始测试" }),
									!previewOnly && react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_ghost", draggable: false, disabled: isRunning || targetsLoading, onClick: () => removeTarget(target), children: "删除" })
								] })
							] }),
						react_jsx_runtime.jsxs("div", { className: "dshIw_cardBody", children: [
							!previewOnly && react_jsx_runtime.jsx("div", { className: "dshIw_cardMain", children: react_jsx_runtime.jsx(IntelligenceTimeline, { records, now: timelineNow, targetId: target.id, progress: progress[target.id] }, `${target.id}-${target.modelId}`) }),
							react_jsx_runtime.jsxs("aside", { className: "dshIw_preview", children: [
								react_jsx_runtime.jsxs("div", { className: "dshIw_previewHead", title: requestTraceText, children: [react_jsx_runtime.jsx("strong", { children: "鹈鹕原始预览" }), react_jsx_runtime.jsx("span", { children: shown.pelican.retained ? `上次鹈鹕 · ${formatIntelligenceTime(shown.pelican.at)}` : isRunning ? `本轮检测 · ${formatIntelligenceTime(progress[target.id].startedAt)}` : shown.pelican.at ? `最近结果 · ${formatIntelligenceTime(shown.pelican.at)}` : "等待检测" })] }),
								previewSrc ? react_jsx_runtime.jsx(IntelligenceHtmlPreview, { title: `${target.name} 原始 HTML 预览`, html: previewSrc, saveControl: react_jsx_runtime.jsx(IntelligenceSaveOverlay, { question: pelican, onRetry: shown.pelican.recordId && (!isRunning || shown.pelican.retained) ? () => void runner.retryArtifact(shown.pelican.recordId) : undefined }), onDoubleClick: pageSize => setZoomPreview({ html: previewSrc, pageSize, at: shown.pelican.at, history: intelligencePreviewHistory(target, records, shown.pelican), title: `${display.provider} · ${display.model} 原始 HTML 预览` }) }, previewRunKey) : react_jsx_runtime.jsx(IntelligencePreviewPlaceholder, { question: pelican, selectedTestMode }),
								react_jsx_runtime.jsxs("div", { className: "dshIw_candyResult " + intelligenceCandyTone(candy), "aria-label": "糖果推理结果", children: [
									react_jsx_runtime.jsxs("div", { children: [react_jsx_runtime.jsx("span", { title: shown.candy.at ? `糖果检测时间 · ${formatIntelligenceTime(shown.candy.at)}` : undefined, children: shown.candy.retained ? "糖果推理 · 上次答案" : "糖果推理 · 最终答案" }), react_jsx_runtime.jsx("small", { title: candy?.cacheWarning || undefined, children: (candy?.pending ? intelligenceProgressLabel(candy) : !candy ? selectedTestMode === "pelican" ? "本轮未检测糖果" : "尚未检测" : candy.completed === false ? candy.raw : candy.answer == null ? "未识别到数值" : candy.answer === 21 ? "通过" : "未通过") + (candy?.cacheWarning ? " · " + intelligenceFreshnessLabel(candy) : "") })] }),
									react_jsx_runtime.jsx("strong", { children: candy?.answer ?? "—" })
								] }),
							] })
						] }),
						] }, target.id);
				}) }),
				!previewOnly && history.length > 0 && react_jsx_runtime.jsx("button", { type: "button", className: "dshIt_clear", onClick: () => runner.clearHistory(), children: "清除本机检测记录" }),
				editingTarget && react_jsx_runtime.jsx(IntelligenceTargetEditor, { target: editingTarget, modelOptions, catalogState, onRefresh: refreshModels, disabled: running.includes(editingTarget.id), onSave: saveTargetEdit, onClose: () => setEditingTargetId(null) }, editingTarget.id),
				!previewOnly && requestEvidence && react_jsx_runtime.jsx(IntelligenceRequestEvidence, { title: (() => { const card = cards.find(card => card.target.id === requestEvidence); return card ? `${card.display.provider} · ${card.display.model}` : "检测目标"; })(), questions: progress[requestEvidence]?.questions || cards.find(card => card.target.id === requestEvidence)?.latest?.questions || [], onClose: () => setRequestEvidence(null) }),
				zoomPreview && react_jsx_runtime.jsx(IntelligencePreviewLightbox, { html: zoomPreview.html, title: zoomPreview.title, pageSize: zoomPreview.pageSize, at: zoomPreview.at, history: zoomPreview.history, onClose: () => setZoomPreview(null) }, zoomPreview.title),
				toast && react_jsx_runtime.jsx("div", { className: "dshIw_toast", role: "status", children: toast })
				] })
			] });
		}

    const inject = ["slots", "locale", "layout", "remote", "remote.session", "configForms"];
    const COMPAT_LAYERS_KEY = "dsh.local.compat.v1";
    const COMPAT_LAYERS = [
      ["modelMenu", "模型切换与多密钥菜单", "输入框按供应商、命名密钥、模型分组选择"],
      ["models", "模型设置", "供应商、密钥和模型编辑页"],
      ["effort", "思考滑条", "模型菜单里的推理强度滑条"],
      ["sessions", "会话菜单", "会话行的归档按钮和会话菜单"],
      ["skills", "技能菜单", "输入框 / 后面的技能列表"]
    ];
    function readCompatLayers() { return readCompatPreferences(); }
    const COMPAT_APPLIED_LAYERS = readCompatLayers();
    function CompatLayerSwitches() {
      const [layers, setLayers] = react.useState(readCompatLayers);
      const [appliedLayers] = react.useState(() => COMPAT_APPLIED_LAYERS);
      const [error, setError] = react.useState("");
      const [changed, setChanged] = react.useState(() => COMPAT_LAYERS.some(([id]) => layers[id] !== appliedLayers[id]));
      const enabledCount = COMPAT_LAYERS.filter(([id]) => layers[id]).length;
      const save = next => {
        try {
          const saved = writeCompatPreferences(next);
          setLayers(saved.layers);
          setChanged(true);
          setError("");
        } catch { setError("开关保存失败：浏览器本地存储与备用 Cookie 均无法写入；原设置未改变。无需清空历史，请检查此站点的存储权限。"); }
      };
      // Use the same shared control as the host component rows, including theme,
      // sizing, thumb, focus and disabled behavior; do not restyle a second switch.
      const switchControl = (label, checked, onClick) => react_jsx_runtime.jsx(_deepseek_ai_dsh_client_ui_primitives.Switch, {
        label, checked, onChange: () => onClick()
      });
      const iconPaths = [
        ["M8 15h24m-6-6 6 6-6 6M32 33H8m6-6-6 6 6 6", "blue"],
        ["M10 12h28M10 24h28M10 36h28M18 8v8M30 20v8M20 32v8", "teal"],
        ["M10 32h5v7h-5zM22 23h5v16h-5zM34 12h5v27h-5z", "orange"],
        ["M11 12h26v18H23l-8 7v-7h-4zM18 19h12M18 24h8", "violet"],
        ["m18 15-9 9 9 9m12-18 9 9-9 9M27 10l-6 28", "blue"]
      ];
      const layerIcon = index => {
        const [path, tone] = iconPaths[index];
        return react_jsx_runtime.jsx("span", { className: "dshPd_layerMark", "aria-hidden": true, children:
          react_jsx_runtime.jsx("span", { className: "dshPd_iconTile " + tone, children:
            react_jsx_runtime.jsx("svg", { viewBox: "0 0 48 48", fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round", children: react_jsx_runtime.jsx("path", { d: path }) })
          })
        });
      };
      const layerStatus = id => {
        const pending = layers[id] !== appliedLayers[id];
        return react_jsx_runtime.jsxs("span", { className: "dshPd_layerState", children: [
          react_jsx_runtime.jsx(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: pending ? "warning" : appliedLayers[id] ? "done" : "idle" }),
          pending ? "待刷新" : appliedLayers[id] ? "运行中" : "已关闭"
        ] });
      };
      return react_jsx_runtime.jsxs("section", { className: "dshPd_note", "aria-label": "配套兼容层组件", children: [
        react_jsx_runtime.jsxs("div", { className: "dshPd_noteHead", children: [
          react_jsx_runtime.jsxs("div", { children: [
            react_jsx_runtime.jsx("h3", { children: "配套兼容层" }),
            react_jsx_runtime.jsx("p", { children: "模型切换、设置与菜单增强 · 5 个子项" })
          ] }),
          react_jsx_runtime.jsxs("div", { className: "dshPd_layerControl", children: [
            react_jsx_runtime.jsx("span", { className: "dshPd_enabledCount", children: enabledCount + " / 5 已启用" }),
            switchControl("配套兼容层全部开关", enabledCount > 0, () => save(Object.fromEntries(COMPAT_LAYERS.map(([id]) => [id, enabledCount === 0]))))
          ] })
        ] }),
        react_jsx_runtime.jsx("div", { className: "dshPd_layers", children: COMPAT_LAYERS.map(([id, title, body], index) => react_jsx_runtime.jsxs("div", { className: "dshPd_layer", children: [
          layerIcon(index),
          react_jsx_runtime.jsxs("div", { className: "dshPd_layerText", children: [react_jsx_runtime.jsx("b", { children: title }), react_jsx_runtime.jsx("small", { children: body })] }),
          react_jsx_runtime.jsxs("div", { className: "dshPd_layerControl", children: [
            layerStatus(id),
            switchControl(title, layers[id], () => save({ ...layers, [id]: !layers[id] }))
          ] })
        ] }, id)) }),
        react_jsx_runtime.jsxs("div", { className: "dshPd_layerFoot", children: [
          react_jsx_runtime.jsx("p", { children: changed ? "已保存，刷新页面后生效。供应商、密钥和历史数据不会删除。" : "这些开关只控制界面增强。关闭后恢复 Harness 原始界面，不隐藏入口；关闭思考滑条恢复普通档位选项。关闭模型菜单时滑条增强也不生效。后台密钥路由与请求兼容补丁保留。" }),
          changed && react_jsx_runtime.jsx("button", { type: "button", className: "dshPd_reload", onClick: () => window.location.reload(), children: "刷新生效" })
        ] }),
        error && react_jsx_runtime.jsx("p", { className: "dshPd_error", role: "alert", children: error })
      ] });
    }
    function PersonalPluginDetails() {
      const [openingFolder, setOpeningFolder] = react.useState(false);
      const [folderError, setFolderError] = react.useState("");
      const [folderNotice, setFolderNotice] = react.useState("");
      const openPluginFolder = async () => {
        if (openingFolder) return;
        setOpeningFolder(true);
        setFolderError("");
        setFolderNotice("");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetch("/api/personal-plugin-folder", { method: "POST", credentials: "same-origin", cache: "no-store", signal: controller.signal, headers: { "content-type": "application/json" }, body: "{}" });
          const result = await response.json().catch(() => null);
          if (response.status === 404 && !result?.path) throw new Error("后台尚未加载文件夹接口，请重新启动 Harness 后再试。");
          if (!response.ok || !result?.ok) throw new Error((result?.error || "打开插件文件夹失败") + (result?.path ? " · " + result.path : ""));
          setFolderNotice("已请求资源管理器打开：" + result.path);
        } catch (error) { setFolderError(error.name === "AbortError" ? "打开文件夹请求超时，请重启 Harness 后再试。" : error.message || "打开插件文件夹失败"); }
        finally { clearTimeout(timeout); setOpeningFolder(false); }
      };
      if (typeof document !== "undefined") {
        let tag = document.querySelector("style[data-plugin-css=" + JSON.stringify(intelligenceWorkbenchTag) + "]");
        if (tag === null) {
          tag = document.createElement("style");
          tag.dataset.plugin = "@local/dsh-personal-customizations";
          tag.dataset.pluginCss = intelligenceWorkbenchTag;
          document.head.appendChild(tag);
        }
        if (tag.textContent !== intelligenceWorkbenchCss) tag.textContent = intelligenceWorkbenchCss;
      }
      const featureIcon = path => react_jsx_runtime.jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: react_jsx_runtime.jsx("path", { d: path }) });
      const cards = [
        ["blue", "M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z", "智力检测", "两道组合题，观察模型表现；原始回答与检测记录留在本机。"],
        ["teal", "M4 6h16v13H4zM4 10h16M15 14h2M7 6V4h10", "余额与消费", "逐把密钥查询余额，持续记录每天的消费变化。"],
        ["orange", "M4 20h16M6 16v-4M12 16V8M18 16V4", "消费总览", "月历、用量与费用估算，把花费看得更清楚。"],
        ["violet", "M6 4h12v17l-6-4-6 4V4ZM9 8h6M9 11h4", "常用提示词", "收藏常用表达，一键填入输入框，不自动发送。"]
      ];
      return react_jsx_runtime.jsxs("section", { className: "dshPd_panel", children: [
        react_jsx_runtime.jsxs("div", { className: "dshPd_head", children: [
          react_jsx_runtime.jsxs("div", { children: [
            react_jsx_runtime.jsx("span", { className: "dshPd_eyebrow", children: "STARWAVE · 星潮工具箱" }),
            react_jsx_runtime.jsx("h3", { children: "让 AI 工作流更顺手" }),
            react_jsx_runtime.jsx("p", { children: "检测模型，理清花费，收藏灵感。4 个独立组件，按需开启。" })
          ] }),
          react_jsx_runtime.jsxs("div", { className: "dshPd_headActions", children: [
            react_jsx_runtime.jsx("span", { className: "dshPd_count", children: "适配 0.2.0-rc.2" }),
            react_jsx_runtime.jsx("button", { type: "button", className: "dshPd_folder", disabled: openingFolder, title: "打开完整插件源码目录 plugins/personal-toolbox（按功能分类，包含全部兼容层）", onClick: () => void openPluginFolder(), children: openingFolder ? "正在打开…" : "打开插件文件夹 ↗" })
          ] })
        ] }),
        react_jsx_runtime.jsx("div", { className: "dshPd_grid", children: cards.map(([tone, mark, title, body]) => react_jsx_runtime.jsxs("article", { className: "dshPd_card", children: [
          react_jsx_runtime.jsx("span", { className: "dshPd_mark " + tone, "aria-hidden": "true", children: featureIcon(mark) }),
          react_jsx_runtime.jsx("strong", { children: title }),
          react_jsx_runtime.jsx("p", { children: body })
        ] }, title)) }),
        react_jsx_runtime.jsxs("div", { className: "dshPd_compatIntro", children: [
          react_jsx_runtime.jsx("span", { className: "dshPd_mark violet", "aria-hidden": true, children: featureIcon("M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4") }),
          react_jsx_runtime.jsxs("div", { children: [
            react_jsx_runtime.jsx("strong", { children: "配套兼容层" }),
            react_jsx_runtime.jsx("p", { children: "模型切换与多密钥菜单、模型设置、思考滑条、会话菜单、技能菜单。下方提供总开关与 5 个子项开关。" })
          ] }),
          react_jsx_runtime.jsx("span", { className: "dshPd_count", children: "5 个子项" })
        ] }),
        folderError && react_jsx_runtime.jsx("p", { className: "dshPd_error", role: "alert", children: folderError }),
        folderNotice && react_jsx_runtime.jsx("p", { className: "dshPd_foot", role: "status", children: folderNotice })
      ] });
    }
    // Reuse the data owner across hot toggles so an aborted run finishing its
    // history write cannot race a second runner that loaded an older snapshot.
    let retainedIntelligenceRunner;
    function apply(ctx) {
      const intelligenceRunner = retainedIntelligenceRunner ??= createIntelligenceRunner();
      ctx.effect(() => () => {
        intelligenceRunner.dispose();
      }, "personal-customizations: background tests");
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: "intelligence-test",
				order: 30,
				label: "智力检测"
			}, ({ size }) => react_jsx_runtime.jsx("span", {
				style: { fontSize: size ? `${size}px` : "16px", lineHeight: 1 },
				children: "✦"
			})));
			const intelligenceSettingsFace = ctx.configForms.describe();
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: "intelligence-test",
				children: {
					"intelligence.status.tab": { kind: "list", scope: "root" }
				},
				inject: () => ({
					goToConversation: () => ctx.get("layout")?.selectPanel(null),
					loadModelCatalog: () => ctx.remote.session.modelCatalog(),
					settingsFace: intelligenceSettingsFace,
					runner: intelligenceRunner,
					// 渲染器只自动提供 renderSlot，页签列表要自己订阅插槽表。
					slots: ctx.slots
				})
			}, IntelligenceWorkbenchPage));
      ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register({
        name: "plugins.bundle.config",
        key: "@local/dsh-personal-customizations"
      }, PersonalPluginDetails));
      ctx.slots.inject("plugins.detail.section", () => ctx.slots.register({
        name: "plugins.detail.section",
        id: "compat-layers",
        order: 20
      }, props => props?.subject?.kind === "bundle" && props.subject.pkg?.name === "@local/dsh-personal-customizations" ? react_jsx_runtime.jsx(CompatLayerSwitches, {}) : null));
    }
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
